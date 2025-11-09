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
        <View className="flex-1 items-center px-[15px]">
          <Text className="text-primary dark:text-dark-primary mb-2 text-3xl">
            Congratulations
          </Text>
          <Image
            source={
              isDark
                ? require('../../assets/images/successDark.png')
                : require('../../assets/images/success.png')
            }
            resizeMode="contain"
            className="w-[450px] h-[250px] mb-5"
          />
          <Text className="text-primary dark:text-dark-primary mb-10 text-xl">
            Your account was created successfully
          </Text>
          <TouchableOpacity
            style={{
              minHeight: 50,
            }}
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
