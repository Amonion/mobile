import { create } from 'zustand'
import { customRequest } from '@/lib/api'

export interface Department {
  _id: string
  facultyId: string
  schoolId: string
  faculty: string
  facultyUsername: string
  name: string
  username: string
  picture: string | File | null
  media: string | File | null
  description: string
  createdAt: Date | null
  isChecked?: boolean
  isActive?: boolean
}
export interface Position {
  _id: string
  levelName: string
  officeUsername: string
  bioUserUsername: string
  level: number
  staffPicture: string
  name: string
  arm: string
}

export const DepartmentEmpty = {
  _id: '',
  facultyId: '',
  schoolId: '',
  faculty: '',
  facultyUsername: '',
  name: '',
  username: '',
  picture: '',
  media: '',
  description: '',
  createdAt: null,
}
export const PositionEmpty = {
  _id: '',
  levelName: '',
  officeUsername: '',
  bioUserUsername: '',
  level: 0,
  staffPicture: '',
  name: '',
  arm: '',
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Department[]
}
interface FetchPositionResponse {
  message: string
  count: number
  page_size: number
  results: Position[]
}

interface DepartmentState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  positions: Position[]
  departments: Department[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Department[]
  searchedDepartments: Department[]
  isAllChecked: boolean
  departmentalForm: Department
  setForm: (key: keyof Department, value: Department[keyof Department]) => void
  resetForm: () => void
  getDepartments: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getStaffPositions: (url: string) => Promise<void>
  getDepartment: (url: string) => Promise<void>
  processPosition: (data: FetchPositionResponse) => void
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
}

const DepartmentStore = create<DepartmentState>((set, get) => ({
  links: null,
  count: 0,
  page_size: 0,
  departments: [],
  loading: false,
  error: null,
  selectedItems: [],
  positions: [],
  searchedDepartments: [],
  isAllChecked: false,
  departmentalForm: DepartmentEmpty,
  setForm: (key, value) =>
    set((state) => ({
      departmentalForm: {
        ...state.departmentalForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      departmentalForm: DepartmentEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  processPosition: ({ count, page_size, results }: FetchPositionResponse) => {
    if (results) {
      const updatedResults = results.map((item: Position) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        positions: updatedResults,
      })
    }
  },
  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Department) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        departments: updatedResults,
      })
    }
  },

  getDepartments: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        DepartmentStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getStaffPositions: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        DepartmentStore.getState().processPosition(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getDepartment: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set({
          departmentalForm: {
            ...DepartmentStore.getState().departmentalForm,
            ...data,
          },
          loading: false,
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      departments: state.departments.map((item: Department) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.departments[index]?.isActive
      const updatedResults = state.departments.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        departments: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.departments.map((tertiary, idx) =>
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
        departments: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.departments.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.departments.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        departments: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default DepartmentStore
