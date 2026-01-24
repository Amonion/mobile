import { submitPassword } from '@/lib/auth'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native'
import { validatePasswords, ValidationResult } from '@/lib/validateAuthInputs'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Eye, EyeOff } from 'lucide-react-native'
import Spinner from '@/components/Response/Spinner'
import { UserStore } from '@/store/user/User'

const ResetPassword = () => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const [loading, setLoading] = useState(false)
  const { authEmail, authCode } = UserStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<ValidationResult | null>(null)
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async () => {
    const validation = validatePasswords(form.password, form.confirmPassword)
    if (!validation.valid) {
      setError(validation)
      return
    }

    setLoading(true)

    try {
      const userDetails = new FormData()
      userDetails.append('password', form.password)
      userDetails.append('email', authEmail)
      userDetails.append('code', authCode)

      const res = await submitPassword(userDetails)
      if (res) {
        router.push('/reset-successful')
      }
    } catch (err: any) {
      console.log(err)
      const msg =
        err.response?.data?.message || 'Something went wrong. Try again.'
      Alert.alert('Error', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView
      className={`${isDark ? 'bg-dark-primary' : 'bg-primary'} flex-1`}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
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
                Reset your password
              </Text>
              <Text className="text-primary text-lg dark:text-dark-primary text-start">
                Enter a new valid password and confirm it to successfully reset
                your forgotten password.
              </Text>
            </View>

            <View className="mb-[20px]">
              <Text className="text-primary dark:text-dark-primary mb-2 font-semibold">
                New Password
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

            <View className="mb-[20px]">
              <Text className="text-primary dark:text-dark-primary mb-2 font-semibold">
                Confirm Password
              </Text>

              <View className="relative">
                <TextInput
                  className={`input ${
                    error?.confirmPasswordMessage ? 'border-red-500 border' : ''
                  } `}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={form.confirmPassword}
                  placeholderTextColor={isDark ? '#BABABA' : '#6E6E6E'}
                  onChangeText={(e) => setForm({ ...form, confirmPassword: e })}
                  autoCapitalize="none"
                  style={{ textAlignVertical: 'center' }}
                />

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

              {error?.confirmPasswordMessage ? (
                <Text className="text-red-500 text-sm mt-1">
                  {error?.confirmPasswordMessage}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.7}
              disabled={loading}
              className={`${loading ? 'opacity-50' : ''} customBtn`}
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
                Already have an account?
              </Text>
              <Pressable onPress={() => router.push('/sign-in')}>
                <Text className="text-custom text-lg">Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default ResetPassword
