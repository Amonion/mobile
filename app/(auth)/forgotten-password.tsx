import CustomBtn from '@/components/General/CustomBtn'
import { accountBody, accuountTitle } from '@/constants/Text'
import { submitEmail } from '@/lib/auth'
import { ValidationResult } from '@/lib/validateAuthInputs'
import { UserStore } from '@/store/user/User'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
  Image,
  TextInput,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const ForgottenPassword = () => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ValidationResult | null>(null)

  const [form, setForm] = useState({
    email: '',
  })

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError({ emailMessage: 'Invalid email address', valid: false })
      return
    } else {
      setError(null)
    }

    setLoading(true)
    try {
      const userDetails = new FormData()
      userDetails.append('email', form.email.toLowerCase())
      await submitEmail(userDetails)
      UserStore.setState({ authEmail: form.email })
      router.replace('/pass-code')
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Something went wrong. Try again.'
      Alert.alert('Error', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView
      className={`${isDark ? 'bg-dark-primary' : 'bg-primary'} flex-1 `}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-[15px]">
          <View className="w-full items-center justify-start mb-5 mt-[20px]">
            <Image
              source={require('@/assets/images/app-icon.png')}
              resizeMode="contain"
              style={{
                width: 50,
                height: 50,
              }}
            />
          </View>

          <View className="mb-10">
            <Text className="text-[25px] text-secondary dark:text-dark-secondary mb-1 font-bold">
              {accuountTitle}
            </Text>
            <Text className="text-primary text-lg dark:text-dark-primary text-start">
              {accountBody}
            </Text>
          </View>

          <View className="mb-[40px]">
            <Text className="text-primary dark:text-dark-primary mb-2 font-semibold">
              Email
            </Text>
            <TextInput
              className={`input ${
                error?.emailMessage ? 'border-red-500 border' : ''
              } `}
              placeholder="you@example.com"
              keyboardType="email-address"
              placeholderTextColor={isDark ? '#BABABA' : '#6E6E6E'}
              value={form.email}
              onChangeText={(e) => setForm({ ...form, email: e })}
              autoCapitalize="none"
              style={{ textAlignVertical: 'center' }}
              importantForAutofill="noExcludeDescendants"
            />
            {error?.emailMessage ? (
              <Text className="text-red-500 text-sm mt-1">
                {error?.emailMessage}
              </Text>
            ) : null}
          </View>

          <CustomBtn
            label="Submit"
            loading={loading}
            handleSubmit={handleSubmit}
          />

          <View className="flex-row justify-center mt-6">
            <Text className="text-primary dark:text-dark-primary mr-2 text-lg">
              {`Already have an account?`}
            </Text>
            <Pressable onPress={() => router.push('/sign-in')}>
              <Text className="text-custom text-lg">Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ForgottenPassword
