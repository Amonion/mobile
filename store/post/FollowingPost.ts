import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { Post, PostEmpty } from './Post'
import { getAll, saveAll, upsert } from '@/lib/localStorage/db'
import { User } from '../user/User'
import { customRequest } from '@/lib/api'
import { isEqual } from 'lodash'

interface FetchPostResponse {
  count: number
  message: string
  page_size: number
  results: Post[]
}

export interface Media {
  type: string
  src: string
  postId: string
  replies: number
  preview: string
  content: string
  backgroundColor: string
}

interface PostState {
  count: number
  page_size: number
  currentPage: number
  currentIndex: number
  postResults: Post[]
  userMediaResults: Media[]
  selectedUserMedia: Media | null
  isMobile: boolean
  fitMode: boolean
  loading: boolean
  hasMore: boolean
  selectedPosts: Post[]
  searchResult: Post[]
  isAllChecked: boolean
  userPostForm: Post
  setForm: (key: keyof Post, value: Post[keyof Post]) => void
  resetForm: () => void
  getPosts: (url: string) => Promise<void>
  getMorePosts: (url: string) => Promise<void>
  getAPost: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchPostResponse) => void
  processMoreResults: (data: FetchPostResponse) => void
  removePosts: (id: string) => void
  getSavedPosts: (user: User) => void
  getMoreSavedPosts: (user: User) => void
  setLoading?: (loading: boolean) => void
  massDelete: (url: string, selectedPosts: Post[]) => Promise<void>
  deleteItem: (
    url: string,
    id: string,
    setMessage: (message: string, isError: boolean) => void,
    refreshUrl?: string
  ) => Promise<void>
  updatePost: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    setProgress?: (int: number) => void
  ) => Promise<void>
  togglePost: (index: number) => void
  toggleActive: (id: string) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchItem: (url: string) => void
  setIsMobile: (mobile: boolean) => void
  setFitMode: (mobile: boolean) => void
  setCurrentIndex: (index: number) => void
  setSelectedUserMedia: (media: Media | null) => void
}

const FollowingPostStore = create<PostState>((set, get) => ({
  links: null,
  count: 0,
  currentPage: 1,
  currentIndex: 0,
  page_size: 20,
  postResults: [],
  userMediaResults: [],
  selectedUserMedia: null,
  hasMore: false,
  loading: false,
  error: null,
  selectedPosts: [],
  searchResult: [],
  isMobile: false,
  fitMode: false,
  isAllChecked: false,
  userPostForm: PostEmpty,
  setForm: (key, value) =>
    set((state) => ({
      userPostForm: {
        ...state.userPostForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      userPostForm: PostEmpty,
    }),
  setIsMobile: (mobile: boolean) =>
    set({
      isMobile: mobile,
    }),
  setSelectedUserMedia: (media) =>
    set({
      selectedUserMedia: media,
    }),
  setFitMode: (mode: boolean) =>
    set({
      fitMode: mode,
    }),
  setCurrentIndex: (index: number) =>
    set({
      currentIndex: index,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchPostResponse) => {
    const updatedResults = results.map((item: Post) => ({
      ...item,
      isChecked: false,
      isActive: false,
    }))
    const userMediaResults: Media[] = []
    updatedResults.forEach((post) => {
      if (
        (Array.isArray(post.media) && post.media.length > 0) ||
        post.backgroundColor
      ) {
        if (post.backgroundColor) {
          userMediaResults.push({
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
            userMediaResults.push({
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
      loading: false,
      count,
      page_size,
      postResults: updatedResults,
      userMediaResults,
    })
  },

  processMoreResults: ({ count, page_size, results }: FetchPostResponse) => {
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

      const userMediaResults: Media[] = []
      updatedResults.forEach((post) => {
        if (
          (Array.isArray(post.media) && post.media.length > 0) ||
          post.backgroundColor
        ) {
          if (post.backgroundColor) {
            userMediaResults.push({
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
              userMediaResults.push({
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
        loading: false,
        count,
        page_size,
        postResults: [...state.postResults, ...uniqueResults],
        userMediaResults: [...state.userMediaResults, ...userMediaResults],
      }
    })
  },

  removePosts: (id: string) => {
    set((state) => ({
      postResults: state.postResults.filter((post) => post.postId !== id),
    }))
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  getAPost: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await customRequest({ url })

      const data = response?.data
      if (data) {
        set({
          userPostForm: {
            ...FollowingPostStore.getState().userPostForm,
            ...data,
          },
          loading: false,
        })
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getSavedPosts: async (user) => {
    try {
      set({ loading: true })
      const postResults = await getAll<Post>('following_posts', {
        page: 1,
        pageSize: 20,
        filter: { username: user.username },
      })

      if (postResults.length > 0) {
        set({ postResults: postResults })
      }
      FollowingPostStore.getState().getPosts(
        `/posts/following/?myId=${user?._id}&page_size=40&page=1&status=true`
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
        FollowingPostStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getMoreSavedPosts: async (user) => {
    try {
      set({ loading: true })
      const page = FollowingPostStore.getState().currentPage
      const pageSize = FollowingPostStore.getState().page_size
      const posts = await getAll<Post>('following_posts', { page, pageSize })
      if (posts.length > 0) {
        set((prev) => {
          const existingIds = new Set(prev.postResults.map((e) => e._id))
          const filtered = posts.filter((e) => !existingIds.has(e._id))
          return {
            postResults: [...prev.postResults, ...filtered],
          }
        })
      }

      FollowingPostStore.getState().getMorePosts(
        `/posts/following/?myId=${user?._id}&page_size=40&page=${
          page + 1
        }&status=true`
      )
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    } finally {
      set({ loading: false })
    }
  },

  getMorePosts: async (url: string) => {
    try {
      const response = await customRequest({ url })

      const data = response?.data
      if (data) {
        FollowingPostStore.getState().processMoreResults(data)
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

  searchItem: _debounce(async (url: string) => {
    try {
      const response = await customRequest({ url })
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Post) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchResult: updatedResults })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  }, 1000),

  massDelete: async (url: string, selectedPosts: Post[]) => {
    set({
      loading: true,
    })

    const response = await customRequest({
      url,
      method: 'POST',
      data: selectedPosts,
      showMessage: true,
    })
    if (response) {
    }
  },

  deleteItem: async (url: string, id: string) => {
    set({
      loading: true,
    })

    const response = await customRequest({
      url,
      method: 'DELETE',
      showMessage: true,
    })
    if (response) {
      set((state) => {
        const updatedResults = state.postResults.filter(
          (post) => post._id !== id
        )
        return {
          postResults: updatedResults,
          loading: false,
        }
      })
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => {
    set({ loading: true })
    const response = await customRequest({
      url,
      method: 'PATCH',
      showMessage: true,
      data: updatedItem,
    })
    const data = response?.data
    if (data) {
    }
  },

  updatePost: async (url, updatedItem) => {
    set({ loading: true })
    const response = await customRequest({
      url,
      method: 'PATCH',
      showMessage: true,
      data: updatedItem,
    })
    const data = response?.data
    if (data) {
      if (data.data) {
        FollowingPostStore.setState((state) => ({
          postResults: state.postResults.map((post) =>
            post._id === response.data?.data._id ? response.data?.data : post
          ),
        }))
      }
    }
  },

  toggleActive: (id: string) => {
    set((state) => {
      const updatedResults = state.postResults.map((tertiary) => ({
        ...tertiary,
        isActive: tertiary._id === id ? !tertiary.isActive : false,
      }))
      return {
        postResults: updatedResults,
      }
    })
  },

  togglePost: (index: number) => {
    set((state) => {
      const updatedResults = state.postResults.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedPosts = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        postResults: updatedResults,
        selectedPosts: updatedSelectedPosts,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.postResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.postResults.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedPosts = isAllChecked ? updatedResults : []

      return {
        results: updatedResults,
        selectedPosts: updatedSelectedPosts,
        isAllChecked,
      }
    })
  },
}))

export default FollowingPostStore
