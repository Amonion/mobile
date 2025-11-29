import {
  formatCount,
  formatRelativeDate,
  moveToProfile,
  truncateString,
} from '@/lib/helpers'
import { Feather, MaterialCommunityIcons, Octicons } from '@expo/vector-icons'
import React from 'react'
import {
  View,
  Text,
  Image,
  useColorScheme,
  useWindowDimensions,
  TouchableOpacity,
  Linking,
} from 'react-native'
import RenderHtml from 'react-native-render-html'
import { useRouter } from 'expo-router'
import { AuthStore } from '@/store/AuthStore'
import { User } from '@/store/user/User'

interface AccountCardProps {
  account: User
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const { width } = useWindowDimensions()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const { user } = AuthStore()
  const router = useRouter()
  const move = () => {
    if (user) {
      moveToProfile(
        {
          ...account,
          _id: account._id,
          media: String(account.media),
          picture: String(account.picture),
        },
        user.username
      )

      router.push(`/home/user/${account?.username}`)
    }
  }

  return (
    <View className="bg-primary dark:bg-dark-primary py-4 mb-[2px]">
      <View className="flex-row px-3 mb-3 items-start">
        <TouchableOpacity onPress={move} className="mr-3">
          <Image
            source={{ uri: String(account.picture) }}
            className="rounded-full"
            style={{
              width: 45,
              height: 45,
            }}
          />
        </TouchableOpacity>

        <View>
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-2" onPress={move}>
              <Text className="font-semibold text-xl text-primary dark:text-dark-primary line-clamp-1 overflow-ellipsis">
                {account.displayName}
              </Text>
            </TouchableOpacity>
            {account.isVerified && (
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={18}
                color="#DA3986"
                style={{ marginLeft: 'auto' }}
              />
            )}
          </View>
          <TouchableOpacity onPress={move}>
            <Text className="text-custom">@{account.username}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`border-custom bg-custom border rounded-[25px] ml-auto px-2 py-1`}
        >
          <Text
            className={`${
              account.followed
                ? 'text-primary dark:text-dark-primary'
                : 'text-white'
            } text-sm`}
          >
            {account.followed ? 'Unfollow' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
      {account.intro ? (
        <TouchableOpacity className="text-secondary px-3 dark:text-dark-secondary">
          <RenderHtml
            contentWidth={width}
            source={{ html: truncateString(account.intro, 220) }}
            baseStyle={{
              color: isDark ? '#BABABA' : '#3A3A3A',
              fontSize: 14,
              lineHeight: 23,
            }}
            tagsStyles={{
              a: {
                color: '#DA3986',
                textDecorationLine: 'underline',
              },
            }}
            renderersProps={{
              a: {
                onPress: (event, href) => {
                  Linking.openURL(href).catch((err) =>
                    console.error('Failed to open URL:', err)
                  )
                },
              },
            }}
          />
        </TouchableOpacity>
      ) : (
        <Text
          style={{ lineHeight: 20 }}
          className="text-primary px-3 dark:text-dark-primary"
        >
          Hello, you can say hi lets connect and share ideas or follow lets
          build and grow our community accounts.
        </Text>
      )}

      <View className={`flex-row justify-between mt-3 px-3`}>
        <View className="flex-row items-center">
          <Feather
            name="users"
            size={16}
            color={isDark ? '#848484' : '#6E6E6E'}
          />

          <Text className="text-primary ml-2 dark:text-dark-primaryLight">
            {formatCount(account.followers)}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Feather
            name="user-check"
            size={16}
            color={isDark ? '#848484' : '#6E6E6E'}
          />

          <Text className="text-primary ml-2 dark:text-dark-primaryLight">
            {formatCount(account.followings)}
          </Text>
        </View>

        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="post-outline"
            size={16}
            color={isDark ? '#848484' : '#6E6E6E'}
          />
          <Text className="text-primary ml-2 dark:text-dark-primaryLight">
            {formatCount(account.posts)}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Feather
            name="image"
            size={16}
            color={isDark ? '#848484' : '#6E6E6E'}
          />

          <Text className="text-primary ml-2 dark:text-dark-primaryLight">
            {formatCount(account.postMedia)}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default AccountCard
