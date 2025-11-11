import { create } from 'zustand'
import { customRequest } from '@/lib/api'
import { Post, PostEmpty } from './Post'

interface FetchCommentResponse {
  count: number
  message: string
  page_size: number
  results: Comment[]
  data: Comment
}

interface PostResponse {
  message: string
  data: Comment
}

export interface Comment {
  _id: string
  username: string
  userId: string
  replyToId: string
  replyTo: string
  message: string
  postId: string
  uniqueId: string
  displayName: string
  content: string
  commentMedia: string | File
  comments: Comment[]
  user: string
  picture: string
  isVerified: boolean
  isSelected: boolean
  isPinned: boolean
  blocked: boolean
  level: number
  shares: number
  bookmarks: number
  replies: number
  likes: number
  hates: number
  createdAt: Date | null | string
  followed: boolean
  muted: boolean
  liked: boolean
  hated: boolean
  isChecked?: boolean
  isActive?: boolean
}

export const CommentEmpty = {
  _id: '',
  replyToId: '',
  replyTo: '',
  username: '',
  message: '',
  userId: '',
  postId: '',
  uniqueId: '',
  displayName: '',
  content: '',
  commentMedia: '',
  comments: [],
  user: '',
  picture: '',
  isVerified: false,
  isSelected: false,
  isPinned: false,
  blocked: false,
  level: 0,
  shares: 0,
  bookmarks: 0,
  replies: 0,
  likes: 0,
  hates: 0,
  createdAt: null,
  followed: false,
  muted: false,
  liked: false,
  hated: false,
  isChecked: false,
  isActive: false,
}

interface CommentState {
  count: number
  sort: string
  currentPage: number
  page_size: number
  progress: number
  mediaHeight: string
  commentResults: Comment[]
  comments: Comment[]
  activeComment: Comment
  tempComment: Comment
  postedComment: Comment
  loading: boolean
  fitMode: boolean
  isMobile: boolean
  showComments: boolean
  showGlassComments: boolean
  showActions: boolean
  error: string | null
  successs?: string | null
  isAllChecked: boolean
  hasMoreComments: boolean
  isPlaying: boolean
  commentForm: Post
  mainPost: Post
  setForm: (key: keyof Post, value: Post[keyof Post]) => void
  setMediaHeight: (height: string) => void
  setIsMobile: (status: boolean) => void
  resetForm: () => void
  getComments: (url: string) => Promise<void>
  getAComment: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchCommentResponse) => void
  removeComments: (id: string) => void
  setTempComment: (comment: Comment) => void
  setActiveComment: (comment: Comment) => void
  setMainPost: (post: Post) => void
  setShowActions: (loading: boolean) => void
  setShowComment: (loading: boolean) => void
  setShowGlassComment: (loading: boolean) => void
  setProgress: (progress: number) => void
  setFitMode: (status: boolean) => void
  togglePlay: (play: boolean) => void
  setLoading?: (loading: boolean) => void
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    refreshUrl?: string
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateComment: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
  toggleActive: (index: number) => void
  reshuffleResults: () => void
  resetPostedComment: () => void
  resetActiveComment: () => void
}

const CommentStore = create<CommentState>((set) => ({
  count: 0,
  sort: '-createdAt',
  page_size: 20,
  currentPage: 1,
  progress: 0,
  mediaHeight: '100vh',
  commentResults: [],
  comments: [],
  isMobile: false,
  loading: false,
  fitMode: false,
  isPlaying: true,
  showActions: false,
  showComments: false,
  showGlassComments: false,
  error: null,
  selectedComments: [],
  searchResult: [],
  isAllChecked: false,
  hasMoreComments: false,
  commentForm: PostEmpty,
  mainPost: PostEmpty,
  activeComment: CommentEmpty,
  postedComment: CommentEmpty,
  tempComment: CommentEmpty,
  setForm: (key, value) =>
    set((state) => ({
      commentForm: {
        ...state.commentForm,
        [key]: value,
      },
    })),

  setMediaHeight: (height) => {
    set({
      mediaHeight: height,
    })
  },
  setIsMobile: (status) =>
    set({
      isMobile: status,
    }),
  resetForm: () =>
    set({
      activeComment: CommentEmpty,
    }),
  resetPostedComment: () => set({ postedComment: CommentEmpty }),
  resetActiveComment: () => set({ activeComment: CommentEmpty }),
  setFitMode: (status: boolean) => {
    set({ fitMode: status })
  },
  setShowGlassComment: (loadState: boolean) => {
    set({ showGlassComments: loadState })
  },
  setShowComment: (loadState: boolean) => {
    set({ showComments: loadState })
  },
  setProgress: (progress: number) => {
    set({ progress: progress })
  },
  setActiveComment: (comment: Comment) => {
    set({ activeComment: comment })
  },
  setShowActions: (status: boolean) => {
    set({ showActions: status })
  },
  togglePlay: (status: boolean) => {
    set({ isPlaying: status })
  },
  setMainPost: (post: Post) => {
    set({ mainPost: post })
  },

  setTempComment: (comment: Comment) => {
    set({ tempComment: comment })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  getAComment: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await customRequest({ url })

      const data = response?.data
      if (data) {
        set({
          commentForm: { ...CommentStore.getState().commentForm, ...data },
          loading: false,
        })
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getComments: async (url: string) => {
    try {
      const response = await customRequest({ url })

      const data = response?.data
      if (data) {
        CommentStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  setProcessedResults: ({
    count,
    page_size,
    results,
  }: FetchCommentResponse) => {
    set((state) => {
      return {
        loading: false,
        hasMoreComments: state.page_size === results.length,
        count,
        page_size,
        comments: results,
      }
    })
  },

  removeComments: (id: string) => {
    set((state) => ({
      commentResults: state.commentResults.filter((post) => post.postId !== id),
    }))
  },

  reshuffleResults: async () => {
    set((state) => ({
      commentResults: state.commentResults.map((item: Comment) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  deleteItem: async (url: string) => {
    set({
      loading: true,
    })

    const response = await customRequest({
      url,
      method: 'DELETE',
      showMessage: true,
    })
    if (response) {
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => {
    try {
      set({ loading: true })

      const response = await customRequest({
        url,
        method: 'POST',
        showMessage: true,
        data: updatedItem,
      })
      const data = response?.data
      if (data) {
        set({ postedComment: data.data })
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  updateComment: async (url, updatedItem) => {
    try {
      await customRequest({
        url,
        method: 'PATCH',
        showMessage: true,
        data: updatedItem,
      })
    } catch (error) {
      console.log(error)
    }
  },

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
    const data = response?.data.data
    if (data) {
      CommentStore.setState((state) => ({
        commentResults: state.commentResults.map((post) =>
          post._id === data._id
            ? data
            : post.userId === data.userId
            ? { ...post, followed: data.followed }
            : post
        ),
      }))
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.commentResults[index]?.isActive
      const updatedResults = state.commentResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        commentResults: updatedResults,
      }
    })
  },
}))

export default CommentStore
