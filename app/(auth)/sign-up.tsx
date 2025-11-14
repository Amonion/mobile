import { signUp } from '@/lib/auth'
import { getUserIP } from '@/lib/helpers'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  Linking,
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
import { validateInputs, ValidationResult } from '@/lib/validateAuthInputs'
import { MessageStore } from '@/store/notification/Message'
import { SafeAreaView } from 'react-native-safe-area-context'
import { signupBody, signupTitle } from '@/constants/Text'
import { Eye, EyeOff } from 'lucide-react-native'
import Spinner from '@/components/Response/Spinner'

const SignUp = () => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const [isChecked, setIsChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<ValidationResult | null>(null)
  const { message } = MessageStore()
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async () => {
    const validation = validateInputs(
      form.password,
      form.email,
      form.confirmPassword
    )
    if (!validation.valid) {
      setError(validation)
      return
    }

    if (!isChecked) {
      return Alert.alert('You must agree to the Terms & Conditions')
    }
    const operatingSystem = Platform.OS
    const signupIp = await getUserIP()

    setLoading(true)

    try {
      const userDetails = new FormData()
      userDetails.append('email', form.email)
      userDetails.append('password', form.password)
      userDetails.append('operatingSystem', operatingSystem)
      userDetails.append('signupIp', signupIp)

      const res = await signUp(userDetails)
      if (res) {
        router.push('/signup-successful')
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
                {signupTitle}
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

            <View className="flex-row flex-wrap items-center mt-2 mb-6">
              <Pressable
                onPress={() => setIsChecked(!isChecked)}
                className="mr-2"
              >
                <Feather
                  name={isChecked ? 'check-square' : 'square'}
                  size={18}
                  color={isChecked ? '#DA3986' : '#A4A2A2'}
                />
              </Pressable>
              <Text className="text-primary dark:text-dark-primary text-lg mr-2">
                I agree to the
              </Text>
              <Pressable onPress={() => router.push('/sign-in')}>
                <Text
                  className="text-custom text-lg"
                  onPress={() =>
                    Linking.openURL(
                      'https://schoolingsocial.com/terms-conditions'
                    )
                  }
                >
                  {'Terms and Conditions'}
                </Text>
              </Pressable>
              {message && (
                <Text className="text-custom text-lg">{message}</Text>
              )}
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
              <Pressable onPress={() => router.push('/signup-in')}>
                <Text className="text-custom text-lg">Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default SignUp
