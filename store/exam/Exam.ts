import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { AxiosError } from 'axios'
import { customRequest } from '@/lib/api'
import { getAll, saveAll, upsert, upsertAll } from '@/lib/localStorage/db'
import isEqual from 'lodash/isEqual'

export interface Exam {
  _id: string
  title: string
  instruction: string
  continents: string[]
  countries: string[]
  states: string[]
  academicLevels: string[]
  subtitle: string
  type: string
  name: string
  picture: string
  logo: string
  participants: number
  comments: number
  subjects: string
  randomize: boolean
  simultaneous: boolean
  showResult: boolean
  isEditable?: boolean
  eligibility: boolean
  publishedAt: Date | null | number
  createdAt: Date | null | number
  duration: number
  questions: number
  questionsPerPage: number
  optionsPerQuestion: number
  status: string
  isChecked?: boolean
  isActive?: boolean
}

export const ExamEmpty = {
  _id: '',
  title: '',
  instruction: '',
  continents: [],
  countries: [],
  states: [],
  academicLevels: [],
  subtitle: '',
  type: '',
  name: '',
  picture: '',
  logo: '',
  participants: 0,
  comments: 0,
  subjects: '',
  randomize: false,
  simultaneous: false,
  showResult: false,
  eligibility: false,
  publishedAt: null,
  createdAt: null,
  duration: 0,
  questions: 0,
  questionsPerPage: 0,
  optionsPerQuestion: 0,
  status: '',
}

interface FetchResponse {
  message: string
  count: number
  attempt: number
  page_size: number
  results: Exam[]
  data: Exam
  exam: Exam
}

interface ExamState {
  count: number
  attempt: number
  page_size: number
  currentPage: number
  exams: Exam[]
  searchedExams: Exam[]
  loading: boolean
  isStarting: boolean
  selectedItems: Exam[]
  searchResult: Exam[]
  searchedExamResults: Exam[]
  hasMore: boolean
  hasMoreSearch: boolean
  isAllChecked: boolean
  examForm: Exam
  setForm: (key: keyof Exam, value: Exam[keyof Exam]) => void
  resetForm: () => void
  setIsStarting: (state: boolean) => void
  setCurrentPage: (page: number) => void
  getExams: (url: string) => Promise<void>
  getSavedExams: () => Promise<void>
  getMoreSavedExams: () => Promise<void>
  getMoreExams: (url: string) => Promise<void>
  getExam: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  updateItem: (url: string, updatedItem: FormData) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  clearSearchedExams: () => void
  searchExams: (url: string) => void
  addMoreSearchItems: (url: string) => void
  getQueryExams: (url: string) => void
}

const ExamStore = create<ExamState>((set) => ({
  links: null,
  count: 0,
  attempt: 0,
  currentPage: 1,
  page_size: 20,
  exams: [],
  searchedExams: [],
  hasMore: true,
  loading: false,
  isStarting: false,
  hasMoreSearch: true,
  error: null,
  clickedIndex: null,
  selectedItems: [],
  searchResult: [],
  searchedExamResults: [],
  isAllChecked: false,
  examForm: ExamEmpty,

  setForm: (key, value) =>
    set((state) => ({
      examForm: {
        ...state.examForm,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      examForm: ExamEmpty,
    }),

  setIsStarting: (loadState: boolean) => {
    set({ isStarting: loadState })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page })
  },

  clearSearchedExams: () => {
    set({
      searchedExamResults: [],
    })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Exam) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        exams: updatedResults,
        currentPage: 2,
      })
    }
  },

  getMoreSavedExams: async () => {
    try {
      set({ loading: true })
      const page = ExamStore.getState().currentPage
      const pageSize = ExamStore.getState().page_size
      const exams = await getAll<Exam>('exams', { page, pageSize })
      if (exams.length > 0) {
        set((prev) => {
          const existingIds = new Set(prev.exams.map((e) => e._id))
          const filtered = exams.filter((e) => !existingIds.has(e._id))
          return {
            exams: [...prev.exams, ...filtered],
          }
        })
      }

      ExamStore.getState().getMoreExams(
        `/competitions/exams/?page_size=20&page=${page + 1}&ordering=-createdAt`
      )
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    } finally {
      set({ loading: false })
    }
  },

  getMoreExams: async (url) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        if (data.results.length > 0) {
          await upsertAll<Exam>('exams', data.results)
          set((prev) => {
            return {
              hasMore: data.count > data.results.length * prev.exams.length,
              currentPage: prev.currentPage + 1,
            }
          })
        } else {
          set((prev) => {
            return {
              hasMore: false,
            }
          })
        }
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    } finally {
      set({ loading: false })
    }
  },

  getSavedExams: async () => {
    try {
      set({ loading: true })
      const exams = await getAll<Exam>('exams', { page: 1, pageSize: 20 })
      if (exams.length > 0) {
        set({ exams: exams })
      }

      ExamStore.getState().getExams(
        `/competitions/exams/?page_size=40&page=1&ordering=-createdAt`
      )
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getExams: async (url) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      set({ currentPage: 2 })
      if (data) {
        const fetchedExams = data.results
        const savedNews = ExamStore.getState().exams

        if (savedNews.length > 0) {
          const toUpsert = fetchedExams.filter((apiItem: Exam) => {
            const existing = savedNews.find(
              (localItem) => localItem._id === apiItem._id
            )
            return !existing || !isEqual(existing, apiItem)
          })

          if (toUpsert.length > 0) {
            for (const item of toUpsert) {
              await upsert('exams', item)
            }

            console.log(`✅ Upserted ${toUpsert.length} exams item(s).`)
          } else {
            console.log('No new or updated featured news to upsert.')
          }
        } else {
          saveAll('exams', fetchedExams)
          set({ exams: data.results })
        }
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getExam: async (url) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set({
          examForm: { ...ExamStore.getState().examForm, ...data.exam },
          loading: false,
          attempt: data.attempt ? data.attempt : 0,
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addMoreSearchItems: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedExams: [...prev.searchedExams, ...data.results],
            loading: false,
            hasMoreSearch: data.results.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getQueryExams: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedExams: data.results,
            loading: false,
            hasMoreSearch: data.results.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      exams: state.exams.map((item: Exam) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchExams: _debounce(async (url: string) => {
    try {
      const response = await customRequest({ url })
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Exam) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedExamResults: updatedResults })
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        set({
          loading: false,
        })
      } else {
        set({
          loading: false,
        })
      }
    }
  }, 1000),

  updateItem: async (url, updatedItem) => {
    set({ loading: true })
    const response = await customRequest({
      url,
      method: 'PATCH',
      showMessage: true,
      data: updatedItem,
    })
    if (response?.status !== 404 && response?.data) {
      set({ loading: false })
      ExamStore.getState().setProcessedResults(response.data)
    } else {
      set({ loading: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.exams[index]?.isActive
      const updatedResults = state.exams.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        exams: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.exams.map((tertiary, idx) =>
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
        exams: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.exams.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.exams.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        exams: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default ExamStore
