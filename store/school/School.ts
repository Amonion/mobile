import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { AcademicLevel } from './Academic'
import { BioUserState } from '../user/BioUserState'
import { customRequest } from '@/lib/api'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: School[]
  data: School
  bioUserState: BioUserState
}

export interface School {
  _id: string
  placeId: string
  country: string
  countrySymbol: string
  state: string
  area: string
  name: string
  ownerUsername: string
  userId: string
  bioId: string
  staffRegistration: boolean
  studentRegistration: boolean
  username: string
  phone: string
  address: string
  email: string
  description: string
  levels: AcademicLevel[]
  institutions: string[]
  idCard: File | string | null
  document: File | string | null
  logo: File | string | null
  media: File | string | null
  continent: string
  landmark: string
  logoPreview: string
  mediaPreview: string
  countryFlag: string
  currency: string
  officeId: string
  currencySymbol: string
  resultPointSystem: number
  createdAt: Date | null
  followers: number
  following: number
  posts: number
  comments: number
  isApproved: boolean
  isApplied: boolean
  isVerified: boolean
  isFollowed: boolean
  isChecked?: boolean
  isActive?: boolean
}

export const SchoolEmpty = {
  _id: '',
  placeId: '',
  country: '',
  countrySymbol: '',
  state: '',
  area: '',
  name: '',
  ownerUsername: '',
  academicSession: { name: '', index: null, divisions: [] },
  studentRegistration: false,
  staffRegistration: false,
  grading: [
    { name: 'A', min: 70, max: 100, remark: 'Excelent' },
    { name: 'B', min: 60, max: 69.99, remark: 'Very Good' },
  ],
  userId: '',
  bioId: '',
  username: '',
  phone: '',
  address: '',
  email: '',
  description: '',
  levels: [],
  institutions: [],
  idCard: '',
  document: '',
  logo: '',
  media: '',
  mediaPreview: '',
  logoPreview: '',
  officeId: '',
  picture: '',
  continent: '',
  landmark: '',
  countryFlag: '',
  currency: '',
  currencySymbol: '',
  resultPointSystem: 0,
  createdAt: null,
  followers: 0,
  following: 0,
  posts: 0,
  comments: 0,
  isApproved: false,
  isApplied: false,
  isVerified: false,
  isFollowed: false,
}

interface SchoolState {
  count: number
  page_size: number
  schoolResults: School[]
  loadingSchool: boolean
  selectedSchools: School[]
  searchedSchools: School[]
  searchedSchoolResult: School[]
  isAllChecked: boolean
  hasMoreSearch: boolean
  allSchools: boolean
  schoolData: School
  setForm: (key: keyof School, value: School[keyof School]) => void
  resetForm: () => void
  setAllSchools: () => void
  getSchools: (url: string) => Promise<void>
  getSchool: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setSchoolForm: (username: string) => void
  setLoading?: (loading: boolean) => void

  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleSchools: () => void
  clearSearchedSchools: () => void
  setSearchedSchoolResult: () => void
  searchSchool: (url: string) => void
  addMoreSearchItems: (url: string) => void
  getQuerySchools: (url: string) => void
}

const SchoolStore = create<SchoolState>((set) => ({
  count: 0,
  page_size: 20,
  selectedLevel: null,
  selectedLevelName: '',
  selectedClassLevel: null,
  schoolResults: [],
  loadingSchool: false,
  hasMoreSearch: true,
  selectedSchools: [],
  searchedSchools: [],
  searchedSchoolResult: [],
  isAllChecked: false,
  allSchools: false,
  schoolData: SchoolEmpty,
  setForm: (key, value) =>
    set((state) => ({
      schoolData: {
        ...state.schoolData,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      schoolData: SchoolEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loadingSchool: loadState })
  },

  setSchoolForm: (username: string) => {
    set((prev) => {
      const matchedSchool = prev.searchedSchools.find(
        (school) => school.username === username
      )
      return { schoolData: matchedSchool }
    })
  },

  clearSearchedSchools: () => {
    set({ searchedSchoolResult: [] })
  },

  setSearchedSchoolResult: () => {
    set((prev) => {
      return {
        searchedSchools: prev.searchedSchoolResult,
        searchedSchoolResult: [],
      }
    })
  },

  setAllSchools: () => {
    set((state) => {
      const isCurrentlyActive = state.allSchools
      const updatedResults = state.schoolResults.map((tertiary) => ({
        ...tertiary,
        isChecked: isCurrentlyActive ? tertiary.isChecked : false,
      }))
      return {
        allSchools: !state.allSchools,
        schoolResults: updatedResults,
        selectedSchools: !state.allSchools ? [] : state.selectedSchools,
      }
    })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: School) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loadingSchool: false,
        count,
        page_size,
        schoolResults: updatedResults,
      })
    }
  },

  getSchools: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        SchoolStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getSchool: async (url: string) => {
    try {
      const response = await customRequest({ url })
      set({
        loadingSchool: true,
      })
      const data = response?.data
      if (data) {
        set({
          schoolData: data.data,
        })
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({
        loadingSchool: false,
      })
    }
  },

  addMoreSearchItems: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedSchools: [...prev.searchedSchools, ...data.results],
            loadingSchool: false,
            hasMoreSearch: data.results.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getQuerySchools: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedSchools: data.results,
            loadingSchool: false,
            hasMoreSearch: data.results.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleSchools: async () => {
    set((state) => ({
      schoolResults: state.schoolResults.map((item: School) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchSchool: _debounce(async (url: string) => {
    try {
      const response = await customRequest({ url })
      set({ loadingSchool: true })
      const results = response?.data.results
      if (results) {
        const updatedResults = results.map((item: School) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedSchoolResult: updatedResults })
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loadingSchool: false })
    }
  }, 1000),

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.schoolResults[index]?.isActive
      const updatedResults = state.schoolResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        schoolResults: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.schoolResults.map((tertiary, idx) =>
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
        schoolResults: updatedResults,
        selectedSchools: updatedSelectedItems,
        isAllChecked: isAllChecked,
        allSchools: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.schoolResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.schoolResults.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        schoolResults: updatedResults,
        selectedSchools: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default SchoolStore
