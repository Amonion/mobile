import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { customRequest } from '@/lib/api'
import { AuthStore } from '../AuthStore'

interface FetchUserResponse {
  count: number
  message: string
  page_size: number
  results: User[]
  data: User
}

interface UserState {
  userForm: User
  users: User[]
  count: number
  isAllChecked: boolean
  loading: boolean
  page: number
  page_size: number
  selectedUsers: User[]
  searchedAccounts: User[]
  searchedAccountResults: User[]
  showProfileSheet: boolean
  authEmail: string
  authCode: string
  getUser: (
    url: string,
    setMessage?: (message: string, isError: boolean) => void
  ) => Promise<void>
  getUsers: (url: string) => Promise<void>
  getAccounts: (url: string) => Promise<void>
  resetForm: () => void
  reshuffleResults: () => void
  setForm: (key: keyof User, value: User[keyof User]) => void
  searchUser: (url: string) => void
  setSearchedUserResult: () => void
  setProcessedResults: (data: FetchUserResponse) => void
  setShowProfileSheet: (status: boolean) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  updateUser: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    redirect?: () => void
  ) => Promise<void>
  updateMyUser: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  deleteUserAccount: (url: string, redirect: () => void) => Promise<void>
}

export const UserEmpty = {
  _id: '',
  bioUserId: '',
  area: '',
  comments: 0,
  createdAt: new Date(),
  displayName: '',
  email: '',
  exams: 0,
  isSuspended: false,
  followed: false,
  followers: 0,
  followings: 0,
  intro: '',
  isFirstTime: false,
  isVerified: false,
  media: '',
  officeNum: 0,
  online: false,
  phone: '',
  picture: '',
  posts: 0,
  blocks: 0,
  mutes: 0,
  postMedia: 0,
  country: '',
  state: '',
  signupIp: '',
  signupLocation: { lat: 0, lng: 0 },
  staffPositions: [],
  staffRanking: 0,
  username: '',
  status: '',
}

export const UserStore = create<UserState>((set) => ({
  userForm: UserEmpty,
  users: [],
  count: 0,
  isAllChecked: false,
  loading: false,
  authEmail: '',
  authCode: '',
  page: 1,
  page_size: 20,
  selectedUsers: [],
  searchedAccounts: [],
  searchedAccountResults: [],
  showProfileSheet: false,

  getUser: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set({
          userForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      if (error) return
    }
  },

  getUsers: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        UserStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getAccounts: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set({ searchedAccountResults: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  resetForm: () =>
    set({
      userForm: UserEmpty,
    }),

  reshuffleResults: async () => {
    set((state) => ({
      users: state.users.map((item: User) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  setForm: (key, value) =>
    set((state) => ({
      userForm: {
        ...state.userForm,
        [key]: value,
      },
    })),

  setSearchedUserResult: () => {
    set((prev) => {
      return {
        hasMoreSearch: prev.searchedAccountResults.length > prev.page_size,
        searchedAccounts: prev.searchedAccountResults,
        searchedAccountResults: [],
      }
    })
  },

  searchUser: _debounce(async (url: string) => {
    try {
      const response = await customRequest({ url })
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: User) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedAccounts: updatedResults })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  }, 1000),

  setProcessedResults: ({ count, page_size, results }: FetchUserResponse) => {
    const updatedResults = results.map((item: User) => ({
      ...item,
      isChecked: false,
      isActive: false,
    }))

    set({
      loading: false,
      count,
      page_size,
      users: updatedResults,
    })
  },

  setShowProfileSheet: (status: boolean) => {
    set({ showProfileSheet: status })
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.users[index]?.isActive
      const updatedResults = state.users.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        users: updatedResults,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.users.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.users.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        users: updatedResults,
        selectedUsers: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.users.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedItems = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        users: updatedResults,
        selectedUsers: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  updateUser: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    redirect?: () => void
  ) => {
    set({ loading: true })
    try {
      const response = await customRequest({
        url,
        method: 'PATCH',
        showMessage: true,
        data: updatedItem,
      })
      const data = response?.data
      if (data) {
        AuthStore.getState().setUser(data.data)
        if (redirect) redirect()
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  updateMyUser: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => {
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
        if (!url.includes('follow')) {
          AuthStore.getState().setUser(data.data)
        }
        set({
          userForm: data.data,
          loading: false,
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  deleteUserAccount: async (url, redirect) => {
    try {
      set({ loading: true })
      await customRequest({
        url,
        method: 'DELETE',
        showMessage: true,
      })

      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },
}))

export interface User {
  _id: string
  bioUserId: string
  area: string
  comments: number
  createdAt: Date
  displayName: string
  email: string
  exams: number
  isSuspended: boolean
  followed: boolean
  followers: number
  followings: number
  mutes: number
  blocks: number
  intro: string
  isFirstTime: boolean
  isActive?: boolean
  isChecked?: boolean
  isVerified: boolean
  media: string
  officeNum: number
  postMedia: number
  online: boolean
  phone: string
  picture: string | File
  posts: number
  country: string
  state: string
  signupIp: string
  signupLocation: { lat: number; lng: number }
  staffPositions: string[]
  staffRanking: number
  status: string
  username: string
}
