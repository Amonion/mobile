import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import { Office, OfficeEmpty } from '../utility/Office'

export interface StaffSubject {
  officeUsername: string
  subject: string
  level: number
  levelName: string
  bioUserUsername: string
  staffPicture: string
  name: string
}

export const StaffSubjectEmpty = {
  officeUsername: '',
  subject: '',
  level: 0,
  levelName: '',
  bioUserUsername: '',
  staffPicture: '',
  name: '',
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  unreadStaffs: number
  results: Office[]
  data: Office
}

interface FetchStaffResponse {
  message: string
  count: number
  page_size: number
  unreadStaffs: number
  results: StaffSubject[]
  data: StaffSubject
}

interface StudentState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  currentPage: number
  applicantPage: number
  staffSubjects: StaffSubject[]
  students: Office[]
  staff: Office
  applicants: Office[]
  inactives: Office[]
  loadingOffice: boolean
  error: string | null
  successs?: string | null
  selectedStudents: Office[]
  selectedApplicants: Office[]
  searchedStudents: Office[]
  isDivisionDisplayed: boolean
  isAllChecked: boolean
  isAllApplicantsChecked: boolean
  officeForm: Office
  setOfficeForm: (key: keyof Office, value: Office[keyof Office]) => void
  resetStaffForm: () => void
  getStudents: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getStaffSubjects: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getStudent: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getApplicants: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setOffice: (item: Office) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setStudentResults: (data: FetchResponse) => void
  setDisplayedDivision: (status: boolean) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedStudents: Office[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateStudent: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  updateApplicants: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postItem: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (id: string) => void
  toggleCheckedApplicants: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleStudents: () => void
  searchStudent: (url: string) => void
}

const StudentStore = create<StudentState>((set) => ({
  links: null,
  count: 0,
  applicantCount: 0,
  currentPage: 1,
  applicantPage: 1,
  page_size: 20,
  unreadStaffs: 0,
  students: [],
  staffSubjects: [],
  applicants: [],
  inactives: [],
  loadingOffice: false,
  error: null,
  selectedApplicants: [],
  selectedStudents: [],
  searchedStudents: [],
  isDivisionDisplayed: false,
  isAllChecked: false,
  isAllApplicantsChecked: false,
  officeForm: OfficeEmpty,
  staff: OfficeEmpty,
  setOfficeForm: (key, value) =>
    set((state) => ({
      officeForm: {
        ...state.officeForm,
        [key]: value,
      },
    })),

  resetStaffForm: () =>
    set({
      officeForm: OfficeEmpty,
    }),

  setProcessedResults: ({ count, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Office) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        students: updatedResults,
      })
    }
  },

  setStudentResults: ({ count, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Office) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        students: updatedResults,
        selectedStudents: [],
      })
    }
  },

  setDisplayedDivision: (status: boolean) => {
    set({ isDivisionDisplayed: status })
  },
  setLoading: (loadState: boolean) => {
    set({ loadingOffice: loadState })
  },

  getStudent: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: StudentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ staff: data.data })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getStaffSubjects: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchStaffResponse>(url, {
        setMessage,
        setLoading: StudentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ staffSubjects: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getStudents: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: StudentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        StudentStore.getState().setStudentResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getApplicants: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: StudentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        const updatedResults = data.results.map((item: Office) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))

        set({
          count: data.count,
          applicants: updatedResults,
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  setOffice: async (item: Office) => {
    set({
      officeForm: { ...StudentStore.getState().officeForm, ...item },
    })
  },

  reshuffleStudents: async () => {
    set((state) => ({
      students: state.students.map((item: Office) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchStudent: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: StudentStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedStudents: results })
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedStudents: Office[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      body: selectedStudents,
      setMessage,
    })
    if (response) {
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
      StudentStore.getState().setProcessedResults(data)
    }
  },

  updateApplicants: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => {
    try {
      set({ loadingOffice: true, error: null })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: StudentStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        const updatedResults = data.results.map((item: Office) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))

        set({
          count: data.count,
          applicants: updatedResults,
        })
      }

      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    }
  },

  updateStudent: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => {
    try {
      set({ loadingOffice: true, error: null })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: StudentStore.getState().setLoading,
      })
      const data = response.data
      if (data.results) {
        StudentStore.getState().setStudentResults(data)
        if (redirect) redirect()
      }
    } catch (error) {
      console.log(error)
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loadingOffice: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: StudentStore.getState().setLoading,
    })
    const result = response?.data
    if (result) {
      StudentStore.getState().setProcessedResults(response?.data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.students[index]?.isActive
      const updatedResults = state.students.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        students: updatedResults,
      }
    })
  },

  toggleCheckedApplicants: (index: number) => {
    set((state) => {
      const applicants = state.applicants.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllApplicantsChecked = applicants.every(
        (tertiary) => tertiary.isChecked
      )
      const selectedApplicants = applicants.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        applicants,
        selectedApplicants,
        isAllApplicantsChecked,
      }
    })
  },

  toggleChecked: (id: string) => {
    set((state) => {
      const updatedResults = state.students.map((item) =>
        item._id === id ? { ...item, isChecked: !item.isChecked } : item
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedStaffs = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        students: updatedResults,
        selectedStudents: updatedSelectedStaffs,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.students.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.students.map((office) => ({
        ...office,
        isChecked: isAllChecked,
      }))

      const updatedSelectedStaffs = isAllChecked ? updatedResults : []

      return {
        students: updatedResults,
        selectedStudents: updatedSelectedStaffs,
        isAllChecked,
      }
    })
  },
}))

export default StudentStore
