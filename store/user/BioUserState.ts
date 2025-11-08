import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import { AuthStore } from './AuthStore'
import { User } from './User'

interface FetchResponse {
  count: number
  message: string
  page_size: number
  data: BioUserState
  results: BioUserState[]
  user: User
}

interface OfficeObj {
  name: string
  officeId: string
  type: string
  username: string
  position: string
  level: number
}

export interface BioUserState {
  pendingOffice: OfficeObj
  activeOffice: OfficeObj
  bioUserUsername: string
  bioUserId: string
  createdAt: Date
  examAttempts: number
  hasPastSchool: boolean
  isAccountOpen: boolean
  isAccountSet: boolean
  isActive: boolean
  isBio: boolean
  isContact: boolean
  isDocument: boolean
  isEducation: boolean
  isEducationDocument: boolean
  isEducationHistory: boolean
  isOnVerification: boolean
  isOrigin: boolean
  isPublic: boolean
  isRelated: boolean
  isVerified: boolean
  isChecked: boolean
  numberOfOffices: number
  offices: OfficeObj[]
  processingOffice: boolean
  verifyingAt: Date
  verifiedAt: Date
}

export const BioUserStateEmpty = {
  pendingOffice: {
    name: '',
    officeId: '',
    type: '',
    username: '',
    position: '',
    level: 0,
  },
  activeOffice: {
    name: '',
    officeId: '',
    type: '',
    username: '',
    position: '',
    level: 0,
  },
  bioUserUsername: '',
  bioUserId: '',
  createdAt: new Date(),
  examAttempts: 0,
  hasPastSchool: false,
  isAccountOpen: false,
  isAccountSet: false,
  isBio: false,
  isActive: false,
  isContact: false,
  isDocument: false,
  isEducation: false,
  isEducationDocument: false,
  isEducationHistory: false,
  isOnVerification: false,
  isOrigin: false,
  isPublic: false,
  isRelated: false,
  isVerified: false,
  isChecked: false,
  numberOfOffices: 0,
  offices: [],
  processingOffice: false,
  verifyingAt: new Date(),
  verifiedAt: new Date(),
}

interface BioUserStatesState {
  bioUserStateForm: BioUserState
  bioUsersState: BioUserState[]
  count: number
  page_size: number
  loading: boolean
  isAllChecked: boolean
  getBioUserState: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getBioUsersState: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  reshuffleResults: () => void
  resetForm: () => void
  setProcessedResults: (data: FetchResponse) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  updateBioUserState: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
}

export const BioUserStateStore = create<BioUserStatesState>((set) => ({
  bioUserStateForm: BioUserStateEmpty,
  bioUsersState: [],
  count: 0,
  page_size: 20,
  loading: false,
  isAllChecked: false,
  getBioUserState: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
      })
      const data = response?.data
      if (data) {
        set({
          bioUserStateForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      if (error) return
    }
  },

  getBioUsersState: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
      })
      const data = response?.data
      if (data) {
        BioUserStateStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      if (error) return
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      bioUsersState: state.bioUsersState.map((item: BioUserState) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },
  resetForm: () =>
    set({
      bioUserStateForm: BioUserStateEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    const updatedResults = results.map((item: BioUserState) => ({
      ...item,
      isChecked: false,
      isActive: false,
    }))

    set({
      loading: false,
      count,
      page_size,
      bioUsersState: updatedResults,
    })
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.bioUsersState[index]?.isActive
      const updatedResults = state.bioUsersState.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        bioUsersState: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.bioUsersState.map((tertiary, idx) =>
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
        bioUsersState: updatedResults,
        selectedUsers: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  updateBioUserState: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
    })
    const data = response?.data
    if (data) {
      AuthStore.getState().setUser(data.user)
    }
  },
}))
