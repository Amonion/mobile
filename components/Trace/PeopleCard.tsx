import { formatCount, moveToProfile, truncateString } from '@/lib/helpers'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
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
import { BioUserSchoolInfo } from '@/store/user/BioUserSchoolInfo'

interface PeopleCardProps {
  user: BioUserSchoolInfo
}

const PeopleCard: React.FC<PeopleCardProps> = ({ user }) => {
  const { width } = useWindowDimensions()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  //   const { user } = AuthStore()
  const router = useRouter()
  const move = () => {
    // if (user) {
    //   moveToProfile(
    //     {
    //       ...account,
    //       _id: account._id,
    //       media: String(account.media),
    //       picture: String(account.picture),
    //     },
    //     user.username
    //   )
    //   router.push(`/home/user/${account?.username}`)
    // }
  }

  return (
    <View className="bg-primary dark:bg-dark-primary py-4 mb-[2px]">
      <View className="flex-row px-3 mb-3 items-start">
        <TouchableOpacity onPress={move} className="mr-3">
          <Image
            source={{ uri: String(user.bioUserPicture) }}
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
                {user.bioUserDisplayName}
              </Text>
            </TouchableOpacity>
            {user.isVerified && (
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={18}
                color="#DA3986"
                style={{ marginLeft: 'auto' }}
              />
            )}
          </View>
          <TouchableOpacity onPress={move}>
            <Text className="text-custom">@{user.bioUserUsername}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push(`/chat/${user.bioUserUsername}`)}
          className="mr-3"
        >
          <Feather
            name="message-circle"
            size={25}
            color={isDark ? '#BABABA' : '#6E6E6E'}
          />
        </TouchableOpacity>
      </View>

      <View className={`flex-row justify-between mt-3 px-3`}>
        <View className="flex-row items-center">
          <Image
            source={{ uri: String(user.bioUserPicture) }}
            className="rounded-full"
            style={{
              width: 20,
              height: 'auto',
            }}
          />

          <Text className="text-primary ml-2 dark:text-dark-primaryLight">
            {user.schoolCountrySymbol}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default PeopleCard
