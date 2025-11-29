import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { customRequest } from '@/lib/api'
import { State, StateEmpty } from './StateOrigin'
import { Area } from './Area'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Area[]
  state: string
  stateCapital: string
  stateLogo: string
}

interface StateState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  states: Area[]
  loadingStates: boolean
  error: string | null
  successs?: string | null
  selectedStates: State[]
  searchedItems: State[]
  isAllCountriesChecked: boolean
  allStates: boolean
  stateForm: State
  setItemForm: (key: keyof State, value: State[keyof State]) => void
  resetForm: () => void
  setAllStates: () => void
  getStates: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getAState: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    isNew?: boolean
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  toggleCheckedState: (index: number) => void
  toggleActiveState: (index: number) => void
  toggleAllSelectedState: () => void
  searchItem: (url: string) => void
}

const StateStore = create<StateState>((set, get) => ({
  links: null,
  count: 0,
  page_size: 0,
  states: [],
  loadingStates: false,
  error: null,
  selectedStates: [],
  searchedItems: [],
  isAllCountriesChecked: false,
  allStates: false,
  stateForm: StateEmpty,
  setItemForm: (key, value) =>
    set((state) => ({
      stateForm: {
        ...state.stateForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      stateForm: StateEmpty,
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
        states: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loadingStates: loadState })
  },

  setAllStates: () => {
    set((state) => {
      const isCurrentlyActive = state.allStates
      const updatedResults = state.states.map((tertiary) => ({
        ...tertiary,
        isChecked: isCurrentlyActive ? tertiary.isChecked : false,
      }))
      return {
        allStates: !state.allStates,
        states: updatedResults,
        selectedStates: !state.allStates ? [] : state.selectedStates,
      }
    })
  },

  getStates: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        StateStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getAState: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    isNew?: boolean
  ) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        if (isNew) {
          const { state, stateCapital, stateLogo, ...filteredData } = data
          if (data.state === 'not-ever-postii') {
            console.log(state, stateCapital, stateLogo)
          }
          set({
            stateForm: { ...StateStore.getState().stateForm, ...filteredData },
            loadingStates: false,
          })
        } else {
          set({
            stateForm: { ...StateStore.getState().stateForm, ...data },
            loadingStates: false,
          })
        }
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  searchItem: _debounce(async (url: string) => {
    const response = await customRequest({ url })
    const results = response?.data.results
    if (results) {
      set({ searchedItems: results })
    }
  }, 1000),

  toggleActiveState: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.states[index]?.isActive
      const updatedResults = state.states.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        states: updatedResults,
      }
    })
  },

  toggleCheckedState: (index: number) => {
    set((state) => {
      const updatedResults = state.states.map((tertiary, idx) =>
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
        states: updatedResults,
        selectedStates: updatedSelectedItems,
        isAllCountriesChecked: isAllCountriesChecked,
        allStates: isAllCountriesChecked,
      }
    })
  },

  toggleAllSelectedState: () => {
    set((state) => {
      const isAllCountriesChecked =
        state.states.length === 0 ? false : !state.isAllCountriesChecked
      const updatedResults = state.states.map((place) => ({
        ...place,
        isChecked: isAllCountriesChecked,
      }))

      const updatedSelectedItems = isAllCountriesChecked ? updatedResults : []

      return {
        states: updatedResults,
        selectedStates: updatedSelectedItems,
        isAllCountriesChecked,
      }
    })
  },
}))

export default StateStore
