import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { customRequest } from '@/lib/api'
import { getAll } from '@/lib/localStorage/db'
import { AuthStore } from '../AuthStore'

interface FetchResponse {
  unread: number
  count: number
  message: string
  page_size: number
  results: PersonalNotification[]
  data: PersonalNotification
}

export interface PersonalNotification {
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

export const PersonalNotificationEmpty = {
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

interface PersonalNotificationState {
  personalNotifications: PersonalNotification[]
  personalUnread: number
  count: number
  isAllChecked: boolean
  hasMore: boolean
  loading: boolean
  personalPage: number
  page_size: number
  selectedNotifications: PersonalNotification[]
  searchedNotifications: PersonalNotification[]
  getPersonalNotifications: (url: string) => Promise<void>
  getSavedPersonalNotifications: () => Promise<void>
  getMoreSavedPersonalNotifications: () => Promise<void>
  addMorePersonalNotifications: (url: string) => Promise<void>
  massDeleteNotifications: (
    url: string,
    selectedNotifications: PersonalNotification[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  reshuffleResults: () => void
  setPersonalPage: (page: number) => void
  searchPersonalNotification: (url: string) => void
  setProcessedResults: (data: FetchResponse) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  readPersonalNotifications: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => void
}

export const PersonalNotificationStore = create<PersonalNotificationState>(
  (set) => ({
    personalNotifications: [],
    personalUnread: 0,
    count: 0,
    isAllChecked: false,
    hasMore: false,
    loading: false,
    personalPage: 1,
    page_size: 20,
    selectedNotifications: [],
    searchedNotifications: [],

    getSavedPersonalNotifications: async () => {
      try {
        set({ loading: true })
        const notes = await getAll<PersonalNotification>(
          'personal_notifications',
          {
            page: 1,
            pageSize: 20,
            sortBy: '-createdAt',
          }
        )
        if (notes.length > 0) {
          set({ personalNotifications: notes })
        }
        PersonalNotificationStore.getState().setPersonalPage(2)
        const user = AuthStore.getState().user
        PersonalNotificationStore.getState().getPersonalNotifications(
          `/notifications/personal/?page_size=${40}&page=${1}&ordering=-createdAt&receiverUsername=${
            user?.username
          }`
        )
      } catch (error: unknown) {
        console.log(error)
      } finally {
        set({ loading: false })
      }
    },

    getPersonalNotifications: async (url: string) => {
      try {
        const response = await customRequest({ url })
        const data = response?.data
        if (data) {
          PersonalNotificationStore.getState().setProcessedResults(data)
          set({ personalUnread: data.unread })
        }
      } catch (error: unknown) {
        console.log(error)
      }
    },

    getMoreSavedPersonalNotifications: async () => {
      try {
        set({ loading: true })
        const page = PersonalNotificationStore.getState().personalPage
        const notes = await getAll<PersonalNotification>(
          'personal_notifications',
          {
            page,
            pageSize: 20,
            sortBy: '-createdAt',
          }
        )
        if (notes.length > 0) {
          set((prev) => {
            return {
              personalNotifications: [...notes, ...prev.personalNotifications],
            }
          })
        }

        PersonalNotificationStore.getState().setPersonalPage(page + 1)
        const user = AuthStore.getState().user
        PersonalNotificationStore.getState().addMorePersonalNotifications(
          `/notifications/personal/?page_size=${20}&page=${
            page + 1
          }&ordering=-createdAt&receiverUsername=${user?.username}`
        )
      } catch (error: unknown) {
        console.log(error)
      } finally {
        set({ loading: false })
      }
    },

    addMorePersonalNotifications: async (url) => {
      try {
        const response = await customRequest({ url })
        const data = response?.data
        if (data) {
          PersonalNotificationStore.getState().setProcessedResults(data)
          set({ personalUnread: data.unread })
        }
      } catch (error: unknown) {
        console.log(error)
      }
    },

    massDeleteNotifications: async (url, selectedNotifications) => {
      try {
        set({ loading: true })
        const response = await customRequest({
          url,
          method: 'PATCH',
          showMessage: true,
          data: selectedNotifications,
        })
      } catch (error) {
        console.log(error)
      }
    },

    setPersonalPage: (page: number) => {
      set({ personalPage: page })
    },

    reshuffleResults: async () => {
      set((state) => ({
        personalNotifications: state.personalNotifications.map(
          (item: PersonalNotification) => ({
            ...item,
            isChecked: false,
            isActive: false,
          })
        ),
      }))
    },

    searchPersonalNotification: _debounce(async (url: string) => {
      try {
        const response = await customRequest({ url })
        if (response) {
          const { results } = response?.data
          const updatedResults = results.map((item: PersonalNotification) => ({
            ...item,
            isChecked: false,
            isActive: false,
          }))
          set({ searchedNotifications: updatedResults })
        }
      } catch (error: unknown) {
        console.log(error)
      }
    }, 1000),

    setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
      const updatedResults = results.map((item: PersonalNotification) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set((state) => {
        return {
          hasMore: state.page_size === results.length,
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
          PersonalNotifications: updatedResults,
          selectedNotifications: updatedSelectedItems,
          isAllChecked,
        }
      })
    },

    toggleChecked: (index: number) => {
      set((state) => {
        const updatedResults = state.personalNotifications.map(
          (tertiary, idx) =>
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
          PersonalNotifications: updatedResults,
          selectedNotifications: updatedSelectedItems,
          isAllChecked: isAllChecked,
        }
      })
    },

    readPersonalNotifications: async (
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
        set({ loading: false, personalUnread: data.unread })
      }
    },
  })
)
