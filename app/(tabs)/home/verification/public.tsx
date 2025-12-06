import {
  View,
  Text,
  Image,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import React, { useState } from 'react'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { validateInputs } from '@/lib/validateInputs'
import { appendForm, getDeviceWidth } from '@/lib/helpers'
import _debounce from 'lodash/debounce'
import api from '@/lib/api'
import FullMedia from '@/components/FullMedia'
import * as Location from 'expo-location'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import { BioUserStore } from '@/store/user/BioUser'
import { FileLike } from '@/store/place/Document'
import InputField from '@/components/General/InputField'
import CustomBtn from '@/components/General/CustomBtn'
import { router } from 'expo-router'

export default function VerificationSettings() {
  const { user, bioUser, bioUserState } = AuthStore()
  const width = getDeviceWidth()
  const { setMessage } = MessageStore()
  const { bioUserForm, loading, setForm, updateMyBioUser } = BioUserStore()
  const colorScheme = useColorScheme()
  const { setAlert } = AlartStore()
  const isDark = colorScheme === 'dark' ? true : false
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [mediaImage, setMediaImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [imageSource, setImageSource] = useState('')
  const [username, setUsername] = useState('')
  const url = '/users/bio-user/'
  // const [location, setLocation] = useState<Location.LocationObject | null>(null)

  const handleUsernameSearch = _debounce(async (name: string) => {
    setIsLoading(true)
    if (name.trim().length < 2) return
    try {
      const response = await api.get(`/users/username/${name}`)
      const results = response?.data
      if (results) {
        setMessage('Sorry! This username is already taken', false)
        setForm('bioUserUsername', '')
      } else {
        setMessage('Great! The username is available', true)
        setForm('bioUserUsername', name)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }, 3000)

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.5,
    })

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri
      setMediaImage(uri)
    }
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
    }
  }

  const showFullScreen = (image: string) => {
    if (image) {
      setImageSource(image)
      setIsFullScreen(!isFullScreen)
    }
  }

  const handleSubmit = async () => {
    if (!profileImage && bioUserForm.bioUserPicture === '') {
      setMessage('Please select a profile picture to continue', false)
      return
    }

    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location access is required.')
      return
    }

    const loc = await Location.getCurrentPositionAsync({})

    const picture: FileLike = {
      uri: String(profileImage),
      name: 'profile.jpg',
      type: 'image/jpeg',
    }

    const media: FileLike = {
      uri: String(mediaImage),
      name: 'media.jpg',
      type: 'image/jpeg',
    }

    const inputsToValidate = [
      {
        name: 'ID',
        value: String(user?._id),
        rules: { blank: true, maxLength: 100 },
        field: 'User Id',
      },
      {
        name: 'action',
        value: 'Profile',
        rules: { blank: true, maxLength: 120 },
        field: 'Profile',
      },
      {
        name: 'bioUserUsername',
        value: bioUserForm.bioUserUsername.trim(),
        rules: { blank: false, maxLength: 60 },
        field: 'Username',
      },
      {
        name: 'bioUserDisplayName',
        value: bioUserForm.bioUserDisplayName.trim(),
        rules: { blank: true, maxLength: 60 },
        field: 'Display name',
      },
      {
        name: 'location',
        value: JSON.stringify(loc),
        rules: { blank: false },
        field: 'Location',
      },
      {
        name: 'isPublic',
        value: true,
        rules: { blank: true, maxLength: 60 },
        field: 'Is Public',
      },
      {
        name: 'media',
        value: mediaImage === null ? null : media,
        rules: { blank: true, maxSize: 10 },
        field: 'Media',
      },
      {
        name: 'picture',
        value: profileImage === null ? null : picture,
        rules: { blank: true, maxSize: 10 },
        field: 'Display picture',
      },
    ]

    const { messages, valid } = validateInputs(inputsToValidate)

    if (!valid) {
      const getFirstNonEmptyMessage = (
        messages: Record<string, string>
      ): string | null => {
        for (const key in messages) {
          if (messages[key].trim() !== '') {
            return messages[key]
          }
        }
        return null
      }

      const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
      if (firstNonEmptyMessage) {
        setMessage(firstNonEmptyMessage, false)
        return
      }
    }

    const data = appendForm(inputsToValidate)
    setAlert(
      'Warning',
      'You cannot change your username after verification!',
      true,
      () => submitData(data)
    )
  }

  const submitData = async (data: FormData) => {
    updateMyBioUser(`${url}${bioUser?._id}`, data, () =>
      router.replace(`/home/verification/education`)
    )
  }

  return (
    <>
      <View className={` flex px-3`}>
        <View className="w-full h-[25vh] mb-4 justify-end relative bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border rounded-[10px] overflow-hidden">
          {mediaImage ? (
            <Image
              source={{ uri: String(mediaImage) }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                resizeMode: 'cover',
              }}
            />
          ) : bioUserForm?.bioUserMedia ? (
            <TouchableOpacity
              onPress={() => showFullScreen(String(bioUserForm.bioUserMedia))}
              className="w-full items-center absolute h-full top-0 left-0"
            >
              <Image
                source={{ uri: String(bioUserForm.bioUserMedia) }}
                style={{
                  height: '100%',
                  width: '100%',
                  resizeMode: 'cover',
                }}
              />
            </TouchableOpacity>
          ) : (
            <Image
              source={require('@/assets/images/class.png')}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                resizeMode: 'cover',
              }}
            />
          )}

          <TouchableOpacity onPress={pickMedia} className="mb-10 items-center">
            <View
              style={{
                width: width * 0.12,
                height: width * 0.12,
              }}
              className="rounded-full bg-primary bg-cus dark:bg-dark-primary items-center justify-center"
            >
              <Feather name="camera" size={width * 0.06} color="#DA3986" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="justify-center items-center mb-5">
          <TouchableOpacity
            onPress={() => showFullScreen(String(bioUserForm.bioUserPicture))}
          >
            <View
              style={{
                width: 70,
                height: 70,
              }}
              className="rounded-full overflow-hidden border border-border dark:border-dark-border"
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : bioUserForm?.bioUserPicture ? (
                <Image
                  source={{ uri: String(bioUserForm?.bioUserPicture) }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('@/assets/images/avatar.jpg')}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage} className="items-center">
            <View className="flex-row items-center mt-5 px-5 py-3 rounded-full border border-border dark:border-dark-border">
              <Text className="text-primary dark:text-dark-primary text-lg">
                Upload Photo
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <FullMedia
          imageSource={imageSource}
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
        />

        {bioUserState?.isVerified ? (
          <View className="mb-4">
            <Text className="text-lg text-primaryLight dark:text-dark-primaryLight mb-2">
              Username
            </Text>
            <View className="flex-row items-center bg-secondary dark:bg-dark-secondary min-h-[60px] justify-center pl-5 pr-3 rounded-[10px]">
              <Text className="text-primary dark:text-dark-primary flex-1 text-xl my-auto">
                {bioUserForm.bioUserUsername}
              </Text>
            </View>
          </View>
        ) : (
          <View className="relative mb-3">
            <InputField
              label="Official Username"
              value={username}
              placeholder="Search official username"
              autoCapitalize="words"
              onChangeText={(e) => {
                const filtered = e.replace(/[^a-zA-Z0-9._]/g, '')
                handleUsernameSearch(filtered)
                setUsername(filtered)
              }}
            />
            {isLoading && (
              <ActivityIndicator
                className="absolute right-[10px] bottom-[30px]"
                size="large"
                color="#DA39A6"
              />
            )}
          </View>
        )}

        <InputField
          label="Official Display Name"
          value={bioUserForm.bioUserDisplayName}
          placeholder="Enter Display Name"
          autoCapitalize="words"
          onChangeText={(e) => {
            setForm('bioUserDisplayName', e)
          }}
        />

        <CustomBtn
          label="Update Profile"
          loading={loading}
          handleSubmit={handleSubmit}
        />
      </View>
    </>
  )
}
