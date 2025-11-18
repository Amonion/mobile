import { NavStore } from '@/store/notification/Navigation'
import React, { useEffect, useState } from 'react'
import { TextInput, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const FriendsSearchHeader = () => {
  const { setSearchedText } = NavStore()
  const [text, setText] = useState('')
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()

  const isDark = colorScheme === 'dark'

  useEffect(() => {
    setSearchedText(text)
  }, [text])

  return (
    <View>
      <View
        style={{
          paddingTop: insets.top,
        }}
        className="pb-[5px] bg-primary dark:bg-dark-primary shadow-md border-b border-b-border dark:border-b-dark-border"
      >
        <View className="flex-row w-full items-center justify-between mb-2">
          <View
            style={{
              height: 40,
            }}
            className="items-center mx-3 relative flex-1 bg-secondary dark:bg-dark-secondary rounded-[25px]"
          >
            <TextInput
              value={text}
              onChangeText={setText}
              // onKeyPress={() => toggleTraceSettings(false)}
              autoCorrect={false}
              keyboardType="default"
              placeholder="Search conversations..."
              placeholderTextColor={isDark ? '#BABABA' : '#6E6E6E'}
              className="h-full text-base w-full flex-1 text-primary dark:text-dark-primary px-4"
            />
          </View>
        </View>
      </View>
    </View>
  )
}

export default FriendsSearchHeader
