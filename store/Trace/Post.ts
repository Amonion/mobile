import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { customRequest } from '@/lib/api'
import { clearTable, getAll, saveAll, upsert } from '@/lib/localStorage/db'
import { User } from '../user/User'
import { isEqual } from 'lodash'
import { IMedia, Post } from '../post/Post'

interface FetchPostResponse {
  count: number
  message: string
  page_size: number
  results: Post[]
}

interface PostState {
  count: number
  page_size: number
  currentPage: number
  currentIndex: number
  postResults: Post[]
  mediaResults: IMedia[]
  selectedMedia: IMedia | null
  loading: boolean
  searchedPostResult: Post[]
  searchedPosts: Post[]
  hasMore: boolean
  isPlaying: boolean
  getPosts: (url: string) => Promise<void>
  getSavedPosts: (user: User) => Promise<void>
  addMorePosts: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchPostResponse) => void
  processMoreResults: (data: FetchPostResponse) => void
  selectPoll: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  repostItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  updatePinPost: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  updatePost: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  deletePost: (url: string) => Promise<void>
  processPostMedia: (posts: Post[]) => void
  setSearchedResult: () => void
  searchPosts: (url: string) => void
  setSelectedMedia: (media: IMedia | null) => void
  setCurrentIndex: (index: number) => void
}

export const PostStore = create<PostState>((set, get) => ({
  count: 0,
  page_size: 20,
  currentPage: 1,
  currentIndex: 0,
  postResults: [],
  mediaResults: [],
  selectedMedia: null,
  loading: false,
  searchedPostResult: [],
  searchedPosts: [],
  hasMore: false,
  hasMoreSearch: true,
  isPlaying: true,

  setSelectedMedia: (media) =>
    set({
      selectedMedia: media,
    }),

  setCurrentIndex: (index: number) =>
    set({
      currentIndex: index,
    }),

  processMoreResults: ({ count, results }: FetchPostResponse) => {
    set((state) => {
      const updatedResults = results.map((item: Post) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      const existingIds = new Set(state.postResults.map((post) => post._id))
      const uniqueResults = updatedResults.filter(
        (post) => !existingIds.has(post._id)
      )

      const mediaResults: IMedia[] = []
      updatedResults.forEach((post) => {
        if (
          (Array.isArray(post.media) && post.media.length > 0) ||
          post.backgroundColor
        ) {
          if (post.backgroundColor) {
            mediaResults.push({
              postId: post._id,
              src: '',
              preview: '',
              type: 'poster',
              content: post.content,
              replies: post.replies,
              backgroundColor: post.backgroundColor,
            })
          } else {
            post.media.forEach((mediaItem) => {
              mediaResults.push({
                postId: post._id,
                src: mediaItem.source,
                preview: mediaItem.preview,
                type: post.backgroundColor ? 'poster' : mediaItem.type,
                content: post.content,
                replies: post.replies,
                backgroundColor: post.backgroundColor,
              })
            })
          }
        }
      })
      return {
        hasMore: state.page_size === results.length,
        loading: false,
        count,
        postResults: [...state.postResults, ...uniqueResults],
        mediaResults: [...state.mediaResults, ...mediaResults],
      }
    })
  },

  setProcessedResults: ({ count, results }: FetchPostResponse) => {
    set((state) => {
      const updatedResults = results.map((item: Post) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      const mediaResults: IMedia[] = []
      updatedResults.forEach((post) => {
        if (
          (Array.isArray(post.media) && post.media.length > 0) ||
          post.backgroundColor
        ) {
          if (post.backgroundColor) {
            mediaResults.push({
              postId: post._id,
              src: '',
              preview: '',
              type: 'poster',
              content: post.content,
              replies: post.replies,
              backgroundColor: post.backgroundColor,
            })
          } else {
            post.media.forEach((mediaItem) => {
              mediaResults.push({
                postId: post._id,
                src: mediaItem.source,
                preview: mediaItem.preview,
                type: post.backgroundColor ? 'poster' : mediaItem.type,
                content: post.content,
                replies: post.replies,
                backgroundColor: post.backgroundColor,
              })
            })
          }
        }
      })

      return {
        hasMore: state.page_size === results.length,
        loading: false,
        count,
        postResults: updatedResults,
        mediaResults: mediaResults,
      }
    })
  },

  processPostMedia: (posts) => {
    const mediaResults: IMedia[] = []
    posts.forEach((post) => {
      if (Array.isArray(post.media) && post.media.length > 0) {
        {
          post.media.forEach((mediaItem) => {
            mediaResults.push({
              postId: post._id,
              src: mediaItem.source,
              preview: mediaItem.preview,
              type: post.backgroundColor ? 'poster' : mediaItem.type,
              content: post.content,
              replies: post.replies,
              backgroundColor: post.backgroundColor,
            })
          })
        }
      }
    })
    set({
      mediaResults: mediaResults,
    })
  },

  setSearchedResult: () => {
    set((prev) => {
      return { searchedPosts: prev.searchedPostResult, searchedPostResult: [] }
    })
  },

  clearSearchedPosts: () => {
    set({ searchedPostResult: [] })
  },

  getSavedPosts: async (user) => {
    try {
      set({ loading: true })
      const postResults = await getAll<Post>('posts', { page: 1, pageSize: 20 })
      if (postResults.length > 0) {
        set({ postResults: postResults })
      }
      clearTable('posts')
      PostStore.getState().getPosts(
        `/posts/?myId=${user?._id}&page_size=40&page=1`
      )
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getPosts: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        const fetchedPosts = data.results
        const savedPosts = PostStore.getState().postResults
        const first20Fetched = fetchedPosts.slice(0, 20)

        const missingPosts = first20Fetched.filter(
          (apiPost: Post) =>
            !savedPosts.some((local) => local._id === apiPost._id)
        )

        let updatedSavedPosts = savedPosts

        if (missingPosts.length > 0) {
          updatedSavedPosts = [...savedPosts, ...missingPosts]
          set({ postResults: updatedSavedPosts })
          console.log(
            `📌 Added ${missingPosts.length} new post(s) from first 20 fetched posts.`
          )
        }

        if (savedPosts.length > 0) {
          const toUpsert = fetchedPosts.filter((apiItem: Post) => {
            const existing = savedPosts.find(
              (localItem) => localItem._id === apiItem._id
            )
            return !existing || !isEqual(existing, apiItem)
          })

          if (toUpsert.length > 0) {
            for (const item of toUpsert) {
              await upsert('posts', item)
            }
            console.log(
              `✅ Upserted ${toUpsert.length} featured posts item(s).`
            )
          } else {
            console.log('No new or updated featured posts to upsert.')
          }

          const results = PostStore.getState().postResults
          PostStore.getState().processPostMedia(results)
        } else {
          saveAll('posts', fetchedPosts)
          set({ postResults: fetchedPosts })
          PostStore.getState().processPostMedia(fetchedPosts)
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getQueryPosts: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedPosts: data.results,
            hasMoreSearch: data.results.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addMorePosts: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        PostStore.getState().processMoreResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      postResults: state.postResults.map((item: Post) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchPosts: _debounce(async (url: string) => {
    try {
      set({ loading: true })
      const response = await customRequest({ url })

      const { results } = response?.data
      if (results) {
        set({ searchedPostResult: results })
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  }, 1000),

  repostItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => {
    try {
      set({ loading: true })
      await customRequest({
        url,
        method: 'POST',
        showMessage: true,
        data: updatedItem,
      })
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  updatePinPost: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => {
    try {
      await customRequest({
        url,
        method: 'POST',
        showMessage: true,
        data: updatedItem,
      })
    } catch (error) {
      console.log(error)
    } finally {
    }
  },

  deletePost: async (url) => {
    set({ loading: true })

    const response = await customRequest({
      url,
      method: 'DELETE',
      showMessage: true,
    })
    const data = response?.data?.data
    if (data) {
      PostStore.setState((state) => ({
        postResults: state.postResults.map((post) =>
          post.userId === data.userId
            ? { ...post, followed: data.followed, isActive: false }
            : post
        ),
      }))
    }
  },

  updatePost: async (url, updatedItem) => {
    try {
      const response = await customRequest({
        url,
        method: 'PATCH',
        showMessage: true,
        data: updatedItem,
      })
      const data = response?.data?.data
      if (data) {
        upsert('posts', data)
        PostStore.setState((state) => ({
          postResults: state.postResults.map((post) =>
            post.userId === data.userId
              ? { ...post, followed: data.followed }
              : post
          ),
        }))
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  selectPoll: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => {
    set({ loading: true })

    await customRequest({
      url,
      method: 'POST',
      showMessage: true,
      data: updatedItem,
    })
  },
}))
