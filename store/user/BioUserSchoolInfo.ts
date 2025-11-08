import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import { AcademicLevel, AcademicLevelEmpty } from '../school/Academic'
import { AuthStore } from '../user/AuthStore'
import { User } from '../user/User'
import { BioUser } from './BioUser'
import { BioUserState } from './BioUserState'

export const BioUserSchoolInfoEmpty = {
  _id: '',
  admittedAt: null,
  bioUserDisplayName: '',
  bioUserIntro: '',
  bioUserMedia: '',
  bioUserPicture: '',
  bioUserUsername: '',
  bioUserUserId: '',
  createdAt: new Date(),
  graduatedAt: null,
  hasPastSchool: null,
  inSchool: false,
  isAdvanced: false,
  isSchoolVerified: false,
  isVerified: false,
  schoolAcademicLevel: AcademicLevelEmpty,
  schoolArea: '',
  schoolArm: '',
  schoolClass: '',
  schoolClassLevel: '',
  schoolContinent: '',
  schoolCountry: '',
  schoolCountryFlag: '',
  schoolCountrySymbol: '',
  schoolDepartment: '',
  schoolDepartmentId: '',
  schoolDepartmentUsername: '',
  schoolFaculty: '',
  schoolFacultyId: '',
  schoolFacultyUsername: '',
  schoolId: '',
  schoolLogo: '',
  schoolName: '',
  schoolPicture: '',
  schoolPlaceId: '',
  schoolState: '',
  schoolCertificate: '',
  schoolTempCertificate: '',
  schoolUsername: '',
  schoolYear: '',
  pastSchools: [],
}

export interface BioUserSchoolInfo {
  _id: string
  admittedAt: Date | null
  bioUserDisplayName: string
  bioUserIntro: string
  bioUserMedia: string
  bioUserPicture: string
  bioUserUsername: string
  bioUserUserId: string
  createdAt: Date
  graduatedAt: Date | null
  hasPastSchool: boolean | null
  inSchool: boolean
  isAdvanced: boolean
  isSchoolVerified: boolean
  isVerified: boolean
  pastSchools: BioUserSchoolInfo[]
  schoolAcademicLevel: AcademicLevel
  schoolArea: string
  schoolArm: string
  schoolClass: string
  schoolClassLevel: string
  schoolContinent: string
  schoolCountry: string
  schoolCountryFlag: string
  schoolCountrySymbol: string
  schoolDepartment: string
  schoolDepartmentId: string
  schoolDepartmentUsername: string
  schoolFaculty: string
  schoolFacultyId: string
  schoolFacultyUsername: string
  schoolId: string
  schoolLogo: string
  schoolName: string
  schoolPicture: string
  schoolPlaceId: string
  schoolState: string
  schoolCertificate: string
  schoolTempCertificate: string
  schoolUsername: string
  schoolYear: string
  isActive?: boolean
  isChecked?: boolean
}

interface FetchResponse {
  count: number
  message: string
  page_size: number
  results: BioUserSchoolInfo[]
  data: BioUserSchoolInfo
  bioUser: BioUser
  bioUserState: BioUserState
  bioUserSchoolInfo: BioUserSchoolInfo
  user: User
}

interface UsersState {
  count: number
  page_size: number
  searchPageSize: number
  searchCurrentPage: number
  results: BioUserSchoolInfo[]
  pastSchools: BioUserSchoolInfo[]
  loading: boolean
  hasMoreSearch: boolean
  selectedBioUsers: BioUserSchoolInfo[]
  searchedBioUserResult: BioUserSchoolInfo[]
  searchedBioUsersSchoolInfo: BioUserSchoolInfo[]
  isAllChecked: boolean
  bioUserSchoolForm: BioUserSchoolInfo
  bioUserPastSchoolForm: BioUserSchoolInfo
  setBioUserPastSchoolForm: (
    key: keyof BioUserSchoolInfo,
    value: BioUserSchoolInfo[keyof BioUserSchoolInfo]
  ) => void
  setBioUserSchoolInfoForm: (
    key: keyof BioUserSchoolInfo,
    value: BioUserSchoolInfo[keyof BioUserSchoolInfo]
  ) => void
  resetForm: () => void
  clearSearchedItem: () => void
  setSearchedBioUserResult: () => void
  getBioUsersSchoolInfo: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>

  getBioUserSchoolInfo: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getQueryBioUsersSchool: (url: string) => Promise<void>
  addMoreSearchedBioUsersSchoolInfo: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  postBioUserSchoolInfo: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateBioUserSchoolInfo: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  setSearchCurrentPage: (index: number) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchPerson: (url: string) => void
}

export const BioUserSchoolInfoStore = create<UsersState>((set) => ({
  count: 0,
  page_size: 20,
  searchPageSize: 20,
  searchCurrentPage: 1,
  results: [],
  pastSchools: [],
  loading: false,
  hasMoreSearch: true,
  error: null,
  selectedBioUsers: [],
  searchedBioUsersSchoolInfo: [],
  searchedBioUserResult: [],
  isAllChecked: false,
  bioUserSchoolForm: BioUserSchoolInfoEmpty,
  bioUserPastSchoolForm: BioUserSchoolInfoEmpty,
  setBioUserPastSchoolForm: (key, value) =>
    set((state) => ({
      bioUserPastSchoolForm: {
        ...state.bioUserPastSchoolForm,
        [key]: value,
      },
    })),
  setBioUserSchoolInfoForm: (key, value) =>
    set((state) => ({
      bioUserSchoolForm: {
        ...state.bioUserSchoolForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      bioUserSchoolForm: BioUserSchoolInfoEmpty,
    }),

  setSearchCurrentPage: (page: number) => {
    set({ searchCurrentPage: page })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    const updatedResults = results.map((item: BioUserSchoolInfo) => ({
      ...item,
      isChecked: false,
      isActive: false,
    }))

    set({
      loading: false,
      count,
      page_size,
      results: updatedResults,
    })
  },

  setSearchedBioUserResult: () => {
    set((prev) => {
      return {
        searchedBioUsersSchoolInfo: prev.searchedBioUserResult,
        searchedBioUserResult: [],
      }
    })
  },

  clearSearchedItem: () => {
    set({ searchedBioUserResult: [] })
  },
  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  getBioUsersSchoolInfo: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
      })
      const data = response?.data
      if (data) {
        BioUserSchoolInfoStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getBioUserSchoolInfo: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, { setMessage })
      const data = response?.data
      if (data) {
        set({
          bioUserSchoolForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getQueryBioUsersSchool: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      const data = response?.data
      if (data) {
        set({
          searchedBioUsersSchoolInfo: data.results,
          hasMoreSearch: data.results.length > 0,
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addMoreSearchedBioUsersSchoolInfo: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      const { results } = response?.data
      if (results) {
        set((prev) => {
          return {
            searchedBioUsersSchoolInfo: [
              ...prev.searchedBioUsersSchoolInfo,
              ...results,
            ],
            hasMoreSearch: results.length > 0,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      results: state.results.map((item: BioUserSchoolInfo) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchPerson: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      const { results } = response?.data
      if (results) {
        set({ searchedBioUserResult: results })
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({
        loading: false,
      })
    }
  }, 1000),

  updateBioUserSchoolInfo: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect
  ) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
      })
      const data = response?.data
      if (data) {
        if (data.bioUserSchoolInfo) {
          AuthStore.getState().setBioUserSchoolInfo(data.bioUserSchoolInfo)
        }
        if (data.bioUserState) {
          AuthStore.getState().setBioUserState(data.bioUserState)
        }
        if (redirect) redirect()
      }
    } catch (error) {
      console.log(error)
    } finally {
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
    })

    if (response?.data) {
      const { user, data } = response.data
      AuthStore.getState().setUser(user)
      set({
        bioUserSchoolForm: data,
        loading: false,
      })
    }
  },

  postBioUserSchoolInfo: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
    })

    if (response?.data) {
      const { user, data } = response.data
      AuthStore.getState().setUser(user)
      set({
        bioUserSchoolForm: data,
        loading: false,
      })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.results[index]?.isActive
      const updatedResults = state.results.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        results: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.results.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedselectedBioUsers = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        results: updatedResults,
        selectedBioUsers: updatedselectedBioUsers,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.results.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.results.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedselectedBioUsers = isAllChecked ? updatedResults : []

      return {
        results: updatedResults,
        selectedBioUsers: updatedselectedBioUsers,
        isAllChecked,
      }
    })
  },
}))
