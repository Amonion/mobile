import { AlartStore } from '@/store/notification/Message'
import React from 'react'
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function UserAlert() {
  const { text, title, display, cancel, continue: confirmAction } = AlartStore()
  const insets = useSafeAreaInsets()
  const height = Dimensions.get('window').height
  return (
    <Modal
      visible={display}
      animationType="fade"
      transparent
      onRequestClose={cancel}
      style={{
        zIndex: 1000,
      }}
    >
      <View
        style={{
          height: height,
        }}
        className="w-full z-50 absolute top-0 left-0 justify-start items-center bg-black/60 px-4"
      >
        <View
          style={{
            marginTop: insets.top,
          }}
          className="bg-custom text-white p-4 rounded-xl w-full max-w-[500px]"
        >
          <View className="flex-row items-center justify-center mb-2">
            <Text className="text-xl mr-2">⚠️</Text>
            <Text className="text-xl text-white">{title}</Text>
          </View>
          <Text className="text-base text-white mb-4">{text}</Text>
          <View className="flex-row justify-end">
            <TouchableOpacity
              className="border border-gray-300 px-4 py-2 rounded-md mr-2"
              onPress={cancel}
            >
              <Text className="text-gray-300">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white px-4 py-2 rounded-md border border-gray-300"
              onPress={confirmAction}
            >
              <Text className="text-[var(--custom-color)]">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
