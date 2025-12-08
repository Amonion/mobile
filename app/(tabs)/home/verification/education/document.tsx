import {
  View,
  Text,
  Image,
  useColorScheme,
  TouchableOpacity,
} from 'react-native'
import React, { useState } from 'react'
import { validateInputs } from '@/lib/validateInputs'
import { appendForm } from '@/lib/helpers'
import * as ImagePicker from 'expo-image-picker'
import FullMedia from '@/components/FullMedia'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import { BioUserSchoolInfoStore } from '@/store/user/BioUserSchoolInfo'
import { FileLike } from '@/store/place/Document'
import { router } from 'expo-router'
import CustomBtn from '@/components/General/CustomBtn'

export default function VerificationDocumentSettings() {
  const { bioUser } = AuthStore()
  const { updateBioUserSchoolInfo, pastSchools, loading } =
    BioUserSchoolInfoStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [imageSource, setImageSource] = useState('')
  const isDark = useColorScheme() === 'dark'
  const url = '/users/bio-user/school/'

  const handlePick = async (index: number) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      alert('Permission to access gallery is required!')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: false,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0]
      const file = {
        uri: asset.uri,
        type: 'image/jpeg',
        name: asset.fileName || `image-${Date.now()}.jpg`,
      }

      handleSubmit(index, file)

      BioUserSchoolInfoStore.setState((prev) => {
        const pastSchools = [...prev.pastSchools]
        pastSchools[index] = {
          ...pastSchools[index],
          schoolTempCertificate: asset.uri,
          schoolCertificate: file,
        }
        return {
          pastSchools: pastSchools,
        }
      })
    }
  }

  const showFullScreen = (image: string) => {
    if (image) {
      setImageSource(image)
      setIsFullScreen(!isFullScreen)
    }
  }

  const handleSubmit = async (index: number, file: FileLike) => {
    const inputsToValidate = [
      {
        name: 'pastSchools',
        value: JSON.stringify(pastSchools),
        rules: { blank: true, maxSize: 10 },
        field: 'Past Schools',
      },
      {
        name: 'certificate',
        value: file,
        rules: { blank: true, maxSize: 10 },
        field: 'Certificate schools',
      },
      {
        name: 'number',
        value: index,
        rules: { blank: false },
        field: 'Index schools',
      },
      {
        name: 'action',
        value: 'EducationDocument',
        rules: { blank: true },
        field: 'History',
      },
      {
        name: 'isEducationDocument',
        value: true,
        rules: { blank: true },
        field: 'History',
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
      'You will need to contact support to edit some of these information after verification!',
      true,
      () => submitData(data)
    )
  }

  const submitData = async (data: FormData) => {
    updateBioUserSchoolInfo(`${url}${bioUser?._id}`, data, () =>
      router.replace(`/home/verification/education/document`)
    )
  }

  return (
    <>
      {pastSchools.length > 0 ? (
        <View className="px-3 mb-3 pb-4 min-h-[60vh]">
          <View className="w-full flex-row pt-3 flex-wrap border border-border dark:border-dark-border rounded-[10px]">
            <Text className="text-center w-full uppercase text-secondary dark:text-dark-secondary mb-5">
              Upload at least one document below
            </Text>
            {pastSchools.map((item, index) => (
              <View
                key={index}
                className="w-1/2 px-2 mb-7 flex-col items-center justify-end"
              >
                <Text className="label text-primary dark:text-dark-primary text-center mb-1">
                  Certificate for
                </Text>
                {item.schoolTempCertificate ? (
                  <Image
                    className="max-w-[120px] mb-5 mt-auto"
                    source={{ uri: String(item.schoolTempCertificate) }}
                    style={{
                      height: 150,
                      width: '100%',
                      maxWidth: 120,
                      resizeMode: 'contain',
                    }}
                  />
                ) : item.schoolCertificate ? (
                  <TouchableOpacity
                    onPress={() =>
                      showFullScreen(String(item.schoolCertificate))
                    }
                    className="w-full items-center"
                  >
                    <Image
                      className="mb-5 mt-auto rounded-[10px]"
                      source={{ uri: String(item.schoolCertificate) }}
                      style={{
                        height: 150,
                        width: '100%',
                        maxWidth: 120,
                        resizeMode: 'contain',
                      }}
                    />
                  </TouchableOpacity>
                ) : (
                  <>
                    <Image
                      className="max-w-[120px] mb-3 mt-auto"
                      source={
                        isDark
                          ? require('@/assets/images/DocumentDark.png')
                          : require('@/assets/images/Document.png')
                      }
                      style={{
                        height: 150,
                        width: '100%',
                        maxWidth: 120,
                        resizeMode: 'contain',
                      }}
                    />
                  </>
                )}

                <Text className="label text-primary dark:text-dark-primary text-center mb-2">
                  {item.schoolName}
                </Text>

                <CustomBtn
                  label="Upload"
                  loading={loading}
                  handleSubmit={() => handlePick(index)}
                />
              </View>
            ))}
            <FullMedia
              imageSource={imageSource}
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
            />
          </View>
        </View>
      ) : (
        <View className="relative flex justify-center">
          <Text className="not_found_text">No Schools Found</Text>
          <Image
            source={require('@/assets/images/not-found.png')}
            style={{
              height: 200,
              width: '100%',
              maxWidth: 300,
              resizeMode: 'contain',
            }}
          />
        </View>
      )}
    </>
  )
}
