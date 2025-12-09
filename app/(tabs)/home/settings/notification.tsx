import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { AuthStore } from '@/store/AuthStore'
import { UserSettingsStore } from '@/store/user/UserSettings'
import { appendForm } from '@/lib/helpers'
import CustomBtn from '@/components/General/CustomBtn'
import CustomSwitch from '@/components/ToggleBtn'

export default function SocialSettings() {
  const { user } = AuthStore()
  const {
    loading,
    userSettingsForm,
    toggleNotification,
    updateUserSettings,
    getUserSettings,
  } = UserSettingsStore()
  const url = '/users/settings/'

  useEffect(() => {
    getUserSettings(`${url}${user?._id}`)
  }, [])

  const handleSubmit = async () => {
    const inputsToValidate = [
      {
        name: 'userSettingsForm',
        value: JSON.stringify(userSettingsForm),
        rules: { blank: false },
        field: 'Notifications',
      },
    ]
    const data = appendForm(inputsToValidate)
    updateUserSettings(`${url}${user?._id}`, data)
  }
  return (
    <>
      <View className={` flex px-3`}>
        <View className="border border-border dark:border-dark-border p-3 rounded-[10px] mb-5">
          <View className="mb-5">
            <View className="flex-row mb-2 text-[var(--text-secondary)]">
              <Text className="text-secondary dark:text-dark-secondary text-lg mr-auto">
                Job Posting
              </Text>
              <CustomSwitch
                value={userSettingsForm.jobPosting}
                onChange={() => toggleNotification('jobPosting')}
              />
            </View>

            <Text className="text-primary dark:text-dark-primary text-sm border-b border-border dark:border-dark-border pb-2">
              You will easily receive job notifications related to your field of
              study and occupation you filled in your profile settings.
            </Text>
          </View>
          <View className="mb-5">
            <View className="flex-row mb-2 text-[var(--text-secondary)]">
              <Text className="text-secondary dark:text-dark-secondary text-lg mr-auto">
                Friend Request
              </Text>
              <CustomSwitch
                value={userSettingsForm.friendRequest}
                onChange={() => toggleNotification('friendRequest')}
              />
            </View>

            <Text className="text-primary dark:text-dark-primary text-sm border-b border-border dark:border-dark-border pb-2">
              You will easily received job notifications related to your field
              of study and occupation you filled in your profile settings.
            </Text>
          </View>
          <View className="mb-5">
            <View className="flex-row mb-2 text-[var(--text-secondary)]">
              <Text className="text-secondary dark:text-dark-secondary text-lg mr-auto">
                New Message
              </Text>
              <CustomSwitch
                value={userSettingsForm.newMessage}
                onChange={() => toggleNotification('newMessage')}
              />
            </View>

            <Text className="text-primary dark:text-dark-primary text-sm border-b border-border dark:border-dark-border pb-2">
              You will easily received job notifications related to your field
              of study and occupation you filled in your profile settings.
            </Text>
          </View>
          <View className="mb-5">
            <View className="flex-row mb-2 text-[var(--text-secondary)]">
              <Text className="text-secondary dark:text-dark-secondary text-lg mr-auto">
                New Follower
              </Text>
              <CustomSwitch
                value={userSettingsForm.newFollower}
                onChange={() => toggleNotification('newFollower')}
              />
            </View>

            <Text className="text-primary dark:text-dark-primary text-sm border-b border-border dark:border-dark-border pb-2">
              You will easily received job notifications related to your field
              of study and occupation you filled in your profile settings.
            </Text>
          </View>
          <View className="mb-5">
            <View className="flex-row mb-2 text-[var(--text-secondary)]">
              <Text className="text-secondary dark:text-dark-secondary text-lg mr-auto">
                Post Reply
              </Text>
              <CustomSwitch
                value={userSettingsForm.postReply}
                onChange={() => toggleNotification('postReply')}
              />
            </View>

            <Text className="text-primary dark:text-dark-primary text-sm border-b border-border dark:border-dark-border pb-2">
              You will easily received job notifications related to your field
              of study and occupation you filled in your profile settings.
            </Text>
          </View>
          <View className="mb-5">
            <View className="flex-row mb-2 text-[var(--text-secondary)]">
              <Text className="text-secondary dark:text-dark-secondary text-lg mr-auto">
                Notification Sound
              </Text>
              <CustomSwitch
                value={userSettingsForm.sound}
                onChange={() => toggleNotification('sound')}
              />
            </View>

            <Text className="text-primary dark:text-dark-primary text-sm pb-2">
              You will easily received job notifications related to your field
              of study and occupation you filled in your profile settings.
            </Text>
          </View>
        </View>

        <CustomBtn
          label="Update Profile"
          loading={loading}
          handleSubmit={handleSubmit}
        />
      </View>
    </>
  )
}
