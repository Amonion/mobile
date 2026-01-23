import { create } from 'zustand'
import { customRequest } from '@/lib/api'
import { clearTable, getAll, upsertAll } from '@/lib/localStorage/db'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Objective[]
}

export interface IOption {
  index: number
  value: string
  isSelected: boolean
  isClicked: boolean
}

export interface Objective {
  _id: string
  index: number
  isClicked: boolean
  isSelected: boolean
  paperId: string
  question: string
  options: IOption[]
  isChecked?: boolean
  isActive?: boolean
}
export const ObjectiveEmpty = {
  _id: '',
  index: 0,
  isClicked: false,
  isSelected: false,
  paperId: '',
  question: '',
  options: [],
}

interface ObjectiveState {
  links: { next: string | null; previous: string | null } | null
  count: number
  resultsLength: number
  page_size: number
  currentPage: number
  objectiveResults: Objective[]
  questions: Objective[]
  lastQuestions: Objective[]
  answeredQuestions: number
  loading: boolean
  selectedItems: Objective[]
  searchResult: Objective[]
  searchedResults: Objective[]
  isAllChecked: boolean
  objectiveForm: Objective
  setForm: (key: keyof Objective, value: Objective[keyof Objective]) => void
  resetForm: () => void
  getObjectives: (url: string) => Promise<void>
  getQuestions: (p: number, l: number) => Promise<void>
  getLastQuestions: (p: number, l: number) => Promise<void>
  fetchQuestions: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  setCurrentPage?: (page: number) => void
  selectAnswer: (page: IOption, id: string) => void
  updateItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
}

const ObjectiveStore = create<ObjectiveState>((set, get) => ({
  links: null,
  count: 0,
  page_size: 10,
  currentPage: 1,
  objectiveResults: [],
  questions: [],
  lastQuestions: [],
  resultsLength: 0,
  loading: false,
  selectedItems: [],
  answeredQuestions: 0,
  searchResult: [],
  searchedResults: [],
  isAllChecked: false,
  objectiveForm: ObjectiveEmpty,
  setForm: (key, value) =>
    set((state) => ({
      objectiveForm: {
        ...state.objectiveForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      objectiveForm: ObjectiveEmpty,
    }),

  setCurrentPage: (page: number) => {
    set({ currentPage: page })
  },
  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Objective) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        objectiveResults: updatedResults,
      })
    }
  },

  selectAnswer: async (item, id) => {
    set((prev) => {
      const updatedQuestions = prev.questions.map((question) =>
        question._id === id
          ? {
              ...question,
              isClicked: true,
              options: question.options.map((option) => ({
                ...option,
                isClicked: option.index === item.index,
              })),
            }
          : question
      )
      upsertAll('questions', updatedQuestions)
      return {
        questions: updatedQuestions,
      }
    })

    const totalQuestions = await getAll<Objective>('questions', {
      page: 1,
      pageSize: 100,
    })
    const answeredQuestions = totalQuestions.filter((item) => item.isClicked)
    set({ answeredQuestions: answeredQuestions.length })
  },

  getObjectives: async (url) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set({ resultsLength: data.results.length })
        clearTable('questions')
        clearTable('last_questions')
        upsertAll('questions', data.results)
        upsertAll('last_questions', data.lastQuestions)
      }
    } catch (error: unknown) {
      console.error('Failed to fetch objectives:', error)
    }
  },

  getQuestions: async (page_size, limit) => {
    try {
      const response = await getAll<Objective>('questions', {
        page: limit,
        pageSize: page_size,
      })
      if (response) {
        set({ questions: response })
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  getLastQuestions: async (page_size, page) => {
    try {
      const response = await getAll<Objective>('last_questions', {
        page: page,
        pageSize: page_size,
      })
      if (response) {
        set({ lastQuestions: response })
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  fetchQuestions: async (url: string) => {
    const response = await customRequest({ url })
    const data = response?.data
    if (data) {
      ObjectiveStore.getState().setProcessedResults(data)
    }
  },

  reshuffleResults: async () => {
    const response = await getAll<Objective>('questions', {
      page: 1,
      pageSize: 100,
    })

    const newQuestions = response.map((q) => ({
      ...q,
      isSelected: false,
      isClicked: false,
      options: q.options.map((o) => ({
        ...o,
        isSelected: false,
        isClicked: false,
      })),
    }))

    set((state) => ({
      questions: state.questions.map((q) => ({
        ...q,
        isSelected: false,
        isClicked: false,
        options: q.options.map((o) => ({
          ...o,
          isSelected: false,
          isClicked: false,
        })),
      })),
    }))

    clearTable('questions')
    upsertAll('questions', newQuestions)
  },

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
      ObjectiveStore.getState().setProcessedResults(response.data)
    } else {
      set({ loading: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.objectiveResults[index]?.isActive
      const updatedResults = state.objectiveResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        objectiveResults: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.objectiveResults.map((tertiary, idx) =>
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
        objectiveResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.objectiveResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.objectiveResults.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        objectiveResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default ObjectiveStore
