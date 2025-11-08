import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { customRequest } from '@/lib/api'

export interface Account {
  _id: string
  username: string
  displayName: string
  intro: string
  media: string
  picture: string
  followers: number
  posts: number
  following: number
  verification: number
  replies: number
  isVerified: boolean
  isChecked?: boolean
  isActive?: boolean
}

export const AccountEmpty = {
  _id: '',
  username: '',
  displayName: '',
  intro: '',
  media: '',
  picture: '',
  followers: 0,
  posts: 0,
  following: 0,
  verification: 0,
  replies: 0,
  isVerified: false,
}

interface FetchAccountResponse {
  count: number
  message: string
  page_size: number
  results: Account[]
}

interface AccountState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  accounts: Account[]
  loading: boolean
  hasMoreSearch: boolean
  error: string | null
  successs?: string | null
  selectedAccounts: Account[]
  searchedAccountResult: Account[]
  searchResult: Account[]
  searchedAccounts: Account[]
  isAllChecked: boolean
  formData: Account
  setForm: (key: keyof Account, value: Account[keyof Account]) => void
  resetForm: () => void
  getAccounts: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  addMoreSearchItems: (url: string) => Promise<void>
  setProcessedResults: (data: FetchAccountResponse) => void
  setLoading?: (loading: boolean) => void
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    refreshUrl?: string
  ) => Promise<void>
  toggleAccount: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  clearSearchedItem: () => void
  setSearchedAccountResult: () => void
  searchAccount: (url: string) => void
  getQueryAccounts: (url: string) => void
}

const AccountStore = create<AccountState>((set) => ({
  links: null,
  count: 0,
  page_size: 20,
  accounts: [],
  loading: false,
  hasMoreSearch: true,
  error: null,
  selectedAccounts: [],
  searchResult: [],
  searchedAccounts: [],
  searchedAccountResult: [],
  isAllChecked: false,
  formData: AccountEmpty,
  setForm: (key, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      formData: AccountEmpty,
    }),

  setProcessedResults: ({
    count,
    page_size,
    results,
  }: FetchAccountResponse) => {
    const updatedResults = results.map((item: Account) => ({
      ...item,
      isChecked: false,
      isActive: false,
    }))

    set({
      loading: false,
      count,
      page_size,
      accounts: updatedResults,
    })
  },

  setSearchedAccountResult: () => {
    set((prev) => {
      return {
        hasMoreSearch: prev.searchedAccountResult.length > prev.page_size,
        searchedAccounts: prev.searchedAccountResult,
        searchedAccountResult: [],
      }
    })
  },

  clearSearchedItem: () => {
    set({ searchedAccountResult: [] })
  },
  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  getAccounts: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await customRequest({ url })

      const data = response?.data
      if (data) {
        AccountStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getQueryAccounts: async (url: string) => {
    try {
      const response = await customRequest({ url })

      const { results } = response?.data
      if (results) {
        set((prev) => {
          return {
            searchedAccounts: results,
            hasMoreSearch: prev.searchedAccountResult.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addMoreSearchItems: async (url: string) => {
    try {
      const response = await customRequest({ url })

      const { results } = response?.data
      if (results) {
        set((prev) => {
          return {
            searchedAccounts: [...prev.searchedAccounts, ...results],
            hasMoreSearch: prev.searchedAccountResult.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      accounts: state.accounts.map((item: Account) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchAccount: _debounce(async (url: string) => {
    try {
      const response = await customRequest({ url })
      const { results } = response?.data
      if (results) {
        const updatedResults = results.map((item: Account) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedAccountResult: updatedResults })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  }, 1000),

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => {
    set({ loading: true, error: null })
    const response = await customRequest({
      url,
      method: 'PATCH',
      showMessage: true,
      data: updatedItem,
    })
    if (response?.status !== 404 && response?.data) {
      AccountStore.getState().setProcessedResults(response.data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.accounts[index]?.isActive
      const updatedResults = state.accounts.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        accounts: updatedResults,
      }
    })
  },

  toggleAccount: (index: number) => {
    set((state) => {
      const updatedResults = state.accounts.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedAccounts = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        accounts: updatedResults,
        selectedAccounts: updatedSelectedAccounts,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.accounts.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.accounts.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedAccounts = isAllChecked ? updatedResults : []

      return {
        results: updatedResults,
        selectedAccounts: updatedSelectedAccounts,
        isAllChecked,
      }
    })
  },
}))

export default AccountStore
