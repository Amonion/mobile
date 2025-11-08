import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { BioUser } from './user/BioUser'
import { BioUserState } from './user/BioUserState'
import { User } from './user/User'
import { BioUserSettings } from './user/BioUserSettings'
import { BioUserSchoolInfo } from './user/BioUserSchoolInfo'

interface AuthState {
  bioUser: BioUser | null
  bioUserSettings: BioUserSettings | null
  bioUserState: BioUserState | null
  bioUserSchoolInfo: BioUserSchoolInfo | null
  user: User | null
  token: string | null
  login: (
    user: User,
    bioUserSettings: BioUserSettings,
    bioUser: BioUser,
    bioUserState: BioUserState,
    bioUserSchoolInfo: BioUserSchoolInfo,
    token: string
  ) => void
  setUser: (userData: User) => void
  setAllUser: (
    bioUserState: BioUserState,
    bioUser?: BioUser,
    bioUserSchoolInfo?: BioUserSchoolInfo,
    bioUserSettings?: BioUserSettings
  ) => void
  setBioUserState: (bioUserState: BioUserState) => void
  setBioUserSchoolInfo: (user: BioUserSchoolInfo) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const AuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      bioUser: null,
      bioUserState: null,
      bioUserSettings: null,
      bioUserSchoolInfo: null,
      user: null,
      token: null,

      setAllUser: (
        bioUserState,
        bioUser,
        bioUserSchoolInfo,
        bioUserSettings
      ) => {
        set((prev) => ({
          bioUserState,
          bioUser: bioUser ?? prev.bioUser,
          bioUserSchoolInfo: bioUserSchoolInfo ?? prev.bioUserSchoolInfo,
          bioUserSettings: bioUserSettings ?? prev.bioUserSettings,
        }))
      },

      setBioUserState: (bioUserState) => set({ bioUserState }),

      setBioUserSchoolInfo: (user) => set({ bioUserSchoolInfo: user }),

      login: (
        user,
        bioUserSettings,
        bioUser,
        bioUserState,
        bioUserSchoolInfo,
        token
      ) => {
        set({
          user,
          bioUserSettings,
          bioUser,
          bioUserState,
          bioUserSchoolInfo,
          token,
        })
      },

      setUser: (userData) => set({ user: userData }),

      logout: () => {
        set({
          user: null,
          bioUser: null,
          bioUserSchoolInfo: null,
          bioUserState: null,
          bioUserSettings: null,
          token: null,
        })
      },

      isAuthenticated: () => {
        const { user, token } = get()
        return !!user && !!token
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        bioUserState: state.bioUserState,
        bioUserSchoolInfo: state.bioUserSchoolInfo,
        bioUserSettings: state.bioUserSettings,
        bioUser: state.bioUser,
      }),
    }
  )
)
