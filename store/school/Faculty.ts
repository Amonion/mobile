import { create } from 'zustand'
import { customRequest } from '@/lib/api'

export interface Faculty {
  _id: string
  schoolId: string
  school: string
  name: string
  username: string
  schoolUsername: string
  picture: string | File | null
  media: string | File | null
  description: string
  createdAt: Date | null
  isChecked?: boolean
  isActive?: boolean
}

export const FacultyEmpty = {
  _id: '',
  schoolId: '',
  school: '',
  name: '',
  username: '',
  schoolUsername: '',
  picture: '',
  media: '',
  description: '',
  createdAt: null,
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Faculty[]
}

interface FacultyState {
  count: number
  page_size: number
  faculties: Faculty[]
  loading: boolean
  selectedItems: Faculty[]
  isAllChecked: boolean
  facultyForm: Faculty
  setForm: (key: keyof Faculty, value: Faculty[keyof Faculty]) => void
  resetForm: () => void
  getFaculties: (url: string) => Promise<void>
  getFaculty: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
}

const FacultyStore = create<FacultyState>((set, get) => ({
  count: 0,
  page_size: 0,
  faculties: [],
  loading: false,
  selectedItems: [],
  isAllChecked: false,
  facultyForm: FacultyEmpty,
  setForm: (key, value) =>
    set((state) => ({
      facultyForm: {
        ...state.facultyForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      facultyForm: FacultyEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Faculty) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        faculties: updatedResults,
      })
    }
  },

  getFaculties: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        FacultyStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getFaculty: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set({
          facultyForm: { ...FacultyStore.getState().facultyForm, ...data },
          loading: false,
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      faculties: state.faculties.map((item: Faculty) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.faculties[index]?.isActive
      const updatedResults = state.faculties.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        faculties: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.faculties.map((tertiary, idx) =>
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
        faculties: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.faculties.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.faculties.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        faculties: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default FacultyStore
