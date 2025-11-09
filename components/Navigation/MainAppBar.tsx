import {
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
  LayoutChangeEvent,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCallback } from 'react'
import { Bell, Gift, Globe, Megaphone, Menu, Search } from 'lucide-react-native'
import { NavStore } from '@/store/notification/Navigation'

const MainAppBar = ({ onMenuPress }: { onMenuPress: () => void }) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  // const { setNavBarHeight } = NavStore()
  const insets = useSafeAreaInsets()

  // const handleLayout = useCallback(
  //   (event: LayoutChangeEvent) => {
  //     const { height } = event.nativeEvent.layout
  //     setNavBarHeight(height)
  //   },
  //   [setNavBarHeight]
  // )

  return (
    <View
      // onLayout={handleLayout}
      style={{
        paddingTop: Platform.OS === 'ios' ? 10 : insets.top,
      }}
      className="text px-4 py-2 bg-primary dark:bg-dark-primary border-b border-b-border dark:border-b-dark-border"
    >
      <View className="flex flex-row w-full relative items-center justify-between mb-2">
        <TouchableOpacity onPress={onMenuPress} className="sm:hidden">
          <Menu size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
        <TouchableOpacity className="absolute left-[50%] pt-3 translate-x-[-50%]">
          <Image
            source={require('@/assets/images/app-icon.png')}
            resizeMode="contain"
            style={{
              width: 40,
              height: 40,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity className="sm:hidden">
          <Search size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
      </View>
      <View className="flex flex-row w-full items-center justify-between">
        <TouchableOpacity>
          <Megaphone size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>

        <TouchableOpacity>
          <Globe size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Gift size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Bell size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default MainAppBar
