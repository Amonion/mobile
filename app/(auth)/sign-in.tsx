import { signIn } from '@/lib/auth'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  Image,
} from 'react-native'
import { AuthStore } from '@/store/AuthStore'
import { validateInputs, ValidationResult } from '@/lib/validateAuthInputs'
import { Eye, EyeOff } from 'lucide-react-native'
import Spinner from '@/components/Response/Spinner'
import { SafeAreaView } from 'react-native-safe-area-context'
import { signinTitle, signupBody } from '@/constants/text'

const SignIn = () => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<ValidationResult | null>(null)
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async () => {
    const validation = validateInputs(form.password, form.email, form.password)
    if (!validation.valid) {
      setError(validation)
      return
    }

    setLoading(true)

    try {
      const userDetails = new FormData()
      userDetails.append('email', form.email.toLowerCase())
      userDetails.append('password', form.password)
      const {
        user,
        bioUserSettings,
        bioUser,
        bioUserState,
        bioUserSchoolInfo,
        token,
        posts,
      } = await signIn(userDetails)
      AuthStore.getState().login(
        user,
        bioUserSettings,
        bioUser,
        bioUserState,
        bioUserSchoolInfo,
        token
      )
      if (user?.isFirstTime) {
        // router.replace('/welcome')
      } else {
        // router.replace('/home')
      }
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
          <View className="w-full items-center justify-start mt-[20px]">
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
              {signinTitle}
            </Text>
            <Text className="text-primary text-lg dark:text-dark-primary text-start">
              {signupBody}
            </Text>
          </View>

          <View className="mb-[20px]">
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

          <View className="mb-[20px]">
            <Text className="text-primary dark:text-dark-primary mb-2 font-semibold">
              Password
            </Text>

            <View className="relative">
              <TextInput
                className={`input ${
                  error?.passwordMessage ? 'border-red-500 border' : ''
                } `}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={form.password}
                placeholderTextColor={isDark ? '#BABABA' : '#6E6E6E'}
                onChangeText={(e) => setForm({ ...form, password: e })}
                autoCapitalize="none"
                style={{ textAlignVertical: 'center' }}
              />

              {/* 👁️ Show / Hide toggle */}
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[14px]"
              >
                {showPassword ? (
                  <EyeOff size={22} color="#999" />
                ) : (
                  <Eye size={22} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            {error?.passwordMessage ? (
              <Text className="text-red-500 text-sm mt-1">
                {error?.passwordMessage}
              </Text>
            ) : null}
          </View>

          <View className="flex-row justify-center flex-wrap items-center mb-6">
            <Text className="text-primary dark:text-dark-primary mr-2 text-lg">
              {`Forgotten password?`}
            </Text>
            {/* <Pressable onPress={() => router.push('/forgotten-password')}>
              <Text className="text-custom text-lg">Click Here</Text>
            </Pressable> */}
          </View>

          <TouchableOpacity
            style={{
              minHeight: 50,
            }}
            onPress={handleSubmit}
            activeOpacity={0.7}
            disabled={loading}
            className={`${
              loading ? 'opacity-50' : ''
            } bg-custom flex-row justify-center items-center rounded-full`}
          >
            {loading ? (
              <Spinner size={40} />
            ) : (
              <Text className={`text-xl text-white font-psemibold`}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-primary dark:text-dark-primary mr-2 text-lg">
              {`Don't have an account?`}
            </Text>
            {/* <Pressable onPress={() => router.push('/sign-up')}>
              <Text className="text-custom text-lg">Click Here</Text>
            </Pressable> */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn
