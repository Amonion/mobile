import { View, useColorScheme, TouchableOpacity, Text } from 'react-native'
import React from 'react'
import { router, Slot, usePathname } from 'expo-router'

export default function SettingsLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const pathname = usePathname()

  return (
    <>
      <View
        style={{
          flexGrow: 1,
          backgroundColor: isDark ? '#121314' : '#FFFFFF',
          paddingBottom: 40,
        }}
        className="flex-1 bg-primary dark:bg-dark-primary relative py-3"
      >
        <View className="flex-row border-b border-b-border dark:border-b-dark-border pt-2 pb-3 justify-center px-[10px]">
          <TouchableOpacity
            onPress={() => {
              if (pathname !== '/home/notifications') {
                router.push('/home/notifications')
              }
            }}
            className={`${
              pathname === '/home/notifications' ? 'pill' : 'pillInActive'
            } mx-1`}
          >
            <Text
              className={`${
                pathname === '/home/notifications'
                  ? 'text-white'
                  : 'text-primary dark:text-dark-primary'
              } text-lg`}
            >
              Social
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (pathname !== '/home/notifications/personal') {
                router.push('/home/notifications/personal')
              }
            }}
            className={`${
              pathname === '/home/notifications/personal'
                ? 'pill'
                : 'pillInActive'
            } mx-1`}
          >
            <Text
              className={`${
                pathname === '/home/notifications/personal'
                  ? 'text-white'
                  : 'text-primary dark:text-dark-primary'
              } text-lg`}
            >
              Personal
            </Text>
          </TouchableOpacity>
        </View>
        <Slot />
      </View>
    </>
  )
}
