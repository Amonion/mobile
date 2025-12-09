import { create } from 'zustand'
import { customRequest } from '@/lib/api'

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
  getUserSettings: (url: string) => Promise<void>
  setSettingsForm: (form: UserSettings) => void
  toggleNotification: (key: UserSettingsBooleanKeys) => void
  updateUserSettings: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
}

type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T]

type UserSettingsBooleanKeys = BooleanKeys<UserSettings>

export const UserSettingsStore = create<UserSettingsState>((set) => ({
  userSettingsForm: UserSettingsEmpty,
  loading: false,

  getUserSettings: async (url: string) => {
    try {
      const response = await customRequest({ url })
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

  setSettingsForm: (form) =>
    set({
      userSettingsForm: form,
    }),

  updateUserSettings: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>
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
