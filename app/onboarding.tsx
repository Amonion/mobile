import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useColorScheme,
} from 'react-native'
import { useRouter } from 'expo-router'
import Swiper from 'react-native-swiper'
import { useRef, useState } from 'react'
import { Feather } from '@expo/vector-icons'
import {
  onboardingBody1,
  onboardingBody2,
  onboardingBody3,
  onboardingTitle1,
  onboardingTitle2,
  onboardingTitle3,
} from '@/constants/text'

const OnboardingScreen = () => {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const backgroundColor = isDark ? '#1C1E21' : '#FFFFFF'
  const router = useRouter()
  const swiperRef = useRef<Swiper | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
        // paddingTop: insets.top,

        backgroundColor,
      }}
    >
      <View className="flex-1 pt-10 items-center justify-start bg-primary dark:bg-dark-primary">
        <Swiper
          ref={swiperRef}
          loop={false}
          showsPagination={false}
          scrollEnabled={false}
          onIndexChanged={setCurrentIndex}
        >
          <View className="flex flex-1 px-5 pt-10 flex-col items-center h-full ">
            <Image
              source={
                isDark
                  ? require('@/assets/images/onboarding/onboarding1Dark.png')
                  : require('@/assets/images/onboarding/onboarding1.png')
              }
              resizeMode="contain"
              className="w-[80%] h-[250px] mb-5"
            />
            <Text className="text-[25px] text-secondary dark:text-dark-secondary mb-6 font-bold">
              {onboardingTitle1}
            </Text>
            <Text className="text-primary text-lg dark:text-dark-primary text-center">
              {onboardingBody1}
            </Text>
          </View>

          <View className="flex flex-1 px-5 pt-10 flex-col items-center h-full ">
            <Image
              source={
                isDark
                  ? require('@/assets/images/onboarding/onboarding2Dark.png')
                  : require('@/assets/images/onboarding/onboarding2.png')
              }
              resizeMode="contain"
              className="w-[80%] h-[250px] mb-5"
            />
            <Text className="text-[25px] text-secondary dark:text-dark-secondary mb-6 font-bold">
              {onboardingTitle2}
            </Text>
            <Text className="text-primary text-lg dark:text-dark-primary text-center">
              {onboardingBody2}
            </Text>
          </View>

          <View className="flex flex-1 px-5 pt-10 flex-col items-center h-full ">
            <Image
              source={
                isDark
                  ? require('@/assets/images/onboarding/onboarding3Dark.png')
                  : require('@/assets/images/onboarding/onboarding3.png')
              }
              resizeMode="contain"
              className="w-[80%] h-[250px] mb-5"
            />
            <Text className="text-[25px] text-secondary dark:text-dark-secondary mb-6 font-bold">
              {onboardingTitle3}
            </Text>
            <Text className="text-primary text-lg dark:text-dark-primary text-center">
              {onboardingBody3}
            </Text>
          </View>
        </Swiper>

        <View
          style={{ bottom: insets.bottom + 20 }}
          className={`absolute px-5  left-0 right-0 flex-row justify-between items-center`}
        >
          <View className="flex-row gap-2 items-center">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className={`rounded-full ${
                  currentIndex === i
                    ? 'w-4 h-4 bg-custom'
                    : 'w-2 h-2 bg-secondary'
                }`}
              />
            ))}
          </View>

          <View className="flex-row gap-1">
            {currentIndex > 0 && (
              <TouchableOpacity
                className="w-14 mr-5 h-14 rounded-full border border-border dark:border-border items-center justify-center"
                onPress={() => swiperRef.current?.scrollBy(-1)}
                disabled={currentIndex === 0}
              >
                <Feather
                  name="chevron-left"
                  size={24}
                  color={isDark ? '#fff' : '#6e6e6e'}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="w-14 h-14 rounded-full bg-custom border border-custom items-center justify-center"
              onPress={() => {
                if (currentIndex < 2) {
                  swiperRef.current?.scrollBy(1)
                } else {
                  router.replace('/sign-in')
                }
              }}
            >
              <Feather name="chevron-right" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity className="absolute top-5 right-5">
          <Text className="text-secondary text-xl dark:text-dark-secondary">
            Skip
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default OnboardingScreen
