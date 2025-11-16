import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: SchoolQuestion[]
  zipCode: string
  area: string
  data: SchoolQuestion
}

export interface SchoolQuestion {
  _id: string
  username: string
  name: string
  officeType: string
  subject: string
  level: number
  levelName: string
  title: string
  subtitle: string
  instruction: string
  randomize: boolean
  showResult: boolean
  isEditable: boolean
  simultaneous: boolean
  isOn: boolean
  isExpired: boolean
  type: string
  status: string
  from: string
  totalQuestions: number
  duration: number
  questionsPerPage: number
  optionsPerQuestion: number
  publishingTime: number | null
  startingTime: number | null
  questionDate: Date | null
  publishedAt: Date | null
  isActive?: boolean
  isChecked?: boolean
}

export const SchoolQuestionEmpty = {
  _id: '',
  name: '',
  username: '',
  officeType: '',
  subject: '',
  title: '',
  subtitle: '',
  level: 0,
  levelName: '',
  instruction: '',
  randomize: false,
  showResult: false,
  isEditable: false,
  simultaneous: false,
  isOn: false,
  isExpired: false,
  type: 'Objective',
  status: '',
  from: '',
  duration: 0,
  questionsPerPage: 10,
  totalQuestions: 0,
  optionsPerQuestion: 4,
  startingTime: null,
  publishingTime: null,
  questionDate: null,
  publishedAt: null,
}

interface QuestionState {
  count: number
  currentPage: number
  page_size: number
  questions: SchoolQuestion[]
  loadingQuestions: boolean
  selectedQuestions: SchoolQuestion[]
  searchedQuestions: SchoolQuestion[]
  isAllQuestionsChecked: boolean
  questionForm: SchoolQuestion
  setQuestionForm: (
    key: keyof SchoolQuestion,
    value: SchoolQuestion[keyof SchoolQuestion]
  ) => void
  resetQuestion: () => void
  getQuestions: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getOneQuestion: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    isNew?: boolean
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDeleteQuestions: (
    url: string,
    selectedQuestions: SchoolQuestion[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteQuestion: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateQuestion: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postQuestion: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleCheckedQuestion: (id: string) => void
  toggleActiveQuestion: (index: number) => void
  toggleAllSelectedQuestions: () => void
  reshuffleQuestions: () => void
  searchQuestion: (url: string) => void
}

const QuestionPaperStore = create<QuestionState>((set) => ({
  count: 0,
  currentPage: 1,
  page_size: 20,
  questions: [],
  loadingQuestions: false,
  selectedQuestions: [],
  searchedQuestions: [],
  isAllQuestionsChecked: false,
  activeArea: SchoolQuestionEmpty,
  questionForm: SchoolQuestionEmpty,
  setQuestionForm: (key, value) =>
    set((state) => ({
      questionForm: {
        ...state.questionForm,
        [key]: value,
      },
    })),
  resetQuestion: () =>
    set({
      questionForm: SchoolQuestionEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: SchoolQuestion) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        questions: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loadingQuestions: loadState })
  },

  getQuestions: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: QuestionPaperStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        QuestionPaperStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getOneQuestion: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: QuestionPaperStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          questionForm: data.data,
          loadingQuestions: false,
        })
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  reshuffleQuestions: async () => {
    set((state) => ({
      questions: state.questions.map((item: SchoolQuestion) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchQuestion: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: QuestionPaperStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedQuestions: results })
    }
  }, 1000),

  massDeleteQuestions: async (
    url: string,
    selectedQuestions: SchoolQuestion[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedQuestions,
      setMessage,
    })
    if (response) {
      console.log(response)
    }
  },

  deleteQuestion: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading,
    })
    const data = response?.data
    if (data) {
      QuestionPaperStore.getState().setProcessedResults(data)
    }
  },

  updateQuestion: async (url, updatedItem, setMessage, redirect) => {
    set({ loadingQuestions: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: QuestionPaperStore.getState().setLoading,
    })
    if (response?.data) {
      QuestionPaperStore.getState().setProcessedResults(response.data)
    }
    if (redirect) redirect()
  },

  postQuestion: async (url, updatedItem, setMessage, redirect) => {
    set({ loadingQuestions: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: QuestionPaperStore.getState().setLoading,
    })
    console.log(response.data)
    if (response?.data) {
      QuestionPaperStore.getState().setProcessedResults(response.data)
    }
    if (redirect) redirect()
  },

  toggleActiveQuestion: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.questions[index]?.isActive
      const updatedResults = state.questions.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      const active = state.questions.find((_, int) => index === int)

      return {
        activeArea: active,
        questions: updatedResults,
      }
    })
  },

  toggleCheckedQuestion: (id: string) => {
    set((state) => {
      const updatedResults = state.questions.map((item) =>
        item._id === id ? { ...item, isChecked: !item.isChecked } : item
      )

      const isAllQuestionsChecked = updatedResults.every(
        (item) => item.isChecked
      )
      const updatedSelectedItems = updatedResults.filter(
        (item) => item.isChecked
      )

      return {
        questions: updatedResults,
        selectedQuestions: updatedSelectedItems,
        isAllQuestionsChecked,
      }
    })
  },

  toggleAllSelectedQuestions: () => {
    set((state) => {
      const isAllQuestionsChecked =
        state.questions.length === 0 ? false : !state.isAllQuestionsChecked
      const updatedResults = state.questions.map((place) => ({
        ...place,
        isChecked: isAllQuestionsChecked,
      }))

      const updatedSelectedItems = isAllQuestionsChecked ? updatedResults : []

      return {
        questions: updatedResults,
        selectedQuestions: updatedSelectedItems,
        isAllQuestionsChecked,
      }
    })
  },
}))

export default QuestionPaperStore
