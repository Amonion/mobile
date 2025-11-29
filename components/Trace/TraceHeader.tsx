import { NavStore } from '@/store/notification/Navigation'
import { Feather } from '@expo/vector-icons'
import { usePathname } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { TextInput, TouchableOpacity, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const TraceHeader = () => {
  const { setSearchedText } = NavStore()
  const [text, setText] = useState('')
  const [placeHolder, setPlaceHolder] = useState('')
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const pathname = usePathname()
  const isDark = colorScheme === 'dark'

  useEffect(() => {
    setSearchedText(text)
  }, [text])
  useEffect(() => {
    if (pathname.includes('posts')) {
      setPlaceHolder('Search Posts')
    } else if (pathname.includes('accounts')) {
      setPlaceHolder('Search Accounts')
    } else {
      setPlaceHolder('Search People')
    }
    setSearchedText(text)
  }, [text])

  return (
    <View>
      <View
        style={{
          paddingTop: insets.top,
        }}
        className="bg-primary dark:bg-dark-primary"
      >
        <View className="px-2 flex-row w-full items-center justify-between">
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
              placeholder={placeHolder}
              placeholderTextColor="#888"
              className="h-full text-base w-full flex-1 text-primary dark:text-dark-primary px-4"
            />
          </View>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
            }}
            // onPress={() => toggleTraceSettings()}
            className="bg-secondary items-center block justify-center dark:bg-dark-secondary rounded-full"
          >
            <Feather
              name="sliders"
              size={18}
              color={isDark ? '#BABABA' : '#6E6E6E'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default TraceHeader
