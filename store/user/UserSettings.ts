import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import { User } from './User'

interface FetchResponse {
  count: number
  message: string
  page_size: number
  data: UserSettings
  user: User
}

export const UserSettingsEmpty = {
  username: '',
  userId: '',
  friendRequest: false,
  newMessage: false,
  newFollower: false,
  postReply: false,
  jobPosting: false,
  sound: false,
  createdAt: new Date(),
}

export interface UserSettings {
  username: string
  userId: string
  friendRequest: boolean
  newMessage: boolean
  newFollower: boolean
  postReply: boolean
  jobPosting: boolean
  sound: boolean
  createdAt: Date
}

interface UserSettingsState {
  userSettingsForm: UserSettings
  loading: boolean
  getUserSettings: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  resetForm: () => void
  toggleNotification: (key: UserSettingsBooleanKeys) => void
  updateUserSettings: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
}

type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T]

type UserSettingsBooleanKeys = BooleanKeys<UserSettings>

export const UserSettingsStore = create<UserSettingsState>((set) => ({
  userSettingsForm: UserSettingsEmpty,
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
          userSettingsForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      if (error) return
    }
  },

  resetForm: () =>
    set({
      userSettingsForm: UserSettingsEmpty,
    }),

  updateUserSettings: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
    })
    const data = response?.data
    if (data) {
      set({
        userSettingsForm: data.data,
        loading: false,
      })
    }
  },

  toggleNotification: (key: UserSettingsBooleanKeys) =>
    set((state) => {
      const current = state.userSettingsForm[key]

      return {
        userSettingsForm: {
          ...state.userSettingsForm,
          [key]: !current, // toggle directly
        },
      }
    }),
}))
