import { create } from 'zustand'
import { customRequest } from '@/lib/api'
import { getAll, saveAll, upsert } from '@/lib/localStorage/db'
import isEqual from 'lodash/isEqual'

interface FetchMomentResponse {
  count: number
  message: string
  id: string
  page_size: number
  momentIndex: number
  mediaIndex: number
  results: Moment[]
  moment: Moment
}

export interface MomentMedia {
  type: string
  src: string
  preview: string
  content: string
  backgroundColor: string
  textColor: string
  duration: number
  isViewed: boolean
  createdAt: Date | null
}

export const MomentMediaEmpty = {
  type: '',
  backgroundColor: '#da3986',
  textColor: '#fff',
  src: '',
  preview: '',
  content: '',
  duration: 0,
  isViewed: false,
  createdAt: null,
}

export interface Moment {
  media: MomentMedia[]
  _id: string
  username: string
  displayName: string
  picture: string
  createdAt: Date | null
}

export const MomentEmpty = {
  media: [],
  _id: '',
  username: '',
  displayName: '',
  picture: '',
  createdAt: null,
}

interface MomentState {
  count: number
  page_size: number
  currentPage: number
  activeMomentIndex: number
  activeMomentMediaIndex: number
  activeMoment: Moment
  activeMomentMedia: MomentMedia
  momentMedia: MomentMedia
  moments: Moment[]
  showOptions: boolean
  editingId: string
  loading: boolean
  moment: Moment
  editingIndex: number
  hasMore: boolean
  isPlaying: boolean
  showMoment: boolean
  isEditing: boolean
  userHasMoment: boolean
  openMomentModal: (index: number) => void
  clearMoment: () => void
  expireOldMedia: () => void
  changeActiveMomentMedia: (index: number, int: number) => void
  setShowOptions: (state: boolean) => void
  setShowMoment: (state: boolean) => void
  setIsPlaying: (state: boolean) => void
  setIsEditing: (state: boolean, id: string, index: number) => void
  setForm: (key: keyof Moment, value: Moment[keyof Moment]) => void
  resetForm: () => void
  getSavedMoments: () => void
  getMoments: (url: string) => Promise<void>
  setProcessedResults: (data: FetchMomentResponse) => void
  deleteMoment: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateMoment: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>
}

export const MomentStore = create<MomentState>((set) => ({
  count: 0,
  page_size: 20,
  currentPage: 1,
  editingIndex: 0,
  activeMomentIndex: 0,
  activeMomentMediaIndex: 0,
  moments: [],
  activeMoment: MomentEmpty,
  moment: MomentEmpty,
  activeMomentMedia: MomentMediaEmpty,
  momentMedia: MomentMediaEmpty,
  editingId: '',
  showOptions: false,
  loading: false,
  hasMore: false,
  isEditing: false,
  showMoment: false,
  isPlaying: true,
  userHasMoment: false,
  setForm: (key, value) =>
    set((state) => ({
      moment: {
        ...state.moment,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      moment: MomentEmpty,
    }),

  setShowOptions: (state) => {
    set({
      showOptions: state,
    })
  },

  setIsPlaying: (state) => {
    set({
      isPlaying: state,
    })
  },

  setIsEditing: (state, id, index) => {
    set({
      isEditing: state,
      editingId: id,
      editingIndex: index,
    })
  },

  setShowMoment: (state) => {
    set({
      showMoment: state,
    })
  },

  changeActiveMomentMedia: (index, int) => {
    set((prev) => {
      return {
        activeMomentMediaIndex: index,
        activeMomentMedia: prev.moments[int].media[index],
      }
    })
  },

  expireOldMedia: () => {
    set((prev) => {
      const now = Date.now()

      const updatedMoments = prev.moments
        .map((moment) => {
          const filteredMedia = moment.media.filter((m) => {
            if (!m.createdAt) return true
            const expiry = new Date(m.createdAt).getTime() + 24 * 60 * 60 * 1000
            return expiry > now
          })

          // If all media expired, remove the moment completely
          if (filteredMedia.length === 0) return null

          // Otherwise return updated moment
          return { ...moment, media: filteredMedia }
        })
        .filter(Boolean) as Moment[]

      saveAll('moments', updatedMoments)
      return {
        moments: updatedMoments,
      }
    })
  },

  getSavedMoments: async () => {
    try {
      set({ loading: true })
      const moments = await getAll<Moment>('moments')
      if (moments) {
        set({ moments: moments })
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  openMomentModal: (index) => {
    set((prev) => {
      return {
        activeMoment: prev.moments[index],
        activeMomentMedia: prev.moments[index].media[0],
        activeMomentIndex: index,
        activeMomentMediaIndex: 0,
      }
    })
  },

  clearMoment: () => {
    set({
      activeMoment: MomentEmpty,
      activeMomentMedia: MomentMediaEmpty,
      activeMomentIndex: 0,
      activeMomentMediaIndex: 0,
    })
  },

  setProcessedResults: ({ count, results }: FetchMomentResponse) => {
    set({
      loading: false,
      count,
      moments: results,
    })
  },

  getMoments: async (url) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      set({ currentPage: 1 })
      if (data) {
        const fetchedMoments = data.results
        const savedMoments = MomentStore.getState().moments

        if (savedMoments.length > 0) {
          const merged = savedMoments.filter(
            (localItem) =>
              !fetchedMoments.some(
                (apiItem: Moment) => apiItem._id === localItem._id
              )
          )

          const toUpsert = fetchedMoments.filter((apiItem: Moment) => {
            const existing = savedMoments.find(
              (localItem) => localItem._id === apiItem._id
            )
            return !existing || !isEqual(existing, apiItem)
          })

          if (toUpsert.length > 0) {
            set({
              moments: merged,
            })

            for (const item of toUpsert) {
              await upsert('moments', item)
            }

            console.log(`✅ Upserted ${toUpsert.length} featured news item(s).`)
          } else {
            console.log('No new or updated featured news to upsert.')
          }
        } else {
          set({ moments: data.results })
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  updateMoment: async (url, updatedItem) => {
    set({ loading: true })

    const response = await customRequest({
      url,
      method: 'POST',
      showMessage: true,
      data: updatedItem,
    })
    const data = response?.data
    if (data) {
      MomentStore.getState().setProcessedResults(data)
    }
  },

  postItem: async (url, updatedItem, setMessage) => {
    set({ loading: true })

    const response = await customRequest({
      url,
      method: 'POST',
      showMessage: true,
      data: updatedItem,
    })
    const data = response?.data
    if (data) {
      MomentStore.getState().setProcessedResults(data)
    }
  },

  deleteMoment: async (url, setMessage) => {
    set({ loading: true })

    const response = await customRequest({
      url,
      method: 'DELETE',
      showMessage: true,
    })
    const data = response?.data
    if (data) {
      MomentStore.getState().clearMoment()

      MomentStore.setState((prev) => {
        const updatedMoments = prev.moments
          .map((item) => {
            if (item._id === data.id) {
              return data.moment ? data.moment : null
            }
            return item
          })
          .filter((item) => item !== null)

        return {
          moments: updatedMoments as typeof prev.moments,
          showOptions: false,
          isPlaying: true,
        }
      })
    }
  },
}))
