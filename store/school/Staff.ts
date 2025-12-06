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

interface StaffState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  currentPage: number
  applicantPage: number
  unreadStaffs: number
  staffSubjects: StaffSubject[]
  staffs: Office[]
  staff: Office
  applicants: Office[]
  inactives: Office[]
  loadingOffice: boolean
  error: string | null
  successs?: string | null
  selectedItems: Office[]
  selectedApplicants: Office[]
  searchedStaffs: Office[]
  isAllChecked: boolean
  isAllApplicantsChecked: boolean
  officeForm: Office
  setOfficeForm: (key: keyof Office, value: Office[keyof Office]) => void
  resetStaffForm: () => void
  getStaffs: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getStaffSubjects: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getStaff: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getApplicants: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setOffice: (item: Office) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setStaffResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Office[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateStaff: (
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
  toggleChecked: (index: number) => void
  toggleCheckedApplicants: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchStaff: (url: string) => void
}

const StaffStore = create<StaffState>((set) => ({
  links: null,
  count: 0,
  applicantCount: 0,
  currentPage: 1,
  applicantPage: 1,
  page_size: 20,
  unreadStaffs: 0,
  staffs: [],
  staffSubjects: [],
  applicants: [],
  inactives: [],
  loadingOffice: false,
  error: null,
  selectedApplicants: [],
  selectedItems: [],
  searchedStaffs: [],
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

  setProcessedResults: ({ count, unreadStaffs, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Office) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        unreadStaffs,
        count,
        staffs: updatedResults,
      })
    }
  },

  setStaffResults: ({ count, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Office) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        staffs: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loadingOffice: loadState })
  },

  getStaff: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: StaffStore.getState().setLoading,
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
        setLoading: StaffStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ staffSubjects: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getStaffs: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: StaffStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        StaffStore.getState().setStaffResults(data)
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
        setLoading: StaffStore.getState().setLoading,
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
      officeForm: { ...StaffStore.getState().officeForm, ...item },
    })
  },

  reshuffleResults: async () => {
    set((state) => ({
      staffs: state.staffs.map((item: Office) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchStaff: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: StaffStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedStaffs: results })
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedItems: Office[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      body: selectedItems,
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
      StaffStore.getState().setProcessedResults(data)
    }
  },

  updateStaff: async (
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
        setLoading: StaffStore.getState().setLoading,
      })
      const data = response.data
      if (data.results) {
        StaffStore.getState().setStaffResults(data)
      }
      if (redirect) redirect()
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
      setLoading: StaffStore.getState().setLoading,
    })
    const result = response?.data
    if (result) {
      StaffStore.getState().setProcessedResults(response?.data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.staffs[index]?.isActive
      const updatedResults = state.staffs.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        staffs: updatedResults,
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

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.staffs.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedStaffs = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        staffs: updatedResults,
        selectedItems: updatedSelectedStaffs,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.staffs.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.staffs.map((office) => ({
        ...office,
        isChecked: isAllChecked,
      }))

      const updatedSelectedStaffs = isAllChecked ? updatedResults : []

      return {
        staffs: updatedResults,
        selectedItems: updatedSelectedStaffs,
        isAllChecked,
      }
    })
  },
}))

export default StaffStore
