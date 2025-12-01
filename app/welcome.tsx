import { AuthStore } from '@/store/AuthStore'
import { MessageStore } from '@/store/notification/Message'
import CountryStore, { Country } from '@/store/place/CountryOrigin'
import StateStore from '@/store/place/StateOrigin'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import React, { useRef, useState, useEffect, useCallback } from 'react'
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
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import _debounce from 'lodash/debounce'
import api from '@/lib/api'
import Spinner from '@/components/Response/Spinner'
import { setupBody3, setupTitle2, setupTitle3 } from '@/constants/Text'
import { ChevronDown } from 'lucide-react-native'
import { createAccount } from '@/lib/auth'
import { PostStore } from '@/store/post/Post'
import NewsStore from '@/store/news/News'
import { Feather } from '@expo/vector-icons'
import { Area } from '@/store/place/Area'
// ... keep all your other imports exactly the same

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const WelcomeScreen = () => {
  const router = useRouter()
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const { countries, getCountries } = CountryStore()
  const { states, getStates } = StateStore()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const backgroundColor = isDark ? '#1C1E21' : '#FFFFFF'
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [profileBlob, setProfileBlob] = useState<Blob | null>(null)
  const [isCountryList, setCountryList] = useState(false)
  const [isStateList, setStateList] = useState(false)
  const [country, setCountry] = useState('Select Country')
  const [state, setState] = useState('Select State')
  const [form, setForm] = useState({ username: '', displayName: '' })

  // ... keep all your useEffect, handlers (pickImage, handleUsernameSearch, etc.)

  useEffect(() => {
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`,
        setMessage
      )
    }
  }, [])

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

  const selectCountry = (country: Area) => {
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

  const moveToNext = () => {
    if (currentIndex === 0) {
      if (!form.username.trim() || !form.displayName.trim() || !profileBlob) {
        setMessage('Please complete your profile setup to continue', false)
        return
      }
    }
    if (currentIndex === 1) {
      if (country === 'Select Country' || state === 'Select State') {
        setMessage('Please select your location to continue', false)
        return
      }
    }
    if (currentIndex < 2) {
      flatListRef.current?.scrollToOffset({
        offset: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      })
    }
  }

  const moveToPrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToOffset({
        offset: (currentIndex - 1) * SCREEN_WIDTH,
        animated: true,
      })
    }
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / SCREEN_WIDTH)
    if (index !== currentIndex) {
      setCurrentIndex(index)
    }
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

  const slides = [
    <View key="0" style={{ width: SCREEN_WIDTH }} className="px-5">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-semibold text-center mb-6 text-primary dark:text-dark-primary">
            Quick Profile Setup
          </Text>
          <TouchableOpacity onPress={pickImage} className="items-center mb-10">
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
            <View className="mt-4 bg-custom px-6 py-3 rounded-full">
              <Text className="text-white font-medium">Upload Photo</Text>
            </View>
          </TouchableOpacity>

          <View className="">
            <View className="mb-5">
              <Text className="text-lg mb-2 text-primary dark:text-dark-primaryLight">
                Username
              </Text>
              <TextInput
                className="input"
                placeholder="Enter username"
                value={form.username}
                onChangeText={(text) => {
                  const filtered = text.replace(/[^a-zA-Z0-9._]/g, '')
                  setForm({ ...form, username: filtered })
                  handleUsernameSearch(filtered)
                }}
              />
              {isLoading && <Spinner size={32} />}
            </View>

            <View>
              <Text className="text-lg mb-2 text-primary dark:text-dark-primaryLight">
                Display Name
              </Text>
              <TextInput
                className="input"
                placeholder="Enter display name"
                autoCapitalize="words"
                value={form.displayName}
                onChangeText={(text) => setForm({ ...form, displayName: text })}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>,

    <View key="1" style={{ width: SCREEN_WIDTH }} className="px-5">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-semibold text-center mb-6 text-primary dark:text-dark-primary">
          {setupTitle2}
        </Text>
        <Image
          source={require('@/assets/images/connect.png')}
          className="w-full h-[200px] rounded-xl mb-8"
          resizeMode="contain"
        />

        {/* Country Dropdown */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => {
              setCountryList(!isCountryList)
              setStateList(false)
            }}
            className="input flex-row items-center justify-between"
          >
            <Text className="text-lg text-primary dark:text-dark-primary">
              {country}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>
          {isCountryList && (
            <ScrollView className="absolute top-16 left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg max-h-64">
              {countries.map((c) => (
                <TouchableOpacity
                  key={c.country}
                  onPress={() => selectCountry(c)}
                  className="flex-row items-center p-3 border-b border-gray-200 dark:border-gray-700"
                >
                  {c.countryFlag && (
                    <Image
                      source={{ uri: String(c.countryFlag) }}
                      style={{ width: 28, height: 20, marginRight: 12 }}
                    />
                  )}
                  <Text className="text-primary dark:text-dark-primary">
                    {c.country}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* State Dropdown */}
        <TouchableOpacity
          onPress={() => setStateList(!isStateList)}
          className="input flex-row items-center justify-between"
        >
          <Text className="text-lg text-primary dark:text-dark-primary">
            {state}
          </Text>
          <ChevronDown size={20} color="#6b7280" />
        </TouchableOpacity>
        {isStateList && (
          <ScrollView className="absolute top-16 left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg max-h-64">
            {states.map((s) => (
              <TouchableOpacity
                key={s.state}
                onPress={() => selectState(s.state)}
                className="p-3 border-b border-gray-200 dark:border-gray-700"
              >
                <Text className="text-primary dark:text-dark-primary">
                  {s.state}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </View>,

    <View key="2" style={{ width: SCREEN_WIDTH }} className="px-5 items-center">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text className="text-2xl font-semibold text-center mb-6 text-primary dark:text-dark-primary">
          {setupTitle3}
        </Text>
        <Image
          source={require('@/assets/images/community.png')}
          className="w-full h-64 mb-8"
          resizeMode="contain"
        />
        <Text className="text-2xl text-center font-bold text-custom mb-4">
          Hello {form.username || 'there'}!
        </Text>
        <Text className="text-center text-base mb-10 px-6 text-primary dark:text-dark-primary">
          {setupBody3}
        </Text>

        <TouchableOpacity
          onPress={createUserAccount}
          disabled={isLoading}
          className="bg-custom px-12 py-4 rounded-full min-h-14 flex-row items-center justify-center"
        >
          {isLoading ? (
            <Spinner size={40} />
          ) : (
            <Text className="text-white text-xl font-psemibold">
              Create Account
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>,
  ]

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor, paddingTop: 20 }}
      edges={['top', 'bottom']}
    >
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => item}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
      />

      <View
        style={{ paddingBottom: insets.bottom + 20, paddingHorizontal: 24 }}
        className="absolute bottom-0 left-0 right-0 flex-row justify-between items-center"
      >
        <View className="flex-row gap-2">
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              className={`rounded-full transition-all ${
                currentIndex === i ? 'w-8 h-3 bg-custom' : 'w-3 h-3 bg-gray-400'
              }`}
            />
          ))}
        </View>

        <View className="flex-row gap-4">
          {currentIndex > 0 && (
            <TouchableOpacity
              onPress={moveToPrev}
              className="w-12 h-12 rounded-full border border-gray-400 items-center justify-center"
            >
              <Feather
                name="chevron-left"
                size={28}
                color={isDark ? '#fff' : '#000'}
              />
            </TouchableOpacity>
          )}
          {currentIndex < 2 && (
            <TouchableOpacity
              onPress={moveToNext}
              className="w-12 h-12 rounded-full bg-custom items-center justify-center"
            >
              <Feather name="chevron-right" size={28} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default WelcomeScreen
