import { create } from 'zustand'
import { customRequest } from '@/lib/api'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: UserExam[]
}

export interface UserExam {
  _id: string
  username: string
  userId: string
  picture: string
  paperId: string
  name: string
  title: string
  type: string
  instruction: string
  questions: number
  duration: number
  rate: number
  accuracy: number
  metric: number
  started: number
  ended: number
  attempts: number
  attemptedQuestions: number
  totalAnswered: number
  totalCorrectAnswer: number
  isChecked?: boolean
  isActive?: boolean
}

export const UserExamEmpty = {
  _id: '',
  username: '',
  userId: '',
  picture: '',
  paperId: '',
  name: '',
  title: '',
  type: '',
  instruction: '',
  questions: 0,
  duration: 0,
  rate: 0,
  accuracy: 0,
  metric: 0,
  started: 0,
  ended: 0,
  attempts: 0,
  attemptedQuestions: 0,
  totalAnswered: 0,
  totalCorrectAnswer: 0,
}

interface UserExamState {
  count: number
  page_size: number
  duration: number
  userExamResults: UserExam[]
  loading: boolean
  isAllChecked: boolean
  isActive: boolean
  userExamForm: UserExam
  setForm: (key: keyof UserExam, value: UserExam[keyof UserExam]) => void
  resetForm: () => void
  setUserExamForm: (form: UserExam) => void
  getUserExam: (url: string) => Promise<void>
  getExamParticipants: (url: string) => Promise<void>
  fetchQuestions: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  updateItem: (url: string, updatedItem: FormData) => Promise<void>
  updateUserExam: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  createUserExam: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
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
}

const UserExamStore = create<UserExamState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  duration: 0,
  userExamResults: [],
  loading: false,
  isActive: false,
  isAllChecked: false,
  userExamForm: UserExamEmpty,
  setForm: (key, value) =>
    set((state) => ({
      userExamForm: {
        ...state.userExamForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      userExamForm: UserExamEmpty,
    }),
  setUserExamForm: (form) =>
    set({
      userExamForm: form,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: UserExam) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        userExamResults: updatedResults,
      })
    }
  },

  getUserExam: async (url) => {
    try {
      const response = await customRequest({ url })

      const data = response?.data
      if (data.exam) {
        // console.log(data.exam)
        set({
          userExamForm: data.exam,
          duration: data.exam.started,
          isActive: data.exam.isActive,
        })
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  getExamParticipants: async (url) => {
    try {
      const response = await customRequest({ url })

      const data = response?.data
      if (data) {
        UserExamStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  fetchQuestions: async (url) => {
    const response = await customRequest({ url })
    const data = response?.data
    if (data) {
      UserExamStore.getState().setProcessedResults(data)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      userExamResults: state.userExamResults.map((item: UserExam) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  updateUserExam: async (url, updatedItem) => {
    const response = await customRequest({
      url,
      method: 'PATCH',
      showMessage: true,
      data: updatedItem,
    })
    const data = response.data
    if (data.exam) {
      set({
        userExamForm: data.exam,
        isActive: data.exam.isActive,
        duration: Number(data.exam.duration),
      })
    } else {
      set({ loading: false })
    }
  },

  createUserExam: async (url, updatedItem) => {
    const response = await customRequest({
      url,
      method: 'POST',
      showMessage: true,
      data: updatedItem,
    })

    const data = response?.data
    if (data.exam) {
      set({
        userExamForm: data.exam,
        isActive: data.exam.isActive,
        duration: Number(data.exam.duration * 60),
      })
    }
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
      UserExamStore.getState().setProcessedResults(response.data)
    } else {
      set({ loading: false })
    }
  },

  postItem: async (url, updatedItem) => {
    const response = await customRequest({
      url,
      method: 'POST',
      showMessage: true,
      data: updatedItem,
    })

    const data = response?.data
    if (data) {
      UserExamStore.getState().setProcessedResults(data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.userExamResults[index]?.isActive
      const updatedResults = state.userExamResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        userExamResults: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.userExamResults.map((tertiary, idx) =>
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
        userExamResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.userExamResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.userExamResults.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        userExamResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default UserExamStore
