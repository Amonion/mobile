import { formatCount } from '@/lib/helpers'
import { router } from 'expo-router'
import { TouchableOpacity, View, Text } from 'react-native'
import React from 'react'
import { User } from '@/store/user/User'

interface ProfileTabsProps {
  userForm: User
  pathname: string
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userForm, pathname }) => {
  return (
    <View className="bg-primary z-40 dark:bg-dark-primary flex-row justify-around pt-2 pb-1 border-b border-border dark:border-dark-border">
      <TouchableOpacity
        onPress={() => {
          if (pathname !== `/home/profile/${userForm.username}`) {
            router.push(`/home/profile/${userForm.username}`)
          }
        }}
        className="items-center"
      >
        <Text
          className={`${
            pathname === `/home/profile/${userForm.username}`
              ? 'text-custom'
              : 'text-primary dark:text-dark-primary'
          } text-lg`}
        >
          {formatCount(userForm.posts)}
        </Text>
        <Text
          className={`${
            pathname === `/home/profile/${userForm.username}`
              ? 'text-custom'
              : 'text-primary dark:text-dark-primary'
          }`}
        >
          Posts
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          if (pathname !== `/home/profile/${userForm.username}/comments`) {
            router.push(`/home/profile/${userForm.username}/comments`)
          }
        }}
        className="items-center"
      >
        <Text
          className={`${
            pathname === `/home/profile/${userForm.username}/comments`
              ? 'text-custom'
              : 'text-primary dark:text-dark-primary'
          } text-lg`}
        >
          {formatCount(userForm.comments)}
        </Text>
        <Text
          className={`${
            pathname === `/home/profile/${userForm.username}/comments`
              ? 'text-custom'
              : 'text-primary dark:text-dark-primary'
          }`}
        >
          Replies
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          if (pathname !== `/home/profile/${userForm.username}/media`) {
            router.push(`/home/profile/${userForm.username}/media`)
          }
        }}
        className="items-center"
      >
        <Text
          className={`${
            pathname === `/home/profile/${userForm.username}/media`
              ? 'text-custom'
              : 'text-primary dark:text-dark-primary'
          } text-lg`}
        >
          {formatCount(userForm.postMedia)}
        </Text>
        <Text
          className={`${
            pathname === `/home/profile/${userForm.username}/media`
              ? 'text-custom'
              : 'text-primary dark:text-dark-primary'
          }`}
        >
          Media
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default ProfileTabs
