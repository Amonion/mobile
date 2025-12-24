import NotificationCard from '@/components/Notification/NotificationCard'
import { AuthStore } from '@/store/AuthStore'
import { PersonalNotificationStore } from '@/store/notification/PersonalNotification'
import { usePathname } from 'expo-router'
import React, { useEffect } from 'react'
import { Animated, View, RefreshControl } from 'react-native'

const PersonalNotifications = () => {
  const {
    getSavedPersonalNotifications,
    getMoreSavedPersonalNotifications,
    readPersonalNotifications,
    personalNotifications,
    loading,
    hasMore,
  } = PersonalNotificationStore()
  const { user } = AuthStore()
  const pathname = usePathname()

  useEffect(() => {
    if (
      pathname === '/home/notifications/personal' &&
      user &&
      personalNotifications
    ) {
      const notes = personalNotifications.filter((e) => e.unread === true)
      if (notes.length > 0) {
        const noteIds = notes.map((note) => note._id)
        const form = new FormData()
        form.append('ids', JSON.stringify(noteIds))
        readPersonalNotifications(
          `/notifications/personal/read/?username=${user?.username}`,
          form
        )
      }
    }
  }, [pathname, user, personalNotifications.length])

  return (
    <>
      <View className="flex-1 bg-secondary dark:bg-dark-secondary">
        <Animated.FlatList
          data={personalNotifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <NotificationCard notification={item} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              progressViewOffset={10}
              refreshing={loading}
              onRefresh={() => getSavedPersonalNotifications()}
            />
          }
          scrollEventThrottle={16}
          onEndReachedThreshold={0.2}
          onEndReached={() => {
            if (hasMore && !loading) {
              getMoreSavedPersonalNotifications()
            }
          }}
        />
      </View>
    </>
  )
}

export default PersonalNotifications
