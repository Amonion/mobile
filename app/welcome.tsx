import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useColorScheme,
  Alert,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import Swiper from 'react-native-swiper'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { createAccount } from '@/lib/auth'
import _debounce from 'lodash/debounce'
import api from '@/lib/api'
import { ChevronDown } from 'lucide-react-native'
import { AuthStore } from '@/store/AuthStore'
import { MessageStore } from '@/store/notification/Message'
import CountryStore, { Country } from '@/store/place/CountryOrigin'
import StateStore from '@/store/place/StateOrigin'
import Spinner from '@/components/Response/Spinner'
import { setupBody3, setupTitle2, setupTitle3 } from '@/constants/Text'
import { PostStore } from '@/store/post/Post'
import NewsStore from '@/store/news/News'

const WelcomeScreen = () => {
  const router = useRouter()
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const { countries, getCountries } = CountryStore()
  const { states, getStates } = StateStore()
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [profileBlob, setProfileBlob] = useState<Blob | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const swiperRef = useRef<Swiper | null>(null)
  const colorScheme = useColorScheme()
  const insets = useSafeAreaInsets()
  const isDark = colorScheme === 'dark'
  const backgroundColor = isDark ? '#1C1E21' : '#FFFFFF'
  const scrollRef = useRef<ScrollView>(null)
  const [isCountryList, setCountryList] = useState(false)
  const [isStateList, setStateList] = useState(false)
  const [country, setCountry] = useState('Select Country')
  const [state, setState] = useState('Select State')

  const [form, setForm] = useState({
    username: '',
    displayName: '',
  })

  useEffect(() => {
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`,
        setMessage
      )
    }
  }, [])

  const handleUsernameSearch = useCallback(
    _debounce(async (username: string) => {
      setIsLoading(true)
      try {
        const response = await api.get(`/users/username/${username}`)
        const results = response?.data
        if (results) {
          setMessage('Sorry! This username is already taken', false)
          setUsername('')
        } else {
          setMessage('Great! The username is available', true)
          setUsername(username)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }, 3000),
    []
  )

  const selectCountry = (country: Country) => {
    setCountry(country.country)
    setCountryList(false)
    getStates(
      `/places/state/?country=${country.country}&page_size=350&field=state&sort=state`,
      setMessage
    )
  }

  const selectState = (state: string) => {
    setState(state)
    setStateList(false)
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    })

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri
      setProfileImage(uri)

      const response = await fetch(uri)
      const blob = await response.blob()
      setProfileBlob(blob)
    }
  }

  const moveSwiper = (step: number) => {
    if (
      currentIndex === 0 &&
      (username.trim() === '' ||
        form.displayName.trim() === '' ||
        profileBlob === null)
    ) {
      setMessage('Please complete your profile setup to continue', false)
      return
    } else if (
      currentIndex === 1 &&
      step === 1 &&
      (country === 'Select Country' || state === 'Select State')
    ) {
      setMessage('Please complete your location preference to continue', false)
      return
    }
    swiperRef.current?.scrollBy(step)
  }

  const createUserAccount = async () => {
    const userDetails = new FormData()
    if (profileImage) {
      userDetails.append('picture', {
        uri: profileImage,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any)
    }
    setIsLoading(true)
    try {
      const userDetails = new FormData()
      if (profileImage) {
        userDetails.append('picture', {
          uri: profileImage,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any)
      }
      userDetails.append('username', username)
      userDetails.append('displayName', form.displayName)
      userDetails.append('country', country)
      userDetails.append('state', state)
      if (user) {
        userDetails.append('userId', user?._id)
      } else {
        return
      }
      const response = await createAccount(userDetails)
      console.log(response)
      if (response.user) {
        const { user, posts, featuredNews } = response
        AuthStore.getState().setUser(user)
        PostStore.setState({ postResults: posts })
        NewsStore.setState({ featuredNews: featuredNews })
        if (user) {
          router.replace('/home')
        }
      }
    } catch (err: any) {
      console.log(err)
      const msg =
        err.response?.data?.message || 'Something went wrong. Try again.'
      Alert.alert('Error', msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
        paddingTop: insets.top,
        paddingStart: 20,
        paddingEnd: 20,
        backgroundColor,
      }}
    >
      <Swiper
        ref={swiperRef}
        loop={false}
        showsPagination={false}
        scrollEnabled={false}
        onIndexChanged={setCurrentIndex}
        className=""
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              backgroundColor: isDark ? '#1C1E21' : '#FFFFFF',
              paddingBottom: 80,
            }}
            className="flex-1 bg-primary dark:bg-dark-primary relative"
          >
            <View className="flex flex-col h-full items-center justify-start bg-primary dark:bg-dark-primary">
              <Text className="text-2xl text-primary dark:text-dark-primary font-semibold mb-4">
                Quick Profile Setup
              </Text>

              <TouchableOpacity
                onPress={pickImage}
                className="mb-10 items-center"
              >
                <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
                  <Image
                    source={
                      profileImage
                        ? { uri: profileImage }
                        : require('@/assets/images/avatar.jpg')
                    }
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-row items-center mt-5 bg-custom px-5 py-3 rounded-full">
                  <Text className="text-white text-lg mr-2">Upload Photo</Text>
                </View>
              </TouchableOpacity>

              <View className="w-full px-2">
                <View className="relative mb-5">
                  <Text className="text-lg text-primary dark:text-dark-primaryLight mb-1">
                    Username
                  </Text>
                  <View className="relative">
                    <TextInput
                      className={`input`}
                      placeholder="Enter your username"
                      keyboardType="email-address"
                      placeholderTextColor={isDark ? '#848484' : '#A4A2A2'}
                      value={form.username}
                      onChangeText={(e) => {
                        const filtered = e.replace(/[^a-zA-Z0-9._]/g, '')
                        setForm({ ...form, username: filtered })
                        handleUsernameSearch(filtered)
                      }}
                      style={{ textAlignVertical: 'center' }}
                      importantForAutofill="noExcludeDescendants"
                    />

                    {isLoading && (
                      <View className="absolute bottom-[50%] translate-y-[50%] right-2">
                        <Spinner size={40} />
                      </View>
                    )}
                  </View>
                </View>

                <View className="relative">
                  <Text className="text-lg text-primary dark:text-dark-primaryLight mb-1">
                    Display Name
                  </Text>
                  <View className="relative">
                    <TextInput
                      className={`input`}
                      placeholder="Enter your display name"
                      keyboardType="default"
                      autoCapitalize="words"
                      placeholderTextColor={isDark ? '#848484' : '#A4A2A2'}
                      value={form.displayName}
                      onChangeText={(e) => setForm({ ...form, displayName: e })}
                      style={{ textAlignVertical: 'center' }}
                      importantForAutofill="noExcludeDescendants"
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View className="flex flex-1 flex-col h-full items-center bg-primary dark:bg-dark-primary">
          <Text className="text-2xl text-primary dark:text-dark-primary font-semibold mb-4">
            {setupTitle2}
          </Text>
          <View className="flex relative w-full flex-row justify-center">
            <Image
              source={require('@/assets/images/connect.png')}
              className="w-full h-[200px]"
              resizeMode="cover"
            />
          </View>
          <View className="flex flex-col relative mb-10">
            <TouchableOpacity
              onPress={() => {
                setCountryList(!isCountryList)
                setStateList(false)
              }}
              className="input"
            >
              <Text className="text-primary text-lg flex-1 dark:text-dark-primary">
                {country ? country : user?.country}
              </Text>
              <ChevronDown size={20} color="#6b7280" className="ml-auto" />
            </TouchableOpacity>

            {isCountryList && (
              <ScrollView className="selectList top-[60px]">
                {countries.map((item, index) => (
                  <TouchableOpacity
                    onPress={() => selectCountry(item)}
                    key={index}
                    className="flex flex-row p-3 border-b border-b-border dark:border-b-dark-border"
                  >
                    {item.countryFlag && (
                      <Image
                        className="mr-3"
                        source={{ uri: String(item?.countryFlag) }}
                        resizeMode="contain"
                        style={{
                          width: 30,
                          height: 20,
                        }}
                      />
                    )}
                    <Text className="text-primary dark:text-dark-primary">
                      {item.country}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View className="flex flex-col relative mb-4">
            <TouchableOpacity
              onPress={() => {
                setStateList(!isStateList)
              }}
              className="input"
            >
              <Text className="text-primary text-lg flex-1 dark:text-dark-primary">
                {state ? state : user?.state}
              </Text>
              <ChevronDown size={20} color="#6b7280" className="ml-auto" />
            </TouchableOpacity>

            {isStateList && (
              <ScrollView className="selectList top-[60px]">
                {states.map((item, index) => (
                  <TouchableOpacity
                    onPress={() => selectState(item.state)}
                    key={index}
                    className="flex flex-row p-3 border-b border-b-border dark:border-b-dark-border"
                  >
                    <Text className="text-primary dark:text-dark-primary">
                      {item.state}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        <ScrollView
          contentContainerClassName="items-center "
          showsVerticalScrollIndicator={false}
          className="flex flex-1 flex-col h-full  bg-primary dark:bg-dark-primary"
        >
          <Text className="text-2xl text-primary dark:text-dark-primary font-semibold mb-4">
            {setupTitle3}
          </Text>
          <View className="grid sm:grid-cols-2 gap-1 sm:gap-4 w-full mb-10">
            <View className="flex relative w-full flex-row justify-center">
              <Image
                source={require('@/assets/images/community.png')}
                className="w-full h-[250px]"
                resizeMode="contain"
              />
            </View>
          </View>
          <Text className="text-2xl text-secondary dark:text-dark-secondary font-semibold mb-4">
            Hello {username}
          </Text>
          <Text className="text-primary dark:text-dark-primary text-center mb-6">
            {setupBody3}
          </Text>

          <TouchableOpacity
            style={{
              minHeight: 50,
            }}
            onPress={createUserAccount}
            activeOpacity={0.7}
            disabled={isLoading}
            className={`customBtn`}
          >
            {isLoading ? (
              <Spinner size={40} />
            ) : (
              <Text className={`text-xl text-white font-psemibold`}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Swiper>

      <View
        style={{ bottom: insets.bottom + 20 }}
        className="absolute left-0 right-0 flex-row justify-between items-center px-6"
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
              className="w-12 mr-5 h-12 rounded-full border border-border dark:border-border items-center justify-center"
              onPress={() => moveSwiper(-1)}
              disabled={currentIndex === 0}
            >
              <Feather
                name="chevron-left"
                size={24}
                color={isDark ? '#fff' : '#6e6e6e'}
              />
            </TouchableOpacity>
          )}
          {currentIndex < 2 && (
            <TouchableOpacity
              className="w-12 h-12 rounded-full bg-custom border border-custom items-center justify-center"
              onPress={() => moveSwiper(1)}
              disabled={currentIndex === 2}
            >
              <Feather name="chevron-right" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default WelcomeScreen
