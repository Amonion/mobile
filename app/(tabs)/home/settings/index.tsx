import {
  View,
  Text,
  Image,
  useColorScheme,
  TouchableOpacity,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { validateInputs } from '@/lib/validateInputs'
import { appendForm, getDeviceWidth } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { FileLike } from '@/store/place/Document'
import { MessageStore } from '@/store/notification/Message'
import CustomBtn from '@/components/General/CustomBtn'
import InputField from '@/components/General/InputField'
import { UserStore } from '@/store/user/User'
import TextAreaField from '@/components/General/TextAreaField'

export default function ProfileSettings() {
  const { user } = AuthStore()
  const width = getDeviceWidth()
  const { loading, userForm, updateUser, setForm } = UserStore()
  const { setMessage } = MessageStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [mediaImage, setMediaImage] = useState<string | null>(null)
  const url = '/users/'

  useEffect(() => {
    if (user) {
      setForm('displayName', user.displayName)
      setForm('intro', user.intro)
    }
  }, [user])

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

  const handleSubmit = async () => {
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
        name: 'intro',
        value: userForm.intro,
        rules: { blank: true, maxLength: 120 },
        field: 'Intro',
      },
      {
        name: 'action',
        value: 'Profile',
        rules: { blank: true, maxLength: 120 },
        field: 'Profile',
      },
      {
        name: 'displayName',
        value: userForm.displayName,
        rules: { blank: true, maxLength: 60 },
        field: 'Display name',
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
    updateUser(`${url}${user?.username}`, data)
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
          ) : user?.media ? (
            <Image
              source={{ uri: String(user.media) }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                resizeMode: 'cover',
              }}
            />
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

        <View className="flex-row justify-center mb-5">
          <TouchableOpacity onPress={pickImage} className="items-center">
            <View
              style={{
                width: width * 0.2,
                height: width * 0.2,
              }}
              className="rounded-full overflow-hidden border border-border dark:border-dark-border"
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={{ uri: String(user?.picture) }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              )}
            </View>

            <View className="flex-row items-center mt-5 px-5 py-2 rounded-full border border-border dark:border-dark-border">
              <Text className="text-primary dark:text-dark-primary text-lg mr-2">
                Photo
              </Text>
              <Feather
                name="upload"
                size={20}
                color={isDark ? '#BABABA' : '#6E6E6E'}
              />
            </View>
          </TouchableOpacity>
        </View>

        <InputField
          label="Display Name"
          value={userForm.displayName}
          placeholder="Update display name"
          autoCapitalize="words"
          onChangeText={(e) => setForm('displayName', e)}
        />
        <TextAreaField
          label="Your Bio"
          value={userForm.intro}
          placeholder="Update your bio"
          onChangeText={(e) => setForm('intro', e)}
        />

        <CustomBtn
          label="Upload"
          loading={loading}
          handleSubmit={handleSubmit}
        />
      </View>
    </>
  )
}
