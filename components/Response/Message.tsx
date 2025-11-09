import { MessageStore } from '@/store/notification/Message'
import { View, Text, TouchableWithoutFeedback } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Message() {
  const { message, isSuccess, clearMessage } = MessageStore()
  const insets = useSafeAreaInsets()

  return (
    <>
      <TouchableWithoutFeedback onPress={clearMessage}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            paddingTop: insets.top,
          }}
          className={`h-full px-3 w-full bg-black/20 z-50 `}
        >
          <View
            className={`${
              isSuccess ? 'bg-green-500' : 'bg-custom'
            } rounded-[10px] mt-2 py-1 px-2 z-50 w-full`}
          >
            <Text className="flex text-white text-center  text-lg">
              {message}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </>
  )
}
