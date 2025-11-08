import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import { AuthStore } from './AuthStore'
import { User } from './User'
import { BioUserSchoolInfo } from './BioUserSchoolInfo'
import { BioUser } from './BioUser'
import { BioUserState } from './BioUserState'

interface Visibility {
  government: boolean
  institution: boolean
  company: boolean
  single: boolean
}

const VisibilityEmpty = {
  government: true,
  institution: true,
  company: false,
  single: false,
}

export interface BioUserSettings {
  bioUserId: string
  bioVisibility: Visibility
  originisibility: Visibility
  educationVisibility: Visibility
  residentialisibility: Visibility
  relatedisibility: Visibility
  documentisibility: Visibility
  notification: Visibility
}

export const BioUserSettingsEmpty = {
  bioUserId: '',
  bioVisibility: VisibilityEmpty,
  originisibility: VisibilityEmpty,
  educationVisibility: VisibilityEmpty,
  residentialisibility: VisibilityEmpty,
  relatedisibility: VisibilityEmpty,
  documentisibility: VisibilityEmpty,
  notification: VisibilityEmpty,
}

interface FetchResponse {
  count: number
  message: string
  page_size: number
  data: BioUserSettings
  bioUserState: BioUserState
  bioUserSettings: BioUserSettings
  bioUser: BioUser
  bioUserSchoolInfo: BioUserSchoolInfo
  user: User
}

interface UserSettingsState {
  bioUserSettingsForm: BioUserSettings
  loading: boolean
  getUserSettings: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  resetForm: () => void
  deleteMyAccount: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setBioSettingsForm: (
    key: keyof BioUserSettings,
    value: BioUserSettings[keyof BioUserSettings]
  ) => void

  updateBioUserSettings: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
}

export const BioUserSettingsStore = create<
  UserSettingsState & {
    toggleVisibility: (
      section: keyof BioUserSettings,
      key: keyof Visibility
    ) => void
  }
>((set) => ({
  bioUserSettingsForm: BioUserSettingsEmpty,
  loading: false,

  getUserSettings: async (
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
          bioUserSettingsForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      if (error) return
    }
  },

  resetForm: () =>
    set({
      bioUserSettingsForm: BioUserSettingsEmpty,
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

  setBioSettingsForm: (key, value) =>
    set((state) => ({
      bioUserSettingsForm: {
        ...state.bioUserSettingsForm,
        [key]: value,
      },
    })),

  updateBioUserSettings: async (
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
        AuthStore.getState().setAllUser(
          data.bioUserState,
          data?.bioUser,
          data.bioUserSchoolInfo,
          data.bioUserSettings
        )
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  toggleVisibility: (section, key) =>
    set((state) => {
      const current = state.bioUserSettingsForm[section] as Visibility
      if (!current) return state

      return {
        bioUserSettingsForm: {
          ...state.bioUserSettingsForm,
          [section]: {
            ...current,
            [key]: !current[key], // toggle the value
          },
        },
      }
    }),
}))
