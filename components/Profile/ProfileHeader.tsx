import FullMedia from '@/components/FullMedia'
import ProfileSheetOptions from '@/components/Profile/ProfileSheetOptions'
import ProfileTabs from '@/components/Profile/ProfileTabs'
import { formatDateToDayMonthYY } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { User } from '@/store/user/User'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { router, usePathname } from 'expo-router'
import { useState } from 'react'
import {
  View,
  Text,
  Image,
  useColorScheme,
  TouchableOpacity,
} from 'react-native'

interface ProfileHeaderProps {
  userForm: User
  setTabsY: (height: number) => void
  followAccount?: () => void
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userForm,
  setTabsY,
  followAccount,
}) => {
  const { user } = AuthStore()
  const pathname = usePathname()
  const isDark = useColorScheme() === 'dark'
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [imageSource, setImageSource] = useState('')
  const [visible, setVisible] = useState(false)

  const showFullScreen = (image: string) => {
    if (image) {
      setImageSource(image)
      setIsFullScreen(true)
    }
  }

  return (
    <>
      <View
        onLayout={(e) => setTabsY(e.nativeEvent.layout.height)}
        className="w-full  relative overflow-hidden"
      >
        <View className="bg-black/50 py-1 px-3 absolute top-2 right-2 rounded-full">
          <Text className="text-white">
            {formatDateToDayMonthYY(String(userForm?.createdAt))}
          </Text>
        </View>

        <Image
          className="h-[25vh]"
          source={
            userForm?.media
              ? { uri: String(userForm.media) }
              : require('@/assets/images/class.png')
          }
          style={{
            position: 'relative',
            top: 0,
            left: 0,
            width: '100%',
            resizeMode: 'cover',
          }}
        />

        <View className="w-full pt-2 px-3 bg-primary dark:bg-dark-primary">
          <View className="flex-row w-full mb-2">
            <TouchableOpacity
              onPress={() => showFullScreen(String(userForm?.picture))}
              className="h-[80px] mr-3 items-center mt-[-40px] border-[2px] border-custom justify-center w-[80px] bg-secondary dark:bg-dark-secondary rounded-full overflow-hidden"
            >
              <Image
                source={{ uri: String(userForm?.picture) }}
                style={{
                  height: '100%',
                  width: '100%',
                  resizeMode: 'cover',
                }}
                className="rounded-full border-[2px] border-white"
              />
            </TouchableOpacity>

            <View className="mr-3">
              <View className="flex-row items-center">
                <Text className="text-primary dark:text-dark-primary text-xl line-clamp-1">
                  {userForm?.displayName}
                </Text>
                {userForm?.isVerified && (
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={18}
                    color="#DA3986"
                    style={{ marginLeft: 5 }}
                  />
                )}
              </View>
              <Text className="w-full text-custom text-lg">
                @{userForm?.username}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center w-full mb-4">
            <Text className="mr-4 text-primary dark:text-dark-primary text-lg">
              {userForm?.followers}{' '}
              {userForm.followers === 1 ? 'Follower' : 'Followers'}
            </Text>
            <Text className="text-primary dark:text-dark-primary text-lg">
              {userForm?.followings} Followings
            </Text>

            {user?.username !== userForm.username ? (
              <View className="flex-row ml-auto items-center">
                <TouchableOpacity
                  onPress={() => router.push(`/chat/${userForm.username}`)}
                  className="mr-3"
                >
                  <Feather
                    name="message-circle"
                    size={25}
                    color={isDark ? '#BABABA' : '#6E6E6E'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={followAccount}
                  className={`${
                    userForm.followed
                      ? 'border-border dark:border-dark-border'
                      : 'bg-custom border-custom'
                  } border rounded-[25px] ml-auto px-2 py-1`}
                >
                  <Text
                    className={`${
                      userForm.followed
                        ? 'text-primary dark:text-dark-primary'
                        : 'text-white'
                    } text-lg`}
                  >
                    {userForm.followed ? 'Unfollow' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  width: 35,
                  height: 35,
                }}
                onPress={() => setVisible(true)}
                className="bg-secondary ml-auto items-center block justify-center dark:bg-dark-secondary rounded-full"
              >
                <Feather
                  name="more-vertical"
                  size={22}
                  color={isDark ? '#BABABA' : '#6E6E6E'}
                />
              </TouchableOpacity>
            )}
          </View>

          <View className="bg-secondary dark:bg-dark-secondary p-2 rounded-[10px] mb-0">
            <Text className="text-primary dark:text-dark-primary text-lg">
              {userForm.intro || 'Hello Dear, feel free to connect and chat.'}
            </Text>
          </View>
        </View>
      </View>
      {user && (
        <ProfileSheetOptions
          visible={visible}
          setVisible={setVisible}
          user={userForm}
        />
      )}

      {<ProfileTabs userForm={userForm} pathname={pathname} />}

      <FullMedia
        imageSource={imageSource}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
      />
    </>
  )
}

export default ProfileHeader
