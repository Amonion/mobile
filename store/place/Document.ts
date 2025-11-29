import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { customRequest } from '@/lib/api'

export interface FileLike {
  uri: string
  name: string
  type: string
}

export interface Document {
  _id: string
  picture: string | File | null
  name: string
  tempDoc: string
  required: boolean
  description: string
  country: string
  countryFlag: string
  placeId: string
  isChecked?: boolean
  isActive?: boolean
}

export const DocumentEmpty = {
  _id: '',
  picture: '',
  name: '',
  tempDoc: '',
  required: false,
  description: '',
  country: '',
  countryFlag: '',
  placeId: '',
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Document[]
  data: Document
}

interface DocumentState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  documents: Document[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Document[]
  searchedPositions: Document[]
  isAllChecked: boolean
  documentForm: Document
  setForm: (key: keyof Document, value: Document[keyof Document]) => void
  resetForm: () => void
  getDocuments: (url: string) => Promise<void>
  getDocument: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchPosition: (url: string) => void
}

const DocumentStore = create<DocumentState>((set, get) => ({
  links: null,
  count: 0,
  page_size: 0,
  documents: [],
  loading: false,
  error: null,
  selectedItems: [],
  searchedPositions: [],
  isAllChecked: false,
  documentForm: DocumentEmpty,
  setForm: (key, value) =>
    set((state) => ({
      documentForm: {
        ...state.documentForm,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      documentForm: DocumentEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Document) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        documents: updatedResults,
      })
    }
  },

  getDocuments: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        DocumentStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getDocument: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      console.log(data)
      if (data) {
        set({
          documentForm: {
            ...DocumentStore.getState().documentForm,
            ...data.data,
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
      documents: state.documents.map((item: Document) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchPosition: _debounce(async (url: string) => {
    const response = await customRequest({ url })
    const results = response?.data.results
    if (results) {
      const updatedResults = results.map((item: Document) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({ searchedPositions: updatedResults })
    }
  }, 1000),

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.documents[index]?.isActive
      const updatedResults = state.documents.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        documents: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.documents.map((tertiary, idx) =>
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
        documents: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.documents.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.documents.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        documents: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default DocumentStore
