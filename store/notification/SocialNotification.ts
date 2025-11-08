import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  unread: number
  count: number
  message: string
  page_size: number
  results: SocialNotification[]
  data: SocialNotification
}

export const SocialNotificationEmpty = {
  _id: '',
  title: '',
  senderUsername: '',
  receiverUsername: '',
  senderName: '',
  receiverName: '',
  receiverPicture: '',
  senderPicture: '',
  content: '',
  greetings: '',
  unread: true,
  createdAt: null,
}

export interface SocialNotification {
  _id: string
  title: string
  senderUsername: string
  receiverUsername: string
  senderName: string
  receiverName: string
  receiverPicture: string
  senderPicture: string
  content: string
  greetings: string
  unread: boolean
  createdAt: Date | null
  isChecked?: boolean
  isActive?: boolean
}

interface SocialNotificationState {
  socialNotifications: SocialNotification[]
  unreadNotifications: number
  count: number
  isAllChecked: boolean
  hasMore: boolean
  loading: boolean
  currentPage: number
  page_size: number
  selectedNotifications: SocialNotification[]
  deleteNotification: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getNotifications: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  addMoreSocialNotifications: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  massDeleteNotifications: (
    url: string,
    selectedUserNotifications: SocialNotification[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  reshuffleResults: () => void
  setCurrentPage: (page: number) => void
  setProcessedResults: (data: FetchResponse) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  readNotifications: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => void
}

export const SocialNotificationStore = create<SocialNotificationState>(
  (set) => ({
    socialNotifications: [],
    unreadNotifications: 0,
    count: 0,
    unread: 0,
    isAllChecked: false,
    hasMore: false,
    loading: false,
    currentPage: 1,
    page_size: 20,
    selectedNotifications: [],

    deleteNotification: async (url, setMessage) => {
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

    addMoreSocialNotifications: async (
      url: string,
      setMessage: (message: string, isError: boolean) => void
    ) => {
      try {
        const response = await apiRequest<FetchResponse>(url, { setMessage })
        const data = response?.data
        if (data) {
          SocialNotificationStore.getState().setProcessedResults(data)
          set({ unreadNotifications: data.unread })
        }
      } catch (error: unknown) {
        console.log(error)
      }
    },

    getNotifications: async (
      url: string,
      setMessage: (message: string, isError: boolean) => void
    ) => {
      try {
        const response = await apiRequest<FetchResponse>(url, { setMessage })
        const data = response?.data
        if (data) {
          SocialNotificationStore.getState().setProcessedResults(data)
          set({ unreadNotifications: data.unread })
        }
      } catch (error: unknown) {
        console.log(error)
      }
    },

    massDeleteNotifications: async (
      url,
      selectedUserNotifications,
      setMessage
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

    setCurrentPage: (page: number) => {
      set({ currentPage: page })
    },

    reshuffleResults: async () => {
      set((state) => ({
        socialNotifications: state.socialNotifications.map(
          (item: SocialNotification) => ({
            ...item,
            isChecked: false,
            isActive: false,
          })
        ),
      }))
    },

    setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
      const updatedResults = results.map((item: SocialNotification) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set((state) => {
        return {
          hasMore: state.page_size === results.length,
          loading: false,
          count: count,
          page_size,
          socialNotifications: updatedResults,
        }
      })
    },

    toggleActive: (index: number) => {
      set((state) => {
        const isCurrentlyActive = state.socialNotifications[index]?.isActive
        const updatedResults = state.socialNotifications.map(
          (tertiary, idx) => ({
            ...tertiary,
            isActive: idx === index ? !isCurrentlyActive : false,
          })
        )
        return {
          socialNotifications: updatedResults,
        }
      })
    },

    toggleAllSelected: () => {
      set((state) => {
        const isAllChecked =
          state.socialNotifications.length === 0 ? false : !state.isAllChecked
        const updatedResults = state.socialNotifications.map((item) => ({
          ...item,
          isChecked: isAllChecked,
        }))

        const updatedSelectedItems = isAllChecked ? updatedResults : []

        return {
          socialNotifications: updatedResults,
          selectedNotifications: updatedSelectedItems,
          isAllChecked,
        }
      })
    },

    toggleChecked: (index: number) => {
      set((state) => {
        const updatedResults = state.socialNotifications.map((tertiary, idx) =>
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
          socialNotifications: updatedResults,
          selectedNotifications: updatedSelectedItems,
          isAllChecked: isAllChecked,
        }
      })
    },

    readNotifications: async (
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
        set({ loading: false, unreadNotifications: data.unread })
      }
    },
  })
)
