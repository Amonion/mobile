import { MessageStore } from '@/store/notification/Message'
import React from 'react'
import { View, Text } from 'react-native'

const OnlineBanner = () => {
  const { onlineMessage, online } = MessageStore()

  return (
    <>
      {onlineMessage && (
        <View
          className={`${
            online ? 'bg-[#00B809]' : 'bg-custom'
          } w-full items-center`}
        >
          <Text className="text-white text-sm">{onlineMessage}</Text>
        </View>
      )}
    </>
  )
}

export default OnlineBanner
