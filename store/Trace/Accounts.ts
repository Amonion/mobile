import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { customRequest } from '@/lib/api'
import { User } from '../user/User'
import { AuthStore } from '../AuthStore'
import { clearTable, getAll, saveAll, upsert } from '@/lib/localStorage/db'
import { isEqual } from 'lodash'

interface AccountState {
  accounts: User[]
  count: number
  loading: boolean
  page: number
  page_size: number
  searchedAccounts: User[]
  searchedAccountResults: User[]
  getSavedAccounts: (user: User) => Promise<void>
  getAccounts: (url: string) => Promise<void>
  searchAccounts: (url: string) => void
  updateUser: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    redirect?: () => void
  ) => Promise<void>
}

export const AccountStore = create<AccountState>((set) => ({
  accounts: [],
  count: 0,
  loading: false,
  page: 1,
  page_size: 20,
  searchedAccounts: [],
  searchedAccountResults: [],

  getSavedAccounts: async (user) => {
    try {
      set({ loading: true })
      const accounts = await getAll<User>('accounts', { page: 1, pageSize: 20 })
      if (accounts.length > 0) {
        set({ accounts })
      }
      clearTable('accounts')
      AccountStore.getState().getAccounts(
        `/users/accounts/?page_size=40&page=1`
      )
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getAccounts: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        const fetchedAccounts = data.results
        const savedAccounts = AccountStore.getState().accounts
        const first20Fetched = fetchedAccounts.slice(0, 20)

        const missingAccounts = first20Fetched.filter(
          (apiUser: User) =>
            !savedAccounts.some((local) => local._id === apiUser._id)
        )

        let updatedSavedAccounts = savedAccounts

        if (missingAccounts.length > 0) {
          updatedSavedAccounts = [...savedAccounts, ...missingAccounts]
          set({ accounts: updatedSavedAccounts })
          console.log(
            `📌 Added ${missingAccounts.length} new accounts from first 20 fetched accounts.`
          )
        }

        if (savedAccounts.length > 0) {
          const toUpsert = fetchedAccounts.filter((apiItem: User) => {
            const existing = savedAccounts.find(
              (localItem) => localItem._id === apiItem._id
            )
            return !existing || !isEqual(existing, apiItem)
          })

          if (toUpsert.length > 0) {
            for (const item of toUpsert) {
              await upsert('accounts', item)
            }
          } else {
            console.log('No new accounts to upsert.')
          }
        } else {
          saveAll('accounts', fetchedAccounts)
          set({ accounts: fetchedAccounts })
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  searchAccounts: _debounce(async (url: string) => {
    try {
      const response = await customRequest({ url })
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: User) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedAccounts: updatedResults })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  }, 1000),

  updateUser: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    redirect?: () => void
  ) => {
    set({ loading: true })
    const response = await customRequest({
      url,
      method: 'PATCH',
      showMessage: true,
      data: updatedItem,
    })
    const data = response?.data
    if (data) {
      AuthStore.getState().setUser(data.data)
      if (redirect) redirect()
    }
  },
}))
