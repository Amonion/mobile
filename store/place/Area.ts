import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { customRequest } from '@/lib/api'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Area[]
  zipCode: string
  area: string
}

export interface Area {
  id: string
  continent: string
  country: string
  countryCode: string
  countryFlag: string | null | File
  countrySymbol: string
  currency: string
  currencySymbol: string
  state: string
  area: string
  zipCode: string
  stateCapital: string
  stateLogo: string
  isChecked?: boolean
  isActive?: boolean
}

export const AreaEmpty = {
  id: '',
  continent: '',
  country: '',
  countryCode: '',
  countryFlag: null,
  countrySymbol: '',
  currency: '',
  currencySymbol: '',
  state: '',
  area: '',
  zipCode: '',
  stateCapital: '',
  stateLogo: '',
}

interface AreaState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  area: Area[]
  loadingArea: boolean
  error: string | null
  successs?: string | null
  selectedArea: Area[]
  searchedItems: Area[]
  isAllAreaChecked: boolean
  allArea: boolean
  form: Area
  activeArea: Area
  setItemForm: (key: keyof Area, value: Area[keyof Area]) => void
  resetForm: () => void
  setAllArea: () => void
  getArea: (url: string) => Promise<void>
  getOneArea: (url: string, isNew?: boolean) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  toggleCheckedArea: (index: number) => void
  toggleActiveArea: (index: number) => void
  toggleAllSelectedArea: () => void
  reshuffleResults: () => void
  searchItem: (url: string) => void
}

const AreaStore = create<AreaState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  area: [],
  loadingArea: false,
  error: null,
  selectedArea: [],
  searchedItems: [],
  isAllAreaChecked: false,
  allArea: false,
  activeArea: AreaEmpty,
  form: AreaEmpty,
  setItemForm: (key, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      form: AreaEmpty,
    }),

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
        area: updatedResults,
      })
    }
  },

  setAllArea: () => {
    set((state) => {
      const isCurrentlyActive = state.allArea
      const updatedResults = state.area.map((tertiary) => ({
        ...tertiary,
        isChecked: isCurrentlyActive ? tertiary.isChecked : false,
      }))
      return {
        allArea: !state.allArea,
        area: updatedResults,
        selectedArea: !state.allArea ? [] : state.selectedArea,
      }
    })
  },

  setLoading: (loadState: boolean) => {
    set({ loadingArea: loadState })
  },

  getArea: async (url: string) => {
    try {
      const response = await customRequest({ url })

      const data = response?.data
      if (data) {
        AreaStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getOneArea: async (url: string, isNew?: boolean) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        if (isNew) {
          const { area, zipCode, ...filteredData } = data
          if (data.area === 'not-ever-postii') {
            console.log(area, zipCode)
          }
          set({
            form: { ...AreaStore.getState().form, ...filteredData },
            loadingArea: false,
          })
        } else {
          set({
            form: { ...AreaStore.getState().form, ...data },
            loadingArea: false,
          })
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      area: state.area.map((item: Area) => ({
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

  toggleActiveArea: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.area[index]?.isActive
      const updatedResults = state.area.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      const active = state.area.find((_, int) => index === int)

      return {
        activeArea: active,
        area: updatedResults,
      }
    })
  },

  toggleCheckedArea: (index: number) => {
    set((state) => {
      const updatedResults = state.area.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllAreaChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedItems = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        area: updatedResults,
        selectedArea: updatedSelectedItems,
        isAllAreaChecked,
        allArea: isAllAreaChecked,
      }
    })
  },

  toggleAllSelectedArea: () => {
    set((state) => {
      const isAllAreaChecked =
        state.area.length === 0 ? false : !state.isAllAreaChecked
      const updatedResults = state.area.map((place) => ({
        ...place,
        isChecked: isAllAreaChecked,
      }))

      const updatedSelectedItems = isAllAreaChecked ? updatedResults : []

      return {
        area: updatedResults,
        selectedArea: updatedSelectedItems,
        isAllAreaChecked,
      }
    })
  },
}))
export default AreaStore
