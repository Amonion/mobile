import { create } from 'zustand'
import { PostStore } from './Post'
import { customRequest } from '@/lib/api'

interface FetchSocialResponse {
  count: number
  id: string
  accountUserId: string
  blocked: boolean
  message: string
  page_size: number
  results: SocialUser[]
}

export interface SocialUser {
  _id: string
  userId: string
  bioId: string
  displayName: string
  isVerified: boolean
  followerDisplayName: string
  username: string
  picture: string
  followerId: string
  followerUsername: string
  followerPicture: string
  followerIsVerified: boolean
  followed: boolean
  postId: string
  accountUserId: string
  accountUsername: string
  accountPicture: string
  accountDisplayName: boolean
  accountIsVerified: boolean
  isFollowerActive: boolean
}

export const SocialUserEmpty = {
  _id: '',
  userId: '',
  bioId: '',
  displayName: '',
  isVerified: 0,
  followerDisplayName: '',
  username: '',
  picture: '',
  followerId: '',
  followerUsername: '',
  followerPicture: '',
  followerIsVerified: 0,
  followed: 0,
  postId: '',
  accountUserId: '',
  accountUsername: '',
  accountPicture: '',
  accountDisplayName: 0,
  accountIsVerified: 0,
  isFollowerActive: 0,
}

interface PostState {
  followingsCount: number
  followersCount: number
  blockCount: number
  muteCount: number
  page_size: number
  currentFollowingsPage: number
  currentFollowersPage: number
  currentBlockedPage: number
  currentMutedPage: number
  followers: SocialUser[]
  followings: SocialUser[]
  blockedUsers: SocialUser[]
  mutedUsers: SocialUser[]
  loading: boolean

  hasMoreFollowings: boolean
  hasMoreFollowers: boolean
  hasMoreBlocks: boolean
  hasMoreMutes: boolean
  hasMoreBookmarks: boolean
  hasMoreFollowing: boolean

  fetchMoreFollowings: (url: string) => Promise<void>
  fetchMoreFollowers: (url: string) => Promise<void>
  fetchMoreBlockedUsers: (url: string) => Promise<void>
  fetchMoreMutedUsers: (url: string) => Promise<void>
  getFollowings: (url: string) => Promise<void>
  getFollowers: (url: string) => Promise<void>
  getBlockedUsers: (url: string) => Promise<void>
  getMutedUsers: (url: string) => Promise<void>

  setProcessedFollowersResults: (data: FetchSocialResponse) => void
  setProcessedFollowingsResults: (data: FetchSocialResponse) => void
  setProcessedMutedResults: (data: FetchSocialResponse) => void
  addMoreFollowings: (data: FetchSocialResponse) => void
  addMoreFollowers: (data: FetchSocialResponse) => void
  addMoreBlockedUsers: (data: FetchSocialResponse) => void
  addMoreMutedUsers: (data: FetchSocialResponse) => void
  setProcessedBlockedResults: (data: FetchSocialResponse) => void

  muteUser: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  unmuteUser: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  blockUser: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  unblockUser: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  unFollowUser: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  followUser: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>

  setCurrentFollowingsPage: (page: number) => void
  setCurrentFollowersPage: (page: number) => void
  setCurrentBlockedPage: (page: number) => void
  setCurrentMutedPage: (page: number) => void
  toggleActiveFollowers: (id: string) => void
}

const SocialStore = create<PostState>((set, get) => ({
  links: null,
  count: 0,
  followingsCount: 0,
  followersCount: 0,
  blockCount: 0,
  muteCount: 0,
  page_size: 10,
  currentPage: 1,
  currentFollowingsPage: 1,
  currentFollowersPage: 1,
  currentBlockedPage: 1,
  currentMutedPage: 1,
  postResults: [],
  followers: [],
  followings: [],
  mutedUsers: [],
  blockedUsers: [],
  loading: false,
  error: null,
  activePostId: null,
  selectedPosts: [],
  searchResult: [],
  hasMore: true,
  hasMoreFollowings: true,
  hasMoreFollowers: true,
  hasMoreBlocks: true,
  hasMoreMutes: true,
  hasMoreBookmarks: false,
  hasMoreFollowing: false,

  setProcessedFollowersResults: ({ count, results }: FetchSocialResponse) => {
    set((state) => {
      const updatedResults = results.map((item) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      return {
        hasMoreFollowers: state.currentFollowersPage * state.page_size < count,
        loading: false,
        followersCount: count,
        followers: updatedResults,
      }
    })
  },

  setProcessedFollowingsResults: ({ count, results }: FetchSocialResponse) => {
    set((state) => {
      const updatedResults = results.map((item) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      return {
        hasMoreFollowings:
          state.currentFollowingsPage * state.page_size < count,
        loading: false,
        followingsCount: count,
        followings: updatedResults,
      }
    })
  },

  setProcessedBlockedResults: ({ count, results }: FetchSocialResponse) => {
    set((state) => {
      const updatedResults = results.map((item) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      return {
        hasMoreBlocks: state.currentBlockedPage * state.page_size < count,
        loading: false,
        blockCount: count,
        blockedUsers: updatedResults,
      }
    })
  },

  setProcessedMutedResults: ({ count, results }: FetchSocialResponse) => {
    set((state) => {
      const updatedResults = results.map((item) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      return {
        hasMoreMutes: state.currentMutedPage * state.page_size < count,
        loading: false,
        muteCount: count,
        mutedUsers: updatedResults,
      }
    })
  },

  addMoreFollowings: ({ count, results }: FetchSocialResponse) => {
    set((state) => {
      const updatedResults = results.map((item: SocialUser) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      const existingIds = new Set(state.followings.map((post) => post._id))
      const uniqueResults = updatedResults.filter(
        (post) => !existingIds.has(post._id)
      )
      return {
        hasMoreFollowings:
          state.currentFollowingsPage * state.page_size < count,
        loading: false,
        followingsCount: count,
        followings: [...state.followings, ...uniqueResults],
      }
    })
  },

  addMoreFollowers: ({ count, results }: FetchSocialResponse) => {
    set((state) => {
      const updatedResults = results.map((item: SocialUser) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      const existingIds = new Set(state.followers.map((post) => post._id))
      const uniqueResults = updatedResults.filter(
        (post) => !existingIds.has(post._id)
      )
      return {
        hasMoreFollowers: state.currentFollowersPage * state.page_size < count,
        loading: false,
        count,
        followers: [...state.followers, ...uniqueResults],
      }
    })
  },

  addMoreBlockedUsers: ({ count, results }: FetchSocialResponse) => {
    set((state) => {
      const updatedResults = results.map((item: SocialUser) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      const existingIds = new Set(state.blockedUsers.map((post) => post._id))
      const uniqueResults = updatedResults.filter(
        (post) => !existingIds.has(post._id)
      )
      return {
        hasMoreBlocks: state.currentBlockedPage * state.page_size < count,
        loading: false,
        count,
        blockedUsers: [...state.blockedUsers, ...uniqueResults],
      }
    })
  },

  addMoreMutedUsers: ({ count, results }: FetchSocialResponse) => {
    set((state) => {
      const updatedResults = results.map((item: SocialUser) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      const existingIds = new Set(state.mutedUsers.map((post) => post._id))
      const uniqueResults = updatedResults.filter(
        (post) => !existingIds.has(post._id)
      )
      return {
        hasMoreMutes: state.currentMutedPage * state.page_size < count,
        loading: false,
        muteCount: count,
        mutedUsers: [...state.mutedUsers, ...uniqueResults],
      }
    })
  },

  setCurrentBlockedPage: (page) => {
    set({
      currentBlockedPage: page,
    })
  },

  setCurrentMutedPage: (page) => {
    set({
      currentMutedPage: page,
    })
  },

  setCurrentFollowingsPage: (page) => {
    set({
      currentFollowingsPage: page,
    })
  },

  setCurrentFollowersPage: (page) => {
    set({
      currentFollowingsPage: page,
    })
  },

  getFollowings: async (url: string) => {
    try {
      set({ loading: true })
      const response = await customRequest({ url })

      if (response?.data) {
        get().setProcessedFollowingsResults(response.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getFollowers: async (url: string) => {
    try {
      set({ loading: true })
      const response = await customRequest({ url })
      if (response?.data) {
        get().setProcessedFollowersResults(response.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getBlockedUsers: async (url: string) => {
    try {
      set({ loading: true })
      const response = await customRequest({ url })
      if (response?.data) {
        get().setProcessedBlockedResults(response.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getMutedUsers: async (url: string) => {
    try {
      set({ loading: true })
      const response = await customRequest({ url })
      if (response?.data) {
        get().setProcessedMutedResults(response.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  fetchMoreFollowings: async (url: string) => {
    try {
      set({ loading: true })
      const response = await customRequest({ url })
      if (response?.data) {
        get().addMoreFollowings(response.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  fetchMoreFollowers: async (url: string) => {
    try {
      set({ loading: true })
      const response = await customRequest({ url })
      if (response?.data) {
        get().addMoreFollowers(response.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  fetchMoreBlockedUsers: async (url: string) => {
    try {
      set({ loading: true })
      const response = await customRequest({ url })
      if (response?.data) {
        get().addMoreBlockedUsers(response.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  fetchMoreMutedUsers: async (url: string) => {
    try {
      set({ loading: true })
      const response = await customRequest({ url })
      if (response?.data) {
        get().addMoreMutedUsers(response.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  blockUser: async (url, updatedItem) => {
    try {
      set({ loading: true })

      const response = await customRequest({
        url,
        method: 'POST',
        showMessage: true,
        data: updatedItem,
      })
      const data = response?.data
      if (data) {
        PostStore.setState((state) => {
          return {
            postResults: state.postResults.map((post) =>
              post.userId === data.accountUserId
                ? { ...post, blocked: data.blocked }
                : post
            ),
            searchedPosts: state.searchedPosts.map((post) =>
              post.userId === data.accountUserId
                ? { ...post, blocked: data.blocked }
                : post
            ),
          }
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  unblockUser: async (url, updatedItem) => {
    try {
      set({ loading: true })

      const response = await customRequest({
        url,
        method: 'POST',
        showMessage: true,
        data: updatedItem,
      })
      const data = response?.data
      if (data) {
        set((state) => {
          const users = state.blockedUsers.filter(
            (item) => item.accountUserId !== data.id
          )
          return {
            blockedUsers: users,
          }
        })
        PostStore.setState((state) => {
          return {
            postResults: state.postResults.map((post) =>
              post.userId === data.id
                ? { ...post, blocked: false, isActive: false }
                : post
            ),
            searchedPosts: state.searchedPosts.map((post) =>
              post.userId === data.id
                ? { ...post, blocked: false, isActive: false }
                : post
            ),
          }
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  unmuteUser: async (url, updatedItem) => {
    try {
      set({ loading: true })
      const response = await customRequest({
        url,
        method: 'PATCH',
        showMessage: true,
        data: updatedItem,
      })
      const data = response?.data
      if (data) {
        set((state) => {
          const updatedFollwers = state.mutedUsers.filter(
            (item) => item.accountUserId !== data.id
          )
          return {
            mutedUsers: updatedFollwers,
          }
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  unFollowUser: async (url, updatedItem) => {
    try {
      set({ loading: true })

      const response = await customRequest({
        url,
        method: 'PATCH',
        showMessage: true,
        data: updatedItem,
      })
      const data = response?.data
      if (data) {
        set((state) => {
          const updatedFollwers = state.followers.filter(
            (item) => item.userId !== data.id
          )
          const updatedFollwings = state.followings.filter(
            (item) => item.userId !== data.id
          )
          return {
            followers: updatedFollwers,
            followings: updatedFollwings,
          }
        })
        PostStore.setState((state) => {
          return {
            postResults: state.postResults.map((post) =>
              post.userId === data.id
                ? { ...post, followed: false, isActive: false }
                : post
            ),
            searchedPosts: state.searchedPosts.map((post) =>
              post.userId === data.id
                ? { ...post, followed: false, isActive: false }
                : post
            ),
          }
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  followUser: async (url, updatedItem) => {
    try {
      set({ loading: true })

      const response = await customRequest({
        url,
        method: 'PATCH',
        showMessage: true,
        data: updatedItem,
      })
      const data = response?.data
      if (data) {
        set((state) => {
          const updatedFollwers = state.followers.filter(
            (item) => item.userId !== data.id
          )
          return {
            followers: updatedFollwers,
          }
        })
        PostStore.setState((state) => {
          return {
            postResults: state.postResults.map((post) =>
              post.userId === data.id ? { ...post, followed: true } : post
            ),
            searchedPosts: state.searchedPosts.map((post) =>
              post.userId === data.id ? { ...post, followed: true } : post
            ),
          }
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  muteUser: async (url, updatedItem) => {
    try {
      set({ loading: true })

      const response = await customRequest({
        url,
        method: 'PATCH',
        showMessage: true,
        data: updatedItem,
      })
      const data = response.data
      if (data) {
        PostStore.setState((state) => ({
          postResults: state.postResults.filter(
            (post) => post.userId !== data.accountUserId
          ),
          loading: false,
        }))
        PostStore.setState((state) => ({
          postResults: state.postResults.filter(
            (post) => post.userId !== data.accountUserId
          ),
          searchedPosts: state.searchedPosts.filter(
            (post) => post.userId !== data.accountUserId
          ),
          loading: false,
        }))
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  toggleActiveFollowers: (id: string) => {
    set((state) => {
      const updatedResults = state.followers.map((tertiary) => ({
        ...tertiary,
        isFollowerActive:
          tertiary._id === id ? !tertiary.isFollowerActive : false,
      }))
      return {
        followers: updatedResults,
      }
    })
  },
}))

export default SocialStore
