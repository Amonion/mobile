import { create } from 'zustand'
import { customRequest } from '@/lib/api'
import { getDB } from '@/lib/roomDB'
import AsyncStorage from '@react-native-async-storage/async-storage'

const MOMENTS_KEY = 'moments'

export const getMomentsFromDB = async (
  page = 1,
  limit = 20
): Promise<Moment[]> => {
  const db = await getDB()
  if (!db) throw new Error('Database not initialized')

  const offset = (page - 1) * limit

  const rows = await db.getAllAsync<any>(
    `
    SELECT * FROM moments
    ORDER BY datetime(createdAt) DESC
    LIMIT ? OFFSET ?;
    `,
    [limit, offset]
  )

  const moments: Moment[] = rows.map((row) => ({
    ...row,
    createdAt: row.createdAt ? new Date(row.createdAt) : null,
    media: row.media ? JSON.parse(row.media) : [],
  }))

  return moments
}

// export const saveMomentsToDB = async (moments: Moment[]): Promise<boolean> => {
//   if (!moments?.length) return false

//   const db = await getDB()
//   if (!db) throw new Error('Database not initialized')

//   try {
//     await db.execAsync('BEGIN TRANSACTION;')

//     for (const moment of moments) {
//       const mediaJson = JSON.stringify(moment.media ?? [])
//       const createdAt =
//         moment.createdAt instanceof Date
//           ? moment.createdAt.toISOString()
//           : moment.createdAt
//           ? new Date(moment.createdAt).toISOString()
//           : new Date().toISOString()

//       await db.runAsync(
//         `
//         INSERT OR REPLACE INTO moments
//         (_id, username, displayName, picture, createdAt, media)
//         VALUES (?, ?, ?, ?, ?, ?);
//         `,
//         [
//           moment._id,
//           moment.username,
//           moment.displayName,
//           moment.picture,
//           createdAt,
//           mediaJson,
//         ]
//       )
//     }

//     await db.execAsync('COMMIT;')
//     return true
//   } catch (err) {
//     console.error('❌ Error saving moments to DB:', err)
//     try {
//       await db.execAsync('ROLLBACK;')
//     } catch {}
//     return false
//   }
// }

export const saveMomentsToDB = async (moments: Moment[]): Promise<boolean> => {
  if (!moments?.length) return false

  const db = await getDB()
  if (!db) throw new Error('Database not initialized')

  try {
    await db.withTransactionAsync(async () => {
      for (const moment of moments) {
        const mediaJson = JSON.stringify(moment.media ?? [])
        const createdAt =
          moment.createdAt instanceof Date
            ? moment.createdAt.toISOString()
            : moment.createdAt
            ? new Date(moment.createdAt).toISOString()
            : new Date().toISOString()

        await db.runAsync(
          `
          INSERT OR REPLACE INTO moments
          (_id, username, displayName, picture, createdAt, media)
          VALUES (?, ?, ?, ?, ?, ?);
          `,
          [
            moment._id,
            moment.username,
            moment.displayName,
            moment.picture,
            createdAt,
            mediaJson,
          ]
        )
      }
    })

    console.log('✅ Moments saved successfully.')
    return true
  } catch (err) {
    console.error('❌ Error saving moments to DB:', err)
    return false
  }
}

export const deleteAllMomentsFromDB = async (): Promise<boolean> => {
  const db = await getDB()
  if (!db) throw new Error('Database not initialized')

  try {
    await db.execAsync('BEGIN TRANSACTION;')
    await db.execAsync('DELETE FROM moments;')
    await db.execAsync('COMMIT;')

    return true
  } catch (err) {
    console.error('❌ Failed to delete all moments:', err)
    try {
      await db.execAsync('ROLLBACK;')
    } catch {}
    return false
  }
}

export const getAndDeleteExpiredMomentsFromDB = async (): Promise<Moment[]> => {
  const db = await getDB()
  if (!db) throw new Error('Database not initialized')

  try {
    const now = Date.now()
    const ONE_DAY = 24 * 60 * 60 * 1000

    // Fetch all moments
    const rows: any[] = await db.getAllAsync('SELECT * FROM moments;')

    const expiredMoments: Moment[] = rows
      .map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        media: r.media ? JSON.parse(r.media) : [],
      }))
      .filter((m) => now - m.createdAt.getTime() > ONE_DAY)

    if (expiredMoments.length === 0) {
      console.log('⏳ No expired moments found.')
      return []
    }

    await db.execAsync('BEGIN TRANSACTION;')
    for (const m of expiredMoments) {
      await db.runAsync('DELETE FROM moments WHERE _id = ?;', [m._id])
      console.log(`🗑️ Deleted expired moment: ${m._id}`)
    }
    await db.execAsync('COMMIT;')

    console.log(`✅ Deleted ${expiredMoments.length} expired moments.`)
    return expiredMoments
  } catch (err) {
    console.error('❌ Failed to delete expired moments:', err)
    try {
      await db.execAsync('ROLLBACK;')
    } catch {}
    return []
  }
}

export const updateMomentInLocalStorage = async (updatedMoment: Moment) => {
  try {
    const stored = await AsyncStorage.getItem(MOMENTS_KEY)
    let moments: Moment[] = stored ? JSON.parse(stored) : []

    const existingIndex = moments.findIndex(
      (m) => m.username === updatedMoment.username
    )

    if (existingIndex !== -1) {
      moments[existingIndex] = updatedMoment
    } else {
      moments.push(updatedMoment)
    }

    await AsyncStorage.setItem(MOMENTS_KEY, JSON.stringify(moments))
    await saveMomentsToDB(moments)

    console.log('✅ Moment updated in local storage and DB')
  } catch (error) {
    console.error('❌ Failed to update moment in local storage:', error)
  }
}

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

  getSavedMoments: async () => {
    try {
      set({ loading: true })
      const moments = await getMomentsFromDB()
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
      if (data) {
        const moments = MomentStore.getState().moments
        if (data.results.length > 0) {
          const newMoments: Moment[] = data.results.filter(
            (item: Moment) => !moments.some((m) => m._id === item._id)
          )
          if (newMoments.length > 0) {
            set((prev) => {
              return {
                moments: [...prev.moments, ...newMoments],
              }
            })
            await saveMomentsToDB(newMoments)
          } else {
            console.log('No new moments to add.')
          }
        } else {
          // deleteAllMomentsFromDB()
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
