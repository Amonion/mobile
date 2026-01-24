import CustomBtn from '@/components/General/CustomBtn'
import { submitPassCode } from '@/lib/auth'
import { ValidationResult } from '@/lib/validateAuthInputs'
import { UserStore } from '@/store/user/User'
import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
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

const PassCode = () => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const [loading, setLoading] = useState(false)
  const { authEmail } = UserStore()
  const [error, setError] = useState<ValidationResult | null>(null)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<TextInput[]>([])

  const handleChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) {
      const newCode = [...code]
      newCode[index] = text
      setCode(newCode)

      if (text && index < 5) {
        inputRefs.current[index + 1].focus()
      }

      if (!text && index > 0) {
        inputRefs.current[index - 1].focus()
      }
    }
  }

  const handleSubmit = async () => {
    const joinedCode = code.join('')
    if (joinedCode.length !== 6) {
      setError({
        emailMessage: 'Please enter 6 character code sent to your email.',
        valid: false,
      })
      return
    } else {
      setError(null)
    }

    setLoading(true)

    try {
      const userDetails = new FormData()
      userDetails.append('code', joinedCode)
      userDetails.append('email', authEmail)
      await submitPassCode(userDetails)
      UserStore.setState({ authCode: joinedCode })
      router.replace('/reset-password')
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
      className={`${isDark ? 'bg-dark-primary' : 'bg-primary'} flex-1`}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-[15px]">
          <View className="w-full items-center justify-start mb-10 mt-[20px]">
            <Image
              source={require('@/assets/images/app-icon.png')}
              resizeMode="contain"
              style={{
                width: 50,
                height: 50,
              }}
            />
          </View>

          <View className="w-full items-center justify-start mb-10 mt-[20px]">
            <Text className="text-[25px] text-secondary dark:text-dark-secondary mb-1 font-bold">
              Enter Verification Code
            </Text>
            <Text className="text-primary text-lg dark:text-dark-primary text-center mb-3">
              We have sent a 6-digit code to your email
            </Text>
            <Text className="text-custom text-center">{authEmail}</Text>
          </View>

          <View className="flex-row justify-between mb-[40px]">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el // store the ref
                }}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  width: 45,
                  height: 55,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  textAlign: 'center',
                  fontSize: 20,
                  color: isDark ? '#fff' : '#000',
                }}
                placeholder="-"
                placeholderTextColor="#888"
              />
            ))}
          </View>

          {error?.emailMessage ? (
            <Text className="text-red-500 text-sm mb-2 text-center">
              {error?.emailMessage}
            </Text>
          ) : null}

          <CustomBtn
            label="Verify"
            loading={loading}
            handleSubmit={handleSubmit}
          />

          <View className="flex-row justify-center mt-6">
            <Text className="text-primary dark:text-dark-primary mr-2 text-lg">
              {"Didn't receive a code?"}
            </Text>
            <Pressable onPress={() => router.push('/forgotten-password')}>
              <Text className="text-custom text-lg">Resend</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PassCode
