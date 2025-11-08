import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { AuthStore } from './AuthStore'
import { User } from './User'
import apiRequest from '@/lib/axios'
import { BioUserState } from './BioUserState'
import { Post } from '../post/Post'
import { News } from '../news/News'

export interface IDDocs {
  name: string
  tempDoc: string
  doc: string | File
  docId: string
}

export interface FetchUser {
  count: number
  message: string
  id: string
  page_size: number
  followers: number
  isFollowed: boolean
  data: BioUser
  bioUser: BioUser
  bioUserState: BioUserState
  user: User
  posts: Post[]
  featuredNews: News[]
}

interface FetchUserResponse {
  count: number
  message: string
  page_size: number
  results: BioUser[]
  data: BioUser
  user: User
}

interface BioUsersState {
  bioUserForm: BioUser
  bioUsers: BioUser[]
  count: number
  isAllChecked: boolean
  loading: boolean
  page: number
  page_size: number
  selectedBioUsers: BioUser[]
  searchedBioUsers: BioUser[]

  deleteBioUser: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getBioUser: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getBioUsers: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  massDeleteBioUsers: (
    url: string,
    selectedUsers: BioUser[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  resetForm: () => void
  reshuffleResults: () => void
  setForm: (key: keyof BioUser, value: BioUser[keyof BioUser]) => void
  searchBioUser: (url: string) => void
  setProcessedResults: (data: FetchUserResponse) => void
  setBioUser: (data: BioUser) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  updateBioUser: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateMyBioUser: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
}

export interface BioUser {
  _id: string
  bioUserDisplayName: string
  bioUserIntro: string
  bioUserMedia: string
  bioUserPicture: string
  bioUserUsername: string
  authorityName: string
  authorityLevel: number
  createdAt: Date
  dateOfBirth: Date | null
  documents: IDDocs[]
  email: string
  firstName: string
  gender: string
  homeAddress: string
  homeArea: string
  homeContinent: string
  homeCountry: string
  homeCountrySymbol: string
  homeCountryFlag: string
  homePlaceId: string
  homeState: string
  isVerified: boolean
  isSuspended: boolean
  isActive?: boolean
  isChecked?: boolean
  lastName: string
  maritalStatus: string
  middleName: string
  motherName: string
  nextKinName: string
  nextKinPhoneNumber: string
  notificationToken: string
  occupation: string
  passport: string
  phone: string
  residentAddress: string
  residentArea: string
  residentContinent: string
  residentCountry: string
  residentCountryFlag: string
  residentCountrySymbol: string
  residentPlaceId: string
  residentState: string
  signupLocation: { lat: number; lng: number }
  signupIp: string
}

export const BioUserEmpty = {
  _id: '',
  bioUserDisplayName: '',
  bioUserIntro: '',
  bioUserMedia: '',
  bioUserPicture: '',
  bioUserUsername: '',
  createdAt: new Date(),
  dateOfBirth: null,
  documents: [],
  email: '',
  firstName: '',
  authorityName: '',
  authorityLevel: 0,
  gender: '',
  homeAddress: '',
  homeArea: '',
  homeContinent: '',
  homeCountry: '',
  homeCountryFlag: '',
  homeCountrySymbol: '',
  homePlaceId: '',
  homeState: '',
  isVerified: false,
  isSuspended: false,
  lastName: '',
  maritalStatus: '',
  middleName: '',
  motherName: '',
  nextKinName: '',
  nextKinPhoneNumber: '',
  notificationToken: '',
  occupation: '',
  passport: '',
  phone: '',
  residentAddress: '',
  residentArea: '',
  residentContinent: '',
  residentCountry: '',
  residentCountryFlag: '',
  residentCountrySymbol: '',
  residentPlaceId: '',
  residentState: '',
  signupLocation: { lat: 0, lng: 0 },
  signupIp: '',
}

export const BioUserStore = create<BioUsersState>((set) => ({
  bioUserForm: BioUserEmpty,
  bioUsers: [],
  count: 0,
  isAllChecked: false,
  loading: false,
  page: 1,
  page_size: 20,
  selectedBioUsers: [],
  searchedBioUsers: [],

  deleteBioUser: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchUser>(url, {
      method: 'PATCH',
      setMessage,
    })
    if (response) {
    }
  },

  getBioUser: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchUserResponse>(url, {
        setMessage,
      })
      const data = response?.data
      if (data) {
        set({
          bioUserForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      if (error) return
    }
  },

  getBioUsers: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchUserResponse>(url, { setMessage })
      const data = response?.data
      if (data) {
        BioUserStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  massDeleteBioUsers: async (
    url: string,
    selectedUsers: BioUser[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      set({
        loading: true,
      })
      await apiRequest<FetchUserResponse>(url, {
        method: 'POST',
        body: selectedUsers,
        setMessage,
      })
    } catch (error) {
      console.log(error)
    }
  },
  resetForm: () =>
    set({
      bioUserForm: BioUserEmpty,
    }),
  reshuffleResults: async () => {
    set((state) => ({
      bioUsers: state.bioUsers.map((item: BioUser) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },
  setForm: (key, value) =>
    set((state) => ({
      bioUserForm: {
        ...state.bioUserForm,
        [key]: value,
      },
    })),

  setBioUser: (user: BioUser) => {
    set({ bioUserForm: user })
  },

  searchBioUser: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchUserResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: BioUser) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedBioUsers: updatedResults })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  }, 1000),

  setProcessedResults: ({ count, page_size, results }: FetchUserResponse) => {
    const updatedResults = results.map((item: BioUser) => ({
      ...item,
      isChecked: false,
      isActive: false,
    }))

    set({
      loading: false,
      count,
      page_size,
      bioUsers: updatedResults,
    })
  },
  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.bioUsers[index]?.isActive
      const updatedResults = state.bioUsers.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        bioUsers: updatedResults,
      }
    })
  },
  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.bioUsers.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.bioUsers.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        bioUsers: updatedResults,
        selectedBioUsers: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.bioUsers.map((tertiary, idx) =>
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
        bioUsers: updatedResults,
        selectedBioUsers: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },
  updateBioUser: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchUser>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
    })
    const data = response?.data
    if (data) {
      AuthStore.getState().setUser(data.user)
    }
  },

  updateMyBioUser: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchUser>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
    })
    const data = response?.data
    if (data) {
      AuthStore.getState().setAllUser(data.bioUserState, data?.bioUser)
      set({
        bioUserForm: data.bioUser,
        loading: false,
      })
      if (redirect) redirect()
    }
  },
}))
