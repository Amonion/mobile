import { View, Image, TouchableOpacity, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Bell, Menu } from 'lucide-react-native'
import { useRouter } from 'expo-router'

const MinorAppBar = ({ onMenuPress }: { onMenuPress: () => void }) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <View
      style={{
        paddingTop: insets.top,
      }}
      className="pt-3 bg-primary dark:bg-dark-primary border-b border-b-border dark:border-b-dark-border"
    >
      <View className="flex flex-row w-full relative items-center">
        <TouchableOpacity
          hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
          className="p-4 justify-center items-start"
          onPress={() => router.back()}
        >
          <ArrowLeft size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-4 mr-auto"
          onPress={onMenuPress}
        >
          <Menu size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
        <TouchableOpacity className="absolute left-[50%] py-3 translate-x-[-50%]">
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
          onPress={() => router.push('/home/notifications')}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-4"
        >
          <Bell size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default MinorAppBar
