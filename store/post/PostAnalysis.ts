import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import { Post } from './Post'

interface FetchResponse {
  count: number
  message: string
  page_size: number
  result: Utility
  results: []
}

interface CommentStats {
  totalComments: number
  totalHates: number
  totalLikes: number
  totalReplies: number
}

interface CompetitionStats {
  competitions: number
  spent: number
  received: number
  participated: number
  change: number
}

interface PostStats {
  totalBookmarks: number
  totalLikes: number
  totalPosts: number
  totalReplies: number
  totalShares: number
  totalViews: number
}

interface Reactions {
  day: string
  week: string
  month: string
  date: string
  likes: number
  replies: number
  shares: number
}

interface Social {
  friends: number
  following: number
  followers: number
}

export interface Utility {
  post: PostStats
  comment: CommentStats
  competition: CompetitionStats
  reactions: Reactions[]
  social: Social
  commentPercentageChange: number
  postChangePercentage: number
}

interface UtilityState {
  loading: boolean
  topPosts: Post[]
  period: string
  postAnalysisData: Utility
  fromDate: Date | null
  toDate: Date | null
  getPostAnalysis: (url: string) => Promise<void>
  getTopPosts: (url: string) => Promise<void>
  setFromDate: (date: Date) => void
  setToDate: (date: Date) => void
  setPeriod: (period: string) => void
  setLoading?: (loading: boolean) => void
}

const PostAnalysisStore = create<UtilityState>((set) => ({
  loading: false,
  topPosts: [],
  period: 'all',
  fromDate: null,
  toDate: null,
  postAnalysisData: {
    post: {
      totalBookmarks: 0,
      totalLikes: 0,
      totalPosts: 0,
      totalReplies: 0,
      totalShares: 0,
      totalViews: 0,
    },
    comment: {
      totalComments: 0,
      totalHates: 0,
      totalLikes: 0,
      totalReplies: 0,
    },
    competition: {
      competitions: 0,
      spent: 0,
      received: 0,
      participated: 0,
      change: 0,
    },
    reactions: [],
    social: {
      friends: 0,
      following: 0,
      followers: 0,
    },
    commentPercentageChange: 0,
    postChangePercentage: 0,
  },

  setPeriod: (periodData: string) => {
    set((prev) => {
      return {
        period: periodData === prev.period ? 'all' : periodData,
      }
    })
  },

  setFromDate: (date: Date) => {
    set({ fromDate: date })
  },

  setToDate: (date: Date) => {
    set({ toDate: date })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  getPostAnalysis: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: PostAnalysisStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ postAnalysisData: data.result })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getTopPosts: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: PostAnalysisStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ topPosts: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },
}))

export default PostAnalysisStore
