import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import SchoolStore from '../school/School'

interface FetchResponse {
  unreadSocials: number
  unread: number
  count: number
  message: string
  page_size: number
  results: OfficeNotification[]
  data: OfficeNotification
}

export const OfficeNotificationEmpty = {
  _id: '',
  title: '',
  senderName: '',
  receiverName: '',
  senderUsername: '',
  receiverUsername: '',
  senderPicture: '',
  receiverPicture: '',
  senderAddress: '',
  senderArea: '',
  senderState: '',
  senderCountry: '',
  receiverAddress: '',
  receiverArea: '',
  receiverState: '',
  receiverCountry: '',
  content: '',
  userId: '',
  greetings: '',
  unread: false,
  createdAt: null,
}

interface OfficeNotificationState {
  officeSocialNotifications: OfficeNotification[]
  officialMessages: OfficeNotification[]
  officialMessage: OfficeNotification
  unreadSocials: number
  unread: number
  socialCount: number
  count: number
  isAllChecked: boolean
  loading: boolean
  page: number
  socialPage: number
  page_size: number
  selectedOfficialMessages: OfficeNotification[]
  searchedOfficialMessages: OfficeNotification[]

  deleteOfficialMessage: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>

  getOfficialMessages: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>

  getOfficeSocialNotifications: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>

  getOfficialMessage: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>

  massDeleteOfficialMessages: (
    url: string,
    selectedOfficialMessages: OfficeNotification[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  reshuffleResults: () => void
  searchOfficeNotification: (url: string) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  readOfficeNotification: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => void
  readOfficialSocialNotifications: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => void
}

export const OfficeNotificationStore = create<OfficeNotificationState>(
  (set) => ({
    officeSocialNotifications: [],
    officialMessages: [],
    officialMessage: OfficeNotificationEmpty,
    count: 0,
    socialCount: 0,
    unread: 0,
    unreadSocials: 0,
    isAllChecked: false,
    loading: false,
    page: 1,
    socialPage: 1,
    page_size: 20,
    selectedOfficialMessages: [],
    searchedOfficialMessages: [],

    deleteOfficialMessage: async (
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

    getOfficeSocialNotifications: async (
      url: string,
      setMessage: (message: string, isError: boolean) => void
    ) => {
      try {
        const response = await apiRequest<FetchResponse>(url, { setMessage })
        const data = response?.data

        if (data) {
          const updatedResults = data.results.map(
            (item: OfficeNotification) => ({
              ...item,
              isChecked: false,
              isActive: false,
            })
          )
          set({
            loading: false,
            socialCount: data.count,
            officeSocialNotifications: updatedResults,
          })
        }
      } catch (error: unknown) {
        console.log(error)
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
          const updatedResults = data.results.map(
            (item: OfficeNotification) => ({
              ...item,
              isChecked: false,
              isActive: false,
            })
          )
          set({
            loading: false,
            count: data.count,
            officialMessages: updatedResults,
          })
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

    massDeleteOfficialMessages: async (
      url: string,
      selectedOfficialMessages: OfficeNotification[],
      setMessage: (message: string, isError: boolean) => void
    ) => {
      try {
        set({ loading: true })
        await apiRequest<FetchResponse>(url, {
          method: 'POST',
          body: selectedOfficialMessages,
          setMessage,
        })
      } catch (error) {
        console.log(error)
      }
    },

    reshuffleResults: async () => {
      set((state) => ({
        officialMessages: state.officialMessages.map(
          (item: OfficeNotification) => ({
            ...item,
            isChecked: false,
            isActive: false,
          })
        ),
      }))
    },

    searchOfficeNotification: _debounce(async (url: string) => {
      try {
        const response = await apiRequest<FetchResponse>(url)
        if (response) {
          const { results } = response?.data
          const updatedResults = results.map((item: OfficeNotification) => ({
            ...item,
            isChecked: false,
            isActive: false,
          }))
          set({ searchedOfficialMessages: updatedResults })
        }
      } catch (error: unknown) {
        console.log(error)
      }
    }, 1000),

    toggleActive: (index: number) => {
      set((state) => {
        const isCurrentlyActive = state.officialMessages[index]?.isActive
        const updatedResults = state.officialMessages.map((tertiary, idx) => ({
          ...tertiary,
          isActive: idx === index ? !isCurrentlyActive : false,
        }))
        return {
          officialMessages: updatedResults,
        }
      })
    },

    toggleAllSelected: () => {
      set((state) => {
        const isAllChecked =
          state.officialMessages.length === 0 ? false : !state.isAllChecked
        const updatedResults = state.officialMessages.map((item) => ({
          ...item,
          isChecked: isAllChecked,
        }))

        const updatedSelectedItems = isAllChecked ? updatedResults : []

        return {
          officialMessages: updatedResults,
          selectedOfficialMessages: updatedSelectedItems,
          isAllChecked,
        }
      })
    },

    toggleChecked: (index: number) => {
      set((state) => {
        const updatedResults = state.officialMessages.map((tertiary, idx) =>
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
          officialMessages: updatedResults,
          selectedOfficialMessages: updatedSelectedItems,
          isAllChecked: isAllChecked,
        }
      })
    },

    readOfficialSocialNotifications: async (
      url: string,
      updatedItem: FormData | Record<string, unknown>,
      setMessage: (message: string, isError: boolean) => void
    ) => {
      try {
        set({ loading: true })
        const response = await apiRequest<FetchResponse>(url, {
          method: 'PATCH',
          body: updatedItem,
          setMessage,
        })
        const data = response?.data
        if (data) {
          SchoolStore.setState({ unreadNotifications: data.unread })
        }
      } catch (error) {
        console.log(error)
      } finally {
        set({ loading: false })
      }
    },

    readOfficeNotification: async (
      url: string,
      updatedItem: FormData | Record<string, unknown>,
      setMessage: (message: string, isError: boolean) => void
    ) => {
      try {
        set({ loading: true })
        const response = await apiRequest<FetchResponse>(url, {
          method: 'PATCH',
          body: updatedItem,
          setMessage,
        })
        const data = response?.data
        if (data) {
          SchoolStore.setState({ unreadMessages: data.unread })
        }
      } catch (error) {
        console.log(error)
      } finally {
        set({ loading: false })
      }
    },
  })
)

export interface OfficeNotification {
  _id: string
  title: string
  senderName: string
  receiverName: string
  senderUsername: string
  receiverUsername: string
  senderPicture: string
  receiverPicture: string
  senderAddress: string
  senderArea: string
  senderState: string
  senderCountry: string
  receiverAddress: string
  receiverArea: string
  receiverState: string
  receiverCountry: string
  content: string
  userId: string
  greetings: string
  unread: boolean
  createdAt: Date | null
  isChecked?: boolean
  isActive?: boolean
}
