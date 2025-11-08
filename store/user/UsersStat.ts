import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  onlineUsers: number
  onlineIncrease: number
  verifiedUsers: number
  verifyingUsers: number
  verificationIncrease: number
  totalUsers: number
  totalUsersIncrease: number

  totalSchools: number
  totalSchoolIncrease: number
  verifiedSchools: number
  verifiedSchoolIncrease: number
  newSchools: number
  newSchoolIncrease: number
  recordedSchools: number
  recordedSchoolIncrease: number

  unread: number
  page_size: number
  results: UserStat
  data: UserStat
}

export interface SchoolStats {
  totalSchools: number
  totalSchoolIncrease: number
  verifiedSchools: number
  verifiedSchoolIncrease: number
  newSchools: number
  newSchoolIncrease: number
  recordedSchools: number
  recordedSchoolIncrease: number
}

interface UserStatState {
  links: { next: string | null; previous: string | null } | null
  count: number
  unread: number
  page_size: number
  userStats: UserStat
  schoolStats: SchoolStats
  loading: boolean
  error: string | null
  successs?: string | null
  getStats: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getSchoolStats: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setLoading?: (loading: boolean) => void
}

export interface UserStat {
  onlineUsers: number
  onlineIncrease: number
  verificationIncrease: number
  verifyingUsers: number
  verifiedUsers: number
  totalUsers: number
  totalUsersIncrease: number
}

const UserStatStore = create<UserStatState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  unread: 0,
  userStats: {
    onlineUsers: 0,
    onlineIncrease: 0,
    verificationIncrease: 0,
    verifyingUsers: 0,
    verifiedUsers: 0,
    verifiedUsersIncrease: 0,
    totalUsers: 0,
    totalUsersIncrease: 0,
  },
  schoolStats: {
    totalSchools: 0,
    totalSchoolIncrease: 0,
    verifiedSchools: 0,
    verifiedSchoolIncrease: 0,
    newSchools: 0,
    newSchoolIncrease: 0,
    recordedSchools: 0,
    recordedSchoolIncrease: 0,
  },
  loading: false,
  error: null,

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  getStats: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: UserStatStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        UserStatStore.setState((prev) => ({
          userStats: {
            ...prev.userStats,
            onlineUsers: data.onlineUsers,
            onlineIncrease: data.onlineIncrease,
            verifiedUsers: data.verifiedUsers,
            verifyingUsers: data.verifyingUsers,
            verificationIncrease: data.verificationIncrease,
            totalUsers: data.totalUsers,
            totalUsersIncrease: data.totalUsersIncrease,
          },
        }))
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  getSchoolStats: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: UserStatStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },
}))

export default UserStatStore
