import { View, Text, Image, useColorScheme } from 'react-native'
import React, { useEffect, useState } from 'react'
import { validateInputs } from '@/lib/validateInputs'
import { appendForm } from '@/lib/helpers'
import * as ImagePicker from 'expo-image-picker'
import { AuthStore } from '@/store/AuthStore'
import { BioUserStore, IDDocs } from '@/store/user/BioUser'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import DocumentStore, { FileLike } from '@/store/place/Document'
import { router } from 'expo-router'
import CustomBtn from '@/components/General/CustomBtn'

export default function VerificationDocumentSettings() {
  const { user, bioUser } = AuthStore()
  const [docs, setDocs] = useState<IDDocs[]>([])
  const { bioUserForm, updateMyBioUser, loading } = BioUserStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const { documents, getDocuments } = DocumentStore()
  const isDark = useColorScheme() === 'dark'
  const url = '/users/bio-user/'

  useEffect(() => {
    getDocuments('/places/documents/')
  }, [])

  useEffect(() => {
    const tempDoc: IDDocs[] = []
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i]
      const el = bioUserForm.documents.find((e) => e.docId === doc._id)

      if (!el) {
        tempDoc.push({
          name: doc.name,
          doc: '',
          tempDoc: '',
          docId: doc._id,
        })
      } else {
        tempDoc.push(el)
      }
    }

    setDocs(tempDoc)
  }, [documents])

  const handlePick = async (index: number, docId: string, name: string) => {
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

      handleSubmit(file, docId, name)

      setDocs((prev) => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          doc: String(file),
          tempDoc: asset.uri,
        }
        return updated
      })
    }
  }

  const handleSubmit = async (file: FileLike, id: string, name: string) => {
    const inputsToValidate = [
      {
        name: 'doc',
        value: file,
        rules: { blank: true, maxSize: 10 },
        field: 'Document',
      },
      {
        name: 'id',
        value: id,
        rules: { blank: true },
        field: 'ID',
      },
      {
        name: 'name',
        value: name,
        rules: { blank: true, maxSize: 10 },
        field: 'Name',
      },
      {
        name: 'isDocument',
        value: true,
        rules: { blank: true },
        field: 'Document',
      },
      {
        name: 'action',
        value: 'Document',
        rules: { blank: true },
        field: 'Document',
      },
      {
        name: 'ID',
        value: String(user?._id),
        rules: { blank: true },
        field: 'ID ',
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
      'You will need to contact support to edit this information after verification!',
      true,
      () => submitData(data)
    )
  }

  const submitData = async (data: FormData) => {
    updateMyBioUser(`${url}${bioUser?._id}`, data, () =>
      router.replace(`/home/verification/public`)
    )
  }

  return (
    <>
      {docs.length > 0 ? (
        <View className="px-3 mb-3 pb-4">
          <View className="w-full flex-row pt-3 flex-wrap border border-border dark:border-dark-border rounded-[10px]">
            <Text className="text-center w-full uppercase text-lg text-secondary dark:text-dark-secondary mb-5">
              Upload at least one document below
            </Text>
            {docs.map((item, index) => (
              <View
                key={index}
                className="w-1/2 px-2 mb-7 flex-col items-center justify-end"
              >
                <Text className="label text-primary dark:text-dark-primary text-center mb-2 text-lg">
                  {item.name}
                </Text>
                {item.tempDoc ? (
                  <Image
                    className="max-w-[120px] mb-5 mt-auto"
                    source={{ uri: String(item.tempDoc) }}
                    style={{
                      height: 170,
                      width: '100%',
                      maxWidth: 120,
                      resizeMode: 'contain',
                    }}
                  />
                ) : item.doc ? (
                  <Image
                    className="max-w-[120px] mb-5 mt-auto rounded-[10px]"
                    source={{ uri: String(item.doc) }}
                    style={{
                      height: 170,
                      width: '100%',
                      maxWidth: 120,
                      resizeMode: 'contain',
                    }}
                  />
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
                        height: 170,
                        width: '100%',
                        maxWidth: 120,
                        resizeMode: 'contain',
                      }}
                    />
                  </>
                )}

                <CustomBtn
                  label="Upload"
                  loading={loading}
                  handleSubmit={() => handlePick(index, item.docId, item.name)}
                />
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className="relative min-h-[400px] h-full flex-1 justify-start">
          <Text className="text-center w-full uppercase text-2xl text-secondary dark:text-dark-secondary mb-5">
            No Schools Found
          </Text>
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
