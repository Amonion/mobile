import {
  View,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Text,
} from 'react-native'
import React from 'react'
import { router, Slot, usePathname } from 'expo-router'
export default function SettingsLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const pathname = usePathname()

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: isDark ? '#1C1E21' : '#FFFFFF',
          paddingBottom: 40,
        }}
        className="flex-1 bg-primary dark:bg-dark-primary relative py-3"
      >
        <View className="flex-row border-b border-b-border dark:border-b-dark-border pt-2 pb-3 justify-center px-[10px] mb-5">
          <TouchableOpacity
            onPress={() => {
              if (pathname !== '/home/settings') {
                router.push('/home/settings')
              }
            }}
            className={`${
              pathname === '/home/settings' ? 'pill' : 'pillInActive'
            } mx-1`}
          >
            <Text
              className={`${
                pathname === '/home/settings'
                  ? 'text-white'
                  : 'text-primary dark:text-dark-primary'
              } text-lg`}
            >
              Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (pathname !== '/home/settings/social') {
                router.push('/home/settings/social')
              }
            }}
            className={`${
              pathname === '/home/settings/social' ? 'pill' : 'pillInActive'
            } mx-1`}
          >
            <Text
              className={`${
                pathname === '/home/settings/social'
                  ? 'text-white'
                  : 'text-primary dark:text-dark-primary'
              } text-lg`}
            >
              Social
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (pathname !== '/home/settings/notification') {
                router.push('/home/settings/notification')
              }
            }}
            className={`${
              pathname === '/home/settings/notification'
                ? 'pill'
                : 'pillInActive'
            } mx-1`}
          >
            <Text
              className={`${
                pathname === '/home/settings/notification'
                  ? 'text-white'
                  : 'text-primary dark:text-dark-primary'
              } text-lg`}
            >
              Notification
            </Text>
          </TouchableOpacity>
        </View>
        <Slot />
      </ScrollView>
    </>
  )
}
