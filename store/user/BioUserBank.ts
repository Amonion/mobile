import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import { User } from './User'
import { Bank, BankEmpty } from '../finance/Bank'

export interface BioUserBank {
  bioUserId: string
  bankCountry: string
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  bankUsername: string
  bankId: string
  bankLogo: string
}

export const BioUserBankEmpty = {
  bioUserId: '',
  bankCountry: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankUsername: '',
  bankLogo: '',
  bankId: '',
}

interface FetchResponse {
  count: number
  message: string
  page_size: number
  data: BioUserBank
  user: User
}

interface BioUserBankState {
  bioUserBankForm: BioUserBank
  selectedBank: Bank
  loading: boolean
  isApplicationForm: boolean
  getBioUserBank: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  resetForm: () => void
  deleteMyAccount: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setBioUserBankForm: (
    key: keyof BioUserBank,
    value: BioUserBank[keyof BioUserBank]
  ) => void
  setApplicationForm: (status: boolean) => void

  updateBioUserBank: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  openBankAccount: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
}

export const BioUserBankStore = create<BioUserBankState>((set) => ({
  bioUserBankForm: BioUserBankEmpty,
  selectedBank: BankEmpty,
  loading: false,
  isApplicationForm: false,

  getBioUserBank: async (
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
          bioUserBankForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      if (error) return
    }
  },

  resetForm: () =>
    set({
      bioUserBankForm: BioUserBankEmpty,
    }),

  setApplicationForm: (status) =>
    set({
      isApplicationForm: status,
    }),

  deleteMyAccount: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      set({ loading: true })
      await apiRequest<FetchResponse>(url, {
        method: 'DELETE',
        setMessage,
      })
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  setBioUserBankForm: (key, value) =>
    set((state) => ({
      bioUserBankForm: {
        ...state.bioUserBankForm,
        [key]: value,
      },
    })),

  updateBioUserBank: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
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
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  openBankAccount: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
      })
      const data = response?.data
      if (data) {
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },
}))
