import { formatDate, formatTimeTo12Hour } from '@/lib/helpers'
import { router } from 'expo-router'
import React from 'react'
import { View, Text, useColorScheme, useWindowDimensions } from 'react-native'
import RenderHtml, { CustomRendererProps } from 'react-native-render-html'
import { Notification } from '@/store/notification/Notification'

interface Props {
  notification: Notification
}

const NotificationCard = ({ notification }: Props) => {
  const { width } = useWindowDimensions()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false

  const renderers = {
    a: ({ tnode }: CustomRendererProps<any>) => {
      const href = tnode.attributes?.href
      const text =
        tnode.children
          .map((child: any) => child.data || '')
          .join(' ')
          .trim() || 'click here'

      return (
        <Text
          style={{ color: '#DA3986', textDecorationLine: 'underline' }}
          onPress={() => {
            if (href?.includes('/home/chat/')) {
              const parts = href.split('/')
              const username = parts[parts.length - 1]
              router.push(`/chat/${username}`)
            }
          }}
        >
          {text}
        </Text>
      )
    },
  }

  return (
    <View className="bg-primary dark:bg-dark-primary px-4 py-2 mb-[3px]">
      <View className="flex-row">
        <Text className="text-lg text-secondary dark:text-dark-secondary mb-3">
          {notification.title}
        </Text>
      </View>
      <View className="flex-row mb-2 items-end">
        <Text className="mr-2 text-secondary dark:text-dark-secondary">
          {notification.greetings}
        </Text>
        <Text className="font-medium text-custom">
          {notification.receiverName}
        </Text>
        <Text className="ml-auto text-primary dark:text-dark-primary text-sm">
          {formatTimeTo12Hour(notification.createdAt)}
        </Text>
      </View>
      <View className="text-secondary dark:text-dark-secondary">
        <RenderHtml
          contentWidth={width}
          source={{ html: notification.content }}
          renderers={renderers}
          baseStyle={{
            color: isDark ? '#848484' : '#A4A2A2',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 20,
          }}
        />
      </View>
      <View className="ml-auto items-end">
        <Text className="text-primary dark:text-dark-primary text-sm">
          {formatDate(String(notification.createdAt))}
        </Text>
      </View>
    </View>
  )
}

export default NotificationCard
