import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { User } from '../user/User'
import { customRequest } from '@/lib/api'
import { getAll } from '@/lib/localStorage/db'

export interface Weekend {
  _id: string
  title: string
  instruction: string
  country: string
  continent: string
  levels: string
  question: string
  priority: string
  answer: string
  price: number
  video: string
  isPublished: boolean
  isMain: boolean
  isFeatured: boolean
  picture: string | File
  state: string
  area: string
  bioUserUsername: string
  bioUserDisplayName: string
  publishedAt: Date | null
  endAt: Date | null
  startAt: Date | null | string
  duration: number
  category: string
  backgroundColor: string
  createdAt: Date | null
  status: string
  likes: number
  bookmarks: number
  views: number
  comments: number
  shares: number
  liked: boolean
  bookmarked: boolean
  isChecked?: boolean
  isActive?: boolean
}

export const WeekendEmpty = {
  _id: '',
  title: '',
  instruction: '',
  country: '',
  continent: '',
  levels: '',
  question: '',
  bioUserDisplayName: '',
  backgroundColor: '',
  priority: '',
  answer: '',
  price: 0,
  video: '',
  picture: '',
  state: '',
  area: '',
  liked: false,
  bookmarked: false,
  isMain: false,
  isFeatured: false,
  isPublished: false,
  bioUserUsername: '',
  publishedAt: null,
  duration: 0,
  likes: 0,
  bookmarks: 0,
  views: 0,
  comments: 0,
  shares: 0,
  category: '',
  createdAt: null,
  startAt: null,
  endAt: null,
  status: '',
}

interface FetchResponse {
  message: string
  count: number
  attempt: number
  page_size: number
  results: Weekend[]
  data: Weekend
  weekend: Weekend
}

interface WeekendState {
  count: number
  page_size: number
  weekends: Weekend[]
  giveaways: Weekend[]
  searchedWeekends: Weekend[]
  loading: boolean
  selectedItems: Weekend[]
  searchedWeekendResults: Weekend[]
  hasMore: boolean
  isAllChecked: boolean
  weekendForm: Weekend
  setForm: (key: keyof Weekend, value: Weekend[keyof Weekend]) => void
  resetForm: () => void
  getWeekends: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getGiveaways: (url: string) => Promise<void>
  getMoreGiveaways: (url: string) => Promise<void>
  getSavedGiveaways: (user: User) => Promise<void>
  getMoreSavedGiveaways: (user: User) => Promise<void>
  getAWeekend: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  reshuffleResults: () => void
  clearSearchedWeekends: () => void
  searchWeekends: (url: string) => void
  getQueryWeekends: (url: string) => void
}

const WeekendStore = create<WeekendState>((set) => ({
  count: 0,
  page_size: 20,
  weekends: [],
  giveaways: [],
  searchedWeekends: [],
  loading: false,
  hasMore: true,
  selectedItems: [],
  searchedWeekendResults: [],
  isAllChecked: false,
  weekendForm: WeekendEmpty,
  setForm: (key, value) =>
    set((state) => ({
      weekendForm: {
        ...state.weekendForm,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      weekendForm: WeekendEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  clearSearchedWeekends: () => {
    set({
      searchedWeekendResults: [],
    })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Weekend) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        weekends: updatedResults,
      })
    }
  },

  getSavedGiveaways: async (user) => {
    try {
      const giveaways = await getAll<Weekend>('giveaway', {
        page: 1,
        pageSize: 20,
      })
      if (giveaways.length > 0) {
        set({ giveaways })
      }
      WeekendStore.getState().getGiveaways(
        `/weekends/giveaway/?subscriberId=${user?._id}&country=${user.country}&state=${user.state}&area=${user.area}&page_size=40&page=1`
      )
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getGiveaways: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        const storedGiveaway = WeekendStore.getState().giveaways
        if (storedGiveaway.length === 0) {
          set({ giveaways: data.results })
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getMoreSavedGiveaways: async (user) => {
    try {
      const giveaways = await getAll<Weekend>('giveaway', {
        page: 1,
        pageSize: 20,
      })
      if (giveaways.length > 0) {
        set({ giveaways })
      }
      WeekendStore.getState().getMoreGiveaways(
        `/weekends/giveaway/?subscriberId=${user?._id}&country=${user.country}&state=${user.state}&area=${user.area}&page_size=40&page=1`
      )
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getMoreGiveaways: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        const storedGiveaway = WeekendStore.getState().giveaways
        if (storedGiveaway.length === 0) {
          set({ giveaways: data.results })
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getWeekends: async (url: string) => {
    try {
      set({ loading: true })
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        WeekendStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getAWeekend: async (url: string) => {
    try {
      set({ loading: true })
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set({
          weekendForm: data.data,
        })
      }
    } catch (error: unknown) {
      console.error(error)
    } finally {
      set({ loading: false })
    }
  },

  getQueryWeekends: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedWeekends: data.results,
            loading: false,
            hasMore: data.results.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      weekends: state.weekends.map((item: Weekend) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchWeekends: _debounce(async (url: string) => {
    try {
      const response = await customRequest({ url })
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Weekend) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedWeekendResults: updatedResults })
      }
    } catch (error: unknown) {
      console.log(error)
      set({ loading: false })
    }
  }, 1000),
}))

export default WeekendStore
