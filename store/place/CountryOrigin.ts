import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { customRequest } from '@/lib/api'
import { Area, AreaEmpty } from './Area'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Area[]
}

export interface Country {
  id: string
  continent: string
  country: string
  countryCapital: string
  countryCode: string
  countryFlag: string | null | File
  countrySymbol: string
  currency: string
  currencySymbol: string
  isChecked?: boolean
  isActive?: boolean
}

export const CountryEmpty = {
  id: '',
  continent: '',
  country: '',
  countryCapital: '',
  countryCode: '',
  countryFlag: '',
  countrySymbol: '',
  currency: '',
  currencySymbol: '',
}

interface CountryState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  countries: Area[]
  loadingCountries: boolean
  error: string | null
  successs?: string | null
  selectedCountries: Area[]
  searchedItems: Area[]
  isAllCountriesChecked: boolean
  country: Area
  allCountries: boolean
  setItemForm: (key: keyof Area, value: Area[keyof Area]) => void
  resetForm: () => void
  setAllCountries: () => void
  getCountries: (url: string) => Promise<void>
  getCountry: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  postItem: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleCheckedCountry: (index: number) => void
  toggleActiveCountry: (index: number) => void
  toggleAllSelectedCountry: () => void
  reshuffleResults: () => void
  searchItem: (url: string) => void
}

const CountryStore = create<CountryState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  countries: [],
  loadingCountries: false,
  error: null,
  selectedCountries: [],
  searchedItems: [],
  isAllCountriesChecked: false,
  allCountries: false,
  country: AreaEmpty,
  setItemForm: (key, value) =>
    set((state) => ({
      country: {
        ...state.country,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      country: AreaEmpty,
    }),

  setAllCountries: () => {
    set((state) => {
      const isCurrentlyActive = state.allCountries
      const updatedResults = state.countries.map((tertiary) => ({
        ...tertiary,
        isChecked: isCurrentlyActive ? tertiary.isChecked : false,
      }))
      return {
        allCountries: !state.allCountries,
        countries: updatedResults,
        selectedCountries: !state.allCountries ? [] : state.selectedCountries,
      }
    })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Area) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        countries: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loadingCountries: loadState })
  },

  getCountries: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        CountryStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getCountry: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    isNew?: boolean
  ) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        if (isNew) {
          const { ...filteredData } = data
          // if (data.state === "not-ever-postii") {
          //   console.log(state, stateCapital, stateLogo);
          // }
          set({
            country: { ...CountryStore.getState().country, ...filteredData },
            loadingCountries: false,
          })
        } else {
          set({
            country: { ...CountryStore.getState().country, ...data },
            loadingCountries: false,
          })
        }
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      countries: state.countries.map((item: Area) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchItem: _debounce(async (url: string) => {
    const response = await customRequest({ url })
    const results = response?.data.results
    if (results) {
      set({ searchedItems: results })
    }
  }, 1000),

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loadingCountries: true, error: null })
    const response = await customRequest({
      url,
      method: 'PATCH',
      showMessage: true,
      data: updatedItem,
    })

    if (response?.status !== 404 && response?.data) {
      CountryStore.getState().setProcessedResults(response.data)
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loadingCountries: true, error: null })

    const response = await customRequest({
      url,
      method: 'POST',
      showMessage: true,
      data: updatedItem,
    })
    if (response?.status !== 404 && response?.data) {
      CountryStore.getState().setProcessedResults(response.data)
    }
  },

  toggleActiveCountry: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.countries[index]?.isActive
      const updatedResults = state.countries.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        countries: updatedResults,
      }
    })
  },

  toggleCheckedCountry: (index: number) => {
    set((state) => {
      const updatedResults = state.countries.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllCountriesChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedItems = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        countries: updatedResults,
        selectedCountries: updatedSelectedItems,
        isAllCountriesChecked: isAllCountriesChecked,
        allCountries: isAllCountriesChecked,
      }
    })
  },

  toggleAllSelectedCountry: () => {
    set((state) => {
      const isAllCountriesChecked =
        state.countries.length === 0 ? false : !state.isAllCountriesChecked
      const updatedResults = state.countries.map((place) => ({
        ...place,
        isChecked: isAllCountriesChecked,
      }))

      const updatedSelectedItems = isAllCountriesChecked ? updatedResults : []

      return {
        countries: updatedResults,
        selectedCountries: updatedSelectedItems,
        isAllCountriesChecked,
      }
    })
  },
}))

export default CountryStore
