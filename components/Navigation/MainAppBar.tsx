import {
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
  LayoutChangeEvent,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Bell, Gift, Globe, Megaphone, Menu, Search } from 'lucide-react-native'
import { useRouter } from 'expo-router'

const MainAppBar = ({ onMenuPress }: { onMenuPress: () => void }) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const router = useRouter()

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
        paddingTop: insets.top,
      }}
      className="text bg-primary dark:bg-dark-primary border-b border-b-border dark:border-b-dark-border"
    >
      <View className="flex flex-row w-full relative items-center justify-between">
        <TouchableOpacity
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-3"
          onPress={onMenuPress}
        >
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
        <TouchableOpacity
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-3"
          onPress={() => router.push('/posts')}
        >
          <Search size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
      </View>
      <View className="flex flex-row w-full items-center justify-between">
        <TouchableOpacity
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-3"
        >
          <Megaphone size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>

        <TouchableOpacity
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-3"
          onPress={() => router.push('/home/news')}
        >
          <Globe size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-3"
        >
          <Gift size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-3"
        >
          <Bell size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default MainAppBar
