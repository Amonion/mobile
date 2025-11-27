import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import SocialStore, { SocialUser } from '@/store/post/Social'
import { AuthStore } from '@/store/AuthStore'
import { moveToProfile } from '@/lib/helpers'

interface FollowingCardProps {
  socialUser: SocialUser
}

const FollowingCard: React.FC<FollowingCardProps> = ({ socialUser }) => {
  const { user } = AuthStore()
  const { unFollowUser } = SocialStore()
  const router = useRouter()

  const move = () => {
    if (user) {
      moveToProfile(
        {
          ...socialUser,
          _id: socialUser.userId,
          media: String(socialUser.media),
        },
        user.username
      )
    }

    router.push(`/home/profile/${socialUser.username}`)
  }

  const unFollowAccount = () => {
    SocialStore.setState((prev) => {
      return {
        followers: prev.followers.filter((item) => item._id !== socialUser._id),
      }
    })
    unFollowUser(`/users/follow/${socialUser.userId}`, {
      followerId: user?._id,
    })
  }

  return (
    <View className="bg-primary dark:bg-dark-primary flex-row px-3 py-4 mb-[2px]">
      <TouchableOpacity onPress={move} className="mr-3">
        <Image
          source={{ uri: socialUser.picture }}
          className="rounded-full"
          style={{
            width: 55,
            height: 55,
          }}
        />
      </TouchableOpacity>

      <View className="flex-row items-start flex-1">
        <View className="mr-auto">
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-2" onPress={move}>
              <Text className="font-semibold text-xl text-primary dark:text-dark-primary line-clamp-1 overflow-ellipsis">
                {socialUser.displayName}
              </Text>
            </TouchableOpacity>
            {socialUser.isVerified && (
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={18}
                color="#DA3986"
                style={{ marginLeft: 'auto' }}
              />
            )}
          </View>
          <TouchableOpacity onPress={move}>
            <Text className="text-custom">@{socialUser.username}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={unFollowAccount}
          className={`border-border dark:border-dark-border border rounded-[25px] ml-auto px-2 py-1`}
        >
          <Text className={` text-sm text-primary dark:text-dark-primary`}>
            {'Unfollow'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default FollowingCard
