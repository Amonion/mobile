import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { validateInputs } from '@/lib/validateInputs'
import { appendForm } from '@/lib/helpers'
import { BioUserStore } from '@/store/user/BioUser'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import { useRouter } from 'expo-router'
import InputField from '@/components/General/InputField'
import CustomBtn from '@/components/General/CustomBtn'

export default function VerificationRelatedSettings() {
  const [isRelatedEdit, setRelatedEdit] = useState(false)
  const { bioUserForm, setForm, loading, updateMyBioUser } = BioUserStore()
  const { bioUser, bioUserState, user } = AuthStore()
  const { setMessage } = MessageStore()
  const url = '/users/bio-user/'
  const { setAlert } = AlartStore()
  const router = useRouter()

  useEffect(() => {
    if (!bioUserState) return
    if (!bioUserState.isRelated) {
      setRelatedEdit(true)
    } else {
      setRelatedEdit(false)
    }
  }, [bioUserState])

  useEffect(() => {
    if (bioUser) {
      BioUserStore.setState({ bioUserForm: bioUser })
    }
  }, [])

  const submitData = async (data: FormData) => {
    updateMyBioUser(`${url}${bioUserForm?._id}`, data, () =>
      router.replace(`/home/verification/document`)
    )
  }

  const handleSubmit = async () => {
    if (user && user.isVerified) {
      setMessage('To update these information, please contact support', false)
      return
    }
    const inputsToValidate = [
      {
        name: 'motherName',
        value: bioUserForm.motherName.trim(),
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Mother name',
      },
      {
        name: 'occupation',
        value: bioUserForm.occupation.trim(),
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Occupation',
      },
      {
        name: 'nextKinName',
        value: bioUserForm.nextKinName.trim(),
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Next kin',
      },
      {
        name: 'nextKinPhoneNumber',
        value: bioUserForm.nextKinPhoneNumber.trim(),
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Next of kin phone',
      },

      {
        name: 'isRelated',
        value: true,
        rules: { blank: false, maxLength: 100 },
        field: 'isRelated',
      },
      {
        name: 'action',
        value: 'Related',
        rules: { blank: false, maxLength: 100 },
        field: 'Related',
      },
      {
        name: 'ID',
        value: String(user?._id),
        rules: { blank: true },
        field: 'ID ',
      },
    ]
    const { messages } = validateInputs(inputsToValidate)
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
    const data = appendForm(inputsToValidate)

    setAlert(
      'Warning',
      'You will need to contact support to edit this information after verification is approved!',
      true,
      () => submitData(data)
    )
  }
  return (
    <>
      {isRelatedEdit ? (
        <View className={`flex-1 px-3`}>
          <InputField
            label="Your Occupation"
            value={bioUserForm.occupation}
            placeholder="What do you do?"
            autoCapitalize="words"
            onChangeText={(e) => setForm('occupation', e)}
          />
          <InputField
            label="Mother's Name"
            value={bioUserForm.motherName}
            placeholder="Enter your mother's maiden name"
            autoCapitalize="words"
            onChangeText={(e) => setForm('motherName', e)}
          />
          <InputField
            label="Next of Kin"
            value={bioUserForm.nextKinName}
            placeholder="Next of kin's name"
            autoCapitalize="words"
            onChangeText={(e) => setForm('nextKinName', e)}
          />
          <InputField
            label="Next of Phone"
            value={bioUserForm.nextKinPhoneNumber}
            placeholder="Next of kin's phone number"
            keyboardType="phone-pad"
            onChangeText={(e) => setForm('nextKinPhoneNumber', e)}
          />

          <CustomBtn
            label="Update Related"
            loading={loading}
            handleSubmit={handleSubmit}
          />

          <View className="my-2" />
          {isRelatedEdit && bioUserState?.isRelated && (
            <CustomBtn
              label="Cancle Edit"
              loading={loading}
              handleSubmit={handleSubmit}
              style="outline"
            />
          )}
        </View>
      ) : (
        <View className="px-3 flex-1 mb-5">
          <View className="px-3 z-30 w-full overflow-auto border border-border dark:border-dark-border rounded-[10px]">
            <View className="py-2 border-b border-b-border dark:border-b-dark-border mb-5">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                Occupation
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.occupation}
                </Text>
              </View>
            </View>
            <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                {"Mother's Maiden Name"}
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.motherName}
                </Text>
              </View>
            </View>
            <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                Next of Kin
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.nextKinName}
                </Text>
              </View>
            </View>
            <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                {"Next of Kin's Phone"}
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.nextKinPhoneNumber}
                </Text>
              </View>
            </View>
            <CustomBtn
              label="Edit Related"
              loading={loading}
              handleSubmit={() => {
                setRelatedEdit(true)
              }}
              style="outline"
            />
          </View>
        </View>
      )}
    </>
  )
}
