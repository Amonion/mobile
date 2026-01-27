import { ChatContent } from '@/store/chat/Chat'
import { Friend } from '@/store/chat/Friend'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type TableName =
  | 'news'
  | 'posts'
  | 'moments'
  | 'exams'
  | 'friends'
  | 'chats'
  | 'giveaway'
  | 'accounts'
  | 'people'
  | 'notifications'
  | 'personal_notifications'
  | 'questions'
  | 'last_questions'
  | 'following_posts'

const PREFIX = '@localdb:'

const tableKey = (table: TableName) => `${PREFIX}${table}`

export interface GetAllOptions {
  page?: number
  pageSize?: number
  filter?: Partial<Record<string, any>>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export async function getAll<T>(
  table: TableName,
  options?: GetAllOptions
): Promise<T[]> {
  try {
    const json = await AsyncStorage.getItem(tableKey(table))
    let items: T[] = json ? JSON.parse(json) : []

    // Apply filter
    if (options?.filter) {
      const filter = options.filter
      items = items.filter((item) =>
        Object.entries(filter).every(([key, value]) => {
          return (item as any)[key] === value
        })
      )
    }

    // Apply sorting if provided
    if (options?.sortBy) {
      const { sortBy, sortOrder = 'asc' } = options

      items.sort((a: any, b: any) => {
        const valA = a[sortBy]
        const valB = b[sortBy]

        if (sortOrder === 'asc') return valA - valB
        return valB - valA
      })
    }

    // If no pagination, return now
    if (!options?.pageSize || !options?.page) {
      return items
    }

    // Pagination
    const { page, pageSize } = options
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return items.slice(start, end)
  } catch (err) {
    console.error(`Error reading table "${table}"`, err)
    return []
  }
}

export async function saveAll<T>(table: TableName, data: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(tableKey(table), JSON.stringify(data))
  } catch (err) {
    console.error(`Error saving table "${table}"`, err)
  }
}

export async function upsertAll<T extends { _id: string }>(
  table: TableName,
  data: T[]
): Promise<void> {
  try {
    const existingRaw = await AsyncStorage.getItem(tableKey(table))
    const existing: T[] = existingRaw ? JSON.parse(existingRaw) : []

    const map = new Map(existing.map((item) => [item._id, item]))

    for (const item of data) {
      map.set(item._id, item)
    }

    const merged = Array.from(map.values())
    await AsyncStorage.setItem(tableKey(table), JSON.stringify(merged))
  } catch (err) {
    console.error(`Error upserting table "${table}"`, err)
  }
}

export async function upsertChats(
  table: TableName,
  data: ChatContent[]
): Promise<void> {
  try {
    const existingRaw = await AsyncStorage.getItem(tableKey(table))
    const existing: ChatContent[] = existingRaw ? JSON.parse(existingRaw) : []

    // Use a composite key: `${connection}-${timeNumber}`
    const map = new Map(
      existing.map((item) => [`${item.connection}-${item.timeNumber}`, item])
    )

    // Insert or update incoming chats
    for (const chat of data) {
      const key = `${chat.connection}-${chat.timeNumber}`
      map.set(key, chat)
    }

    // Convert to array and sort oldest → newest
    const merged = Array.from(map.values()).sort(
      (a, b) => a.timeNumber - b.timeNumber
    )

    await AsyncStorage.setItem(tableKey(table), JSON.stringify(merged))
  } catch (err) {
    console.error(`Error upserting chats into "${table}"`, err)
  }
}

export async function upsertFriends(
  table: TableName,
  data: Friend[]
): Promise<void> {
  try {
    const existingRaw = await AsyncStorage.getItem(tableKey(table))
    const existing: Friend[] = existingRaw ? JSON.parse(existingRaw) : []

    // Use connection as the unique key
    const map = new Map(existing.map((item) => [item.connection, item]))

    // Insert or update incoming friends
    for (const friend of data) {
      map.set(friend.connection, friend)
    }

    const merged = Array.from(map.values())

    await AsyncStorage.setItem(tableKey(table), JSON.stringify(merged))
  } catch (err) {
    console.error(`Error upserting friends into "${table}"`, err)
  }
}

export async function upsert<T extends { _id?: string }>(
  table: TableName,
  record: T
): Promise<void> {
  const all = await getAll<T>(table)
  const index = all.findIndex(
    (r) => r._id && record._id && r._id === record._id
  )
  if (index >= 0) {
    all[index] = { ...all[index], ...record }
  } else {
    all.unshift(record)
  }
  await saveAll(table, all)
}

export async function remove(table: TableName, id: string): Promise<void> {
  const all = await getAll<any>(table)
  const filtered = all.filter((r) => r._id !== id)
  await saveAll(table, filtered)
}

export async function deleteChat(table: TableName, id: number): Promise<void> {
  const all = await getAll<any>(table)
  const filtered = all.filter((r) => r.timeNumber !== id)
  await saveAll(table, filtered)
}

export async function clearTable(table: TableName): Promise<void> {
  await AsyncStorage.removeItem(tableKey(table))
}

export async function clearAllTables(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys()
  const localKeys = keys.filter((k) => k.startsWith(PREFIX))
  await AsyncStorage.multiRemove(localKeys)
}
