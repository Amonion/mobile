import { successfulBody, successfulTitle } from '@/constants/Text'
import { router } from 'expo-router'
import React from 'react'
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SignupSuccessful = () => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false

  return (
    <SafeAreaView
      className={`${isDark ? 'bg-dark-primary' : 'bg-primary'} flex-1`}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View className="flex-1 justify-center items-center px-[15px]">
          <Image
            source={require('../../assets/images/success.png')}
            resizeMode="contain"
            className="w-[450px] h-[250px] mb-5"
          />
          <Text className="text-[25px] text-secondary text-center dark:text-dark-secondary mb-6 font-bold">
            {successfulTitle}
          </Text>
          <Text className="text-primary text-lg dark:text-dark-primary text-center mb-10">
            {successfulBody}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/sign-in')}
            activeOpacity={0.7}
            className={` customBtn`}
          >
            <Text className={`text-xl text-white font-psemibold`}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignupSuccessful
