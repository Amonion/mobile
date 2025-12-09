import { create } from 'zustand'
import { customRequest } from '@/lib/api'
import { AuthStore } from '../AuthStore'
import { getAll, upsertChats } from '@/lib/localStorage/db'

interface FetchResponse {
  unread: number
  count: number
  message: string
  page_size: number
  results: Notification[]
  data: Notification
}

export const NotificationEmpty = {
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

export interface Notification {
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

interface NotificationState {
  notifications: Notification[]
  unreadNotifications: number
  count: number
  isAllChecked: boolean
  hasMore: boolean
  loading: boolean
  currentPage: number
  page_size: number
  selectedNotifications: Notification[]
  getSavedNotifications: () => Promise<void>
  getMoreSavedNotifications: () => Promise<void>
  getNotifications: (url: string) => Promise<void>
  reshuffleResults: () => void
  setCurrentPage: (page: number) => void
  setProcessedResults: (data: FetchResponse) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  readNotifications: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => void
}

export const NotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadNotifications: 0,
  count: 0,
  unread: 0,
  isAllChecked: false,
  hasMore: false,
  loading: false,
  currentPage: 1,
  page_size: 20,
  selectedNotifications: [],

  getSavedNotifications: async () => {
    try {
      set({ loading: true })
      const notes = await getAll<Notification>('notifications', {
        page: 1,
        pageSize: 20,
        sortBy: '-createdAt',
      })
      if (notes.length > 0) {
        set({ notifications: notes })
      }
      NotificationStore.getState().setCurrentPage(2)
      const user = AuthStore.getState().user
      NotificationStore.getState().getNotifications(
        `/notifications/social/?page_size=${40}&page=${1}&ordering=-createdAt&receiverUsername=${
          user?.username
        }`
      )
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getNotifications: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set({ unreadNotifications: data.unread })
        const fetchedNotifications = data.results
        const first20 = fetchedNotifications.slice(0, 20)

        NotificationStore.setState((prev) => {
          const filtered = first20.filter(
            (item: Notification) =>
              !prev.notifications.some((n) => n._id === item._id)
          )

          return {
            notifications: [...filtered, ...prev.notifications],
          }
        })

        if (fetchedNotifications.length > 0) {
          upsertChats('notifications', fetchedNotifications)
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getMoreSavedNotifications: async () => {
    try {
      set({ loading: true })
      const page = NotificationStore.getState().currentPage
      const notes = await getAll<Notification>('notifications', {
        page,
        pageSize: 20,
        sortBy: '-createdAt',
      })
      if (notes.length > 0) {
        set((prev) => {
          return {
            notifications: [...notes, ...prev.notifications],
          }
        })
      }
      NotificationStore.getState().setCurrentPage(page + 1)
      const user = AuthStore.getState().user
      NotificationStore.getState().getNotifications(
        `/user-notifications/?page_size=${20}&page=${
          page + 1
        }&ordering=-createdAt&receiverUsername=${user?.username}`
      )
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getMoreNotifications: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set({ unreadNotifications: data.unread })
        const fetchedNotifications = data.results
        if (fetchedNotifications.length > 0) {
          upsertChats('notifications', fetchedNotifications)
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page })
  },

  reshuffleResults: async () => {
    set((state) => ({
      notifications: state.notifications.map((item: Notification) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    const updatedResults = results.map((item: Notification) => ({
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
        Notifications: updatedResults,
      }
    })
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.notifications[index]?.isActive
      const updatedResults = state.notifications.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        notifications: updatedResults,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.notifications.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.notifications.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        notifications: updatedResults,
        selectedNotifications: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.notifications.map((tertiary, idx) =>
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
        notifications: updatedResults,
        selectedNotifications: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  readNotifications: async (url, updatedItem) => {
    set({ loading: true })
    const response = await customRequest({
      url,
      method: 'PATCH',
      showMessage: true,
      data: updatedItem,
    })
    const data = response?.data
    if (data) {
      set({ loading: false, unreadNotifications: data.unread })
    }
  },
}))
