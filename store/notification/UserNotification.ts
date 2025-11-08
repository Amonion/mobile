import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  unread: number
  count: number
  message: string
  page_size: number
  results: UserNotification[]
  data: UserNotification
}

export const UserNotificationEmpty = {
  _id: '',
  title: '',
  username: '',
  senderUsername: '',
  receiverUsername: '',
  senderName: '',
  receiverName: '',
  receiverPicture: '',
  senderPicture: '',
  content: '',
  userId: '',
  greetings: '',
  senderAddress: '',
  senderArea: '',
  senderState: '',
  senderCountry: '',
  receiverAddress: '',
  receiverArea: '',
  receiverState: '',
  receiverCountry: '',
  unread: false,
  createdAt: null,
}

interface UserNotificationState {
  officialMessages: UserNotification[]
  personalNotifications: UserNotification[]
  userNotification: UserNotification
  officialMessage: UserNotification
  socialNotifications: UserNotification[]
  unread: number
  officialUnread: number
  personalUnread: number
  count: number
  personalCount: number
  isAllChecked: boolean
  hasMorePersonalNotifications: boolean
  hasMoreSocialNotifications: boolean
  loading: boolean
  socialPage: number
  personalPage: number
  page_size: number
  selectedUserNotifications: UserNotification[]
  searchedUserNotifications: UserNotification[]

  deleteUserNotification: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>

  getPersonalNotifications: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getUserNotification: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getOfficialMessages: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getOfficialMessage: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getSocialNotifications: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  addMoreSocialNotifications: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  addMorePersonalNotifications: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  massDeleteUserNotifications: (
    url: string,
    selectedUserNotifications: UserNotification[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  reshuffleResults: () => void
  setPersonalPage: (page: number) => void
  setSocialPage: (page: number) => void
  searchUserNotification: (url: string) => void
  setProcessedResults: (data: FetchResponse) => void
  setSocialResults: (data: FetchResponse) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  readPersonalNotifications: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => void
  readSocialNotifications: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => void
}

export const UserNotificationStore = create<UserNotificationState>((set) => ({
  userNotification: UserNotificationEmpty,
  officialMessage: UserNotificationEmpty,
  officialMessages: [],
  personalNotifications: [],
  socialNotifications: [],
  personalCount: 0,
  personalUnread: 0,
  count: 0,
  officialUnread: 0,
  unread: 0,
  isAllChecked: false,
  hasMorePersonalNotifications: false,
  hasMoreSocialNotifications: false,
  loading: false,
  socialPage: 1,
  personalPage: 1,
  page_size: 20,
  selectedUserNotifications: [],
  searchedUserNotifications: [],

  deleteUserNotification: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      setMessage,
    })
    if (response) {
    }
  },

  getOfficialMessages: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, { setMessage })
      const data = response?.data

      if (data) {
        const updatedResults = data.results.map((item: UserNotification) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))

        set((state) => {
          return {
            hasMorePersonalNotifications:
              state.page_size === data.results.length,
            loading: false,
            personalCount: data.count,
            page_size: data.page_size,
            officialMessages: updatedResults,
          }
        })
        set({ unread: data.unread })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getOfficialMessage: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, { setMessage })
      const data = response?.data

      if (data) {
        set({ officialMessage: data.data })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getSocialNotifications: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, { setMessage })
      const data = response?.data

      if (data) {
        UserNotificationStore.getState().setSocialResults(data)
        set({ unread: data.unread })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addMoreSocialNotifications: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, { setMessage })
      const data = response?.data
      if (data) {
        UserNotificationStore.getState().setSocialResults(data)
        set({ unread: data.unread })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addMorePersonalNotifications: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, { setMessage })
      const data = response?.data
      if (data) {
        UserNotificationStore.getState().setProcessedResults(data)
        set({ personalUnread: data.unread })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getUserNotification: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, { setMessage })
      const data = response?.data
      if (data) {
        set({ userNotification: data.data })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getPersonalNotifications: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, { setMessage })
      const data = response?.data
      if (data) {
        UserNotificationStore.getState().setProcessedResults(data)
        set({ personalUnread: data.unread })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  massDeleteUserNotifications: async (
    url: string,
    selectedUserNotifications: UserNotification[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      set({ loading: true })
      await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: selectedUserNotifications,
        setMessage,
      })
    } catch (error) {
      console.log(error)
    }
  },

  setSocialPage: (page: number) => {
    set({ socialPage: page })
  },

  setPersonalPage: (page: number) => {
    set({ personalPage: page })
  },

  reshuffleResults: async () => {
    set((state) => ({
      personalNotifications: state.personalNotifications.map(
        (item: UserNotification) => ({
          ...item,
          isChecked: false,
          isActive: false,
        })
      ),
    }))
  },

  searchUserNotification: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: UserNotification) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedUserNotifications: updatedResults })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  }, 1000),

  setSocialResults: ({ count, page_size, results }: FetchResponse) => {
    const updatedResults = results.map((item: UserNotification) => ({
      ...item,
      isChecked: false,
      isActive: false,
    }))

    set((state) => {
      return {
        hasMoreSocialNotifications: state.page_size === results.length,
        loading: false,
        count,
        page_size,
        socialNotifications: updatedResults,
      }
    })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    const updatedResults = results.map((item: UserNotification) => ({
      ...item,
      isChecked: false,
      isActive: false,
    }))

    set((state) => {
      return {
        hasMorePersonalNotifications: state.page_size === results.length,
        loading: false,
        personalCount: count,
        page_size,
        personalNotifications: updatedResults,
      }
    })
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.personalNotifications[index]?.isActive
      const updatedResults = state.personalNotifications.map(
        (tertiary, idx) => ({
          ...tertiary,
          isActive: idx === index ? !isCurrentlyActive : false,
        })
      )
      return {
        personalNotifications: updatedResults,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.personalNotifications.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.personalNotifications.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        userNotifications: updatedResults,
        selectedUserNotifications: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.personalNotifications.map((tertiary, idx) =>
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
        userNotifications: updatedResults,
        selectedUserNotifications: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  readSocialNotifications: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
    })
    const data = response?.data
    if (data) {
      set({ loading: false, unread: data.unread })
    }
  },
  readPersonalNotifications: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
    })
    const data = response?.data
    if (data) {
      set({ loading: false, officialUnread: data.unread })
    }
  },
}))

export interface UserNotification {
  _id: string
  title: string
  senderUsername: string
  receiverUsername: string
  senderName: string
  receiverName: string
  receiverPicture: string
  senderPicture: string
  content: string
  userId: string
  greetings: string
  senderAddress: string
  senderArea: string
  senderState: string
  senderCountry: string
  receiverAddress: string
  receiverArea: string
  receiverState: string
  receiverCountry: string
  unread: boolean
  createdAt: Date | null
  isChecked?: boolean
  isActive?: boolean
}
