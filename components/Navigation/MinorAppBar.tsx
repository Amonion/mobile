import {
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Bell } from 'lucide-react-native'
import { useRouter } from 'expo-router'

const MinorAppBar = () => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <View
      style={{
        paddingTop: Platform.OS === 'ios' ? 10 : insets.top,
      }}
      className="text px-4 py-4 bg-primary dark:bg-dark-primary border-b border-b-border dark:border-b-dark-border"
    >
      <View className="flex flex-row w-full relative items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="">
          <ArrowLeft size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
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
        <TouchableOpacity>
          <Bell size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default MinorAppBar
