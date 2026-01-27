import NotificationCard from '@/components/Notification/NotificationCard'
import { AuthStore } from '@/store/AuthStore'
import { NotificationStore } from '@/store/notification/Notification'
import { usePathname } from 'expo-router'
import React, { useEffect } from 'react'
import { Animated, Text, Image, View, RefreshControl } from 'react-native'

const Notifications = () => {
  const {
    getSavedNotifications,
    getMoreSavedNotifications,
    readNotifications,
    notifications,
    loading,
    hasMore,
  } = NotificationStore()
  const { user } = AuthStore()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/home/notifications' && user && notifications) {
      const notes = notifications.filter((e) => e.unread === true)
      if (notes.length > 0) {
        const noteIds = notes.map((note) => note._id)
        const form = new FormData()
        form.append('ids', JSON.stringify(noteIds))
        readNotifications(
          `/notifications/social/read/?username=${user?.username}`,
          form
        )
      }
    }
  }, [pathname, user, notifications.length])

  return (
    <>
      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-3">
          <Text className="text-2xl mb-3 text-secondary dark:text-dark-secondary font-semibold text-center">
            Sorry! No Social Notifications
          </Text>
          <Image
            source={require('@/assets/images/socialize.png')}
            style={{ height: 300, width: '100%', objectFit: 'contain' }}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View className="flex-1 bg-secondary dark:bg-dark-secondary">
          <Animated.FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <NotificationCard notification={item} />}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                progressViewOffset={10}
                refreshing={loading}
                onRefresh={() => getSavedNotifications()}
              />
            }
            scrollEventThrottle={16}
            onEndReachedThreshold={0.2}
            onEndReached={() => {
              if (hasMore && !loading) {
                getMoreSavedNotifications()
              }
            }}
          />
        </View>
      )}
    </>
  )
}

export default Notifications
