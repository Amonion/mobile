import AsyncStorage from '@react-native-async-storage/async-storage'

export type TableName = 'news' | 'posts' | 'moments' | 'mainNews'

const PREFIX = '@localdb:'

const tableKey = (table: TableName) => `${PREFIX}${table}`

export async function getAll<T>(table: TableName): Promise<T[]> {
  try {
    const json = await AsyncStorage.getItem(tableKey(table))
    return json ? JSON.parse(json) : []
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

    // Create a map of existing items
    const map = new Map(existing.map((item) => [item._id, item]))

    // Merge new items (overwrite if _id exists)
    for (const item of data) {
      map.set(item._id, item)
    }

    const merged = Array.from(map.values())
    await AsyncStorage.setItem(tableKey(table), JSON.stringify(merged))
  } catch (err) {
    console.error(`Error upserting table "${table}"`, err)
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

export async function clearTable(table: TableName): Promise<void> {
  await AsyncStorage.removeItem(tableKey(table))
}

export async function clearAllTables(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys()
  const localKeys = keys.filter((k) => k.startsWith(PREFIX))
  await AsyncStorage.multiRemove(localKeys)
}
