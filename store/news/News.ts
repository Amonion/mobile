import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { customRequest } from '@/lib/api'
import { getAll, saveAll } from '@/lib/localStorage/db'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: News[]
  mainNews: News[]
  featuredNews: News[]
  data: News
}

export interface News {
  _id: string
  placeId: string
  title: string
  priority: string
  content: string
  author: string
  publishedAt: Date | null | number
  createdAt: Date | null | number
  isPublished: boolean
  state: string
  country: string
  views: number
  shares: number
  comments: number
  bookmarks: number
  likes: number
  replies: number
  tags: string[]
  continent: string
  picture: string | File | null
  video: string | File | null
  videoUrl: string
  category: string
  subtitle: string
  source: string
  bookmarked: boolean
  liked: boolean
  isFeatured: boolean
  isMain: boolean
  seoTitle: string
  seoDescription: string
  isChecked?: boolean
  isActive?: boolean
}

export const NewsEmpty = {
  _id: '',
  placeId: '',
  title: '',
  priority: '',
  content: '',
  author: '',
  publishedAt: null,
  createdAt: null,
  isPublished: false,
  state: '',
  country: '',
  views: 0,
  replies: 0,
  comments: 0,
  shares: 0,
  bookmarks: 0,
  likes: 0,
  tags: [],
  continent: '',
  picture: '',
  video: '',
  videoUrl: '',
  category: '',
  subtitle: '',
  source: '',
  bookmarked: false,
  liked: false,
  isFeatured: false,
  isMain: false,
  seoTitle: '',
  seoDescription: '',
}

interface NewsState {
  count: number
  page_size: number
  news: News[]
  featuredNews: News[]
  mainNews: News[]
  loading: boolean
  selectedItems: News[]
  searchedNews: News[]
  isAllChecked: boolean
  newsForm: News
  setForm: (key: keyof News, value: News[keyof News]) => void
  resetForm: () => void
  getNews: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getSavedNews: () => void
  getANews: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  updateNews: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    redirect?: () => void
  ) => Promise<void>
  postItem: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchNews: (url: string) => void
}

const NewsStore = create<NewsState>((set) => ({
  count: 0,
  page_size: 0,
  news: [],
  featuredNews: [],
  mainNews: [],
  loading: false,
  selectedItems: [],
  searchedNews: [],
  isAllChecked: false,
  newsForm: NewsEmpty,
  setForm: (key, value) =>
    set((state) => ({
      newsForm: {
        ...state.newsForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      newsForm: NewsEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: News) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        news: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  getSavedNews: async () => {
    try {
      const featuredNews = await getAll<News>('featuredNews')
      const mainNews = await getAll<News>('mainNews')
      const news = await getAll<News>('news')
      if (featuredNews.length > 0) {
        set({ featuredNews })
      }
      if (mainNews.length > 0) {
        set({ mainNews })
      }
      if (news.length > 0) {
        set({ news })
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getNews: async (url: string) => {
    try {
      const response = await customRequest({ url })

      const data = response?.data
      if (data) {
        const featuredNews = data.results.filter(
          (item: News) => item.isFeatured
        )
        const savedFeaturedNews = NewsStore.getState().featuredNews
        if (featuredNews.length > 0) {
          const newNews: News[] = featuredNews.filter(
            (item: News) => !savedFeaturedNews.some((m) => m._id === item._id)
          )
          if (newNews.length > 0) {
            set((prev) => {
              return {
                featuredNews: [...prev.featuredNews, ...newNews],
              }
            })
            await saveAll('featuredNews', newNews)
          } else {
            console.log('No new featured news to add.')
          }
        }

        const mainNews = data.results.filter((item: News) => item.isMain)
        const savedMainNews = NewsStore.getState().mainNews
        if (mainNews.length > 0) {
          const newNews: News[] = mainNews.filter(
            (item: News) => !savedMainNews.some((m) => m._id === item._id)
          )
          if (newNews.length > 0) {
            set((prev) => {
              return {
                mainNews: [...prev.mainNews, ...newNews],
              }
            })
            await saveAll('mainNews', newNews)
          } else {
            console.log('No new main news to add.')
          }
        }

        const news = data.results.filter(
          (item: News) => !item.isMain && !item.isFeatured
        )
        const savedNews = NewsStore.getState().news
        if (news.length > 0) {
          const newNews: News[] = news.filter(
            (item: News) => !savedNews.some((m) => m._id === item._id)
          )
          if (newNews.length > 0) {
            set((prev) => {
              return {
                news: [...prev.news, ...newNews],
              }
            })
            await saveAll('news', newNews)
          } else {
            console.log('No new news to add.')
          }
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getANews: async (url: string) => {
    try {
      const response = await customRequest({ url })

      const data = response?.data
      if (data) {
        set({ newsForm: data.data })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      news: state.news.map((item: News) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchNews: _debounce(async (url: string) => {
    const response = await customRequest({ url })

    const results = response?.data.results
    if (results) {
      set({ searchedNews: results })
    }
  }, 1000),

  updateNews: async (url, updatedItem, redirect) => {
    set({ loading: true })
    const response = await customRequest({
      url,
      method: 'PATCH',
      showMessage: true,
      data: updatedItem,
    })
    if (response?.data) {
      NewsStore.getState().setProcessedResults(response.data)
    }
    if (redirect) redirect()
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => {
    set({ loading: true })
    const response = await customRequest({
      url,
      method: 'POST',
      showMessage: true,
      data: updatedItem,
    })
    if (response?.status !== 404 && response?.data) {
      NewsStore.getState().setProcessedResults(response.data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.news[index]?.isActive
      const updatedResults = state.news.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        news: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.news.map((tertiary, idx) =>
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
        news: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked = state.news.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.news.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        news: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default NewsStore
