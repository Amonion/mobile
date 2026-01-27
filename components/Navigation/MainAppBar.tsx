import { View, Image, TouchableOpacity, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Bell, Gift, Globe, Megaphone, Menu, Search } from 'lucide-react-native'
import { usePathname, useRouter } from 'expo-router'

const MainAppBar = ({ onMenuPress }: { onMenuPress: () => void }) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const router = useRouter()
  const pathname = usePathname()

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
      <View className="flex -mb-2 flex-row w-full relative items-center justify-between">
        <TouchableOpacity
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-4"
          onPress={onMenuPress}
        >
          <Menu size={23} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
        <TouchableOpacity className="absolute left-[50%] pt-4 translate-x-[-50%]">
          <Image
            source={require('@/assets/images/app-icon.png')}
            resizeMode="contain"
            style={{
              width: 35,
              height: 35,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-4"
          onPress={() => router.push('/posts')}
        >
          <Search size={23} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
      </View>
      <View className="flex  flex-row w-full items-center justify-between">
        <TouchableOpacity
          onPress={() => router.push('/home/following')}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-4"
        >
          <Megaphone size={23} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>

        <TouchableOpacity
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-4"
          onPress={() => router.push('/home/news')}
        >
          <Globe
            size={23}
            color={
              pathname.includes('/home/news')
                ? '#DA3986'
                : isDark
                  ? '#BABABA'
                  : '#6E6E6E'
            }
          />
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => router.push('/home/giveaway')}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-4"
        >
          <Gift
            size={23}
            color={
              pathname.includes('/home/giveaway')
                ? '#DA3986'
                : isDark
                  ? '#BABABA'
                  : '#6E6E6E'
            }
          />
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => router.push('/home/notifications')}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-4"
        >
          <Bell size={23} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default MainAppBar
