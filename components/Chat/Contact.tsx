import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native'
import * as Contacts from 'expo-contacts'

export type ContactListProps = {
  onSelect: (contact: Contacts.Contact) => void
}

export default function ContactList({ onSelect }: ContactListProps) {
  const [contacts, setContacts] = useState<Contacts.Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [permission, setPermission] = useState<boolean | null>(null)

  const [search, setSearch] = useState('')

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    setLoading(true)

    const { status } = await Contacts.requestPermissionsAsync()
    const granted = status === 'granted'
    setPermission(granted)

    if (!granted) {
      setLoading(false)
      return
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
      pageSize: 2000,
      sort: Contacts.SortTypes.FirstName,
    })

    setContacts(data)
    setLoading(false)
  }

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts

    const q = search.toLowerCase()

    return contacts.filter((c) => {
      const name = c.name?.toLowerCase() || ''
      const first = c.firstName?.toLowerCase() || ''
      const last = c.lastName?.toLowerCase() || ''
      const number = c.phoneNumbers?.[0]?.number?.toLowerCase() || ''

      return (
        name.includes(q) ||
        first.includes(q) ||
        last.includes(q) ||
        number.includes(q)
      )
    })
  }, [search, contacts])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>
          Permission to access contacts is required.
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 🔍 Search Input */}
      <TextInput
        placeholder="Search contacts..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        placeholderTextColor="#777"
      />

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => String((item as any).id)}
        keyboardShouldPersistTaps="always"
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.firstName?.[0] ?? item.name?.[0] ?? '?'}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>

              {item.phoneNumbers?.length ? (
                <Text style={styles.number}>{item.phoneNumbers[0].number}</Text>
              ) : (
                <Text style={styles.noNumber}>No phone number</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  search: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 16,
    marginBottom: 6,
  },
  item: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: '#dedede',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  number: {
    fontSize: 14,
    color: '#555',
  },
  noNumber: {
    fontSize: 13,
    color: 'gray',
    fontStyle: 'italic',
  },
})
