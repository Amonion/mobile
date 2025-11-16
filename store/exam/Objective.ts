import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import axios, { AxiosError } from 'axios'

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
  page_size: number
  currentPage: number
  objectiveResults: Objective[]
  loading: boolean
  selectedItems: Objective[]
  searchResult: Objective[]
  searchedResults: Objective[]
  isAllChecked: boolean
  objectiveForm: Objective
  setForm: (key: keyof Objective, value: Objective[keyof Objective]) => void
  resetForm: () => void
  getObjectives: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  fetchQuestions: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  setCurrentPage?: (page: number) => void
  massDelete: (
    url: string,
    refreshUrl: string,
    selectedItems: Objective[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchItem: (url: string) => void
}

const ObjectiveStore = create<ObjectiveState>((set, get) => ({
  links: null,
  count: 0,
  page_size: 10,
  currentPage: 1,
  objectiveResults: [],
  loading: false,
  selectedItems: [],
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

  getObjectives: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ObjectiveStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ObjectiveStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setMessage(error.response.data.message, false)
      } else {
        console.error('Failed to fetch staff:', error)
        setMessage('An unexpected error occurred.', false)
      }
    }
  },

  fetchQuestions: async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: ObjectiveStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      ObjectiveStore.getState().setProcessedResults(data)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      objectiveResults: state.objectiveResults.map((item: Objective) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchItem: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Objective) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedResults: updatedResults })
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

  massDelete: async (
    url: string,
    refreshUrl: string,
    updatedItem: Objective[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
    })
    if (response) {
      const getObjectives = get().getObjectives
      getObjectives(refreshUrl, setMessage)
    }
  },

  deleteItem: async (
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
      ObjectiveStore.getState().setProcessedResults(data)
    }
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: ObjectiveStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      set({ loading: false })
      ObjectiveStore.getState().setProcessedResults(response.data)
    } else {
      set({ loading: false })
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: ObjectiveStore.getState().setLoading,
    })

    const data = response?.data
    if (data) {
      ObjectiveStore.getState().setProcessedResults(data)
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
