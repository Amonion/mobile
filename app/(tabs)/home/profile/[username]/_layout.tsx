import FullMedia from '@/components/FullMedia'
import { formatCount, formatDateToDayMonthYY } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { ChatStore } from '@/store/chat/Chat'
import { MessageStore } from '@/store/notification/Message'
import { UserStore } from '@/store/user/User'
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import { router, Slot, useLocalSearchParams, usePathname } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'

export default function UserLayout() {
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const { getUser, userForm, updateMyUser, loading } = UserStore()
  const { getSavedChats, setConnection } = ChatStore()
  const { username } = useLocalSearchParams()
  const pathname = usePathname()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [imageSource, setImageSource] = useState('')

  useEffect(() => {
    if (username !== userForm.username) {
      getUser(`/users/${username}/?userId=${user?._id}`)
    }
  }, [userForm, username, pathname, user])

  useEffect(() => {
    if (username && user) {
      const key = setConnectionKey(String(username), String(user?.username))
      setConnection(key)
      getSavedChats(key)
    }
  }, [username, user, pathname])

  const setConnectionKey = (id1: string, id2: string) => {
    const participants = [id1, id2].sort()
    return participants.join('')
  }

  const followAccount = () => {
    updateMyUser(
      `/users/follow/${username}`,
      { user: userForm, followerId: user?._id },
      setMessage
    )
  }

  const showFullScreen = (image: string) => {
    if (image) {
      setImageSource(image)
      setIsFullScreen(!isFullScreen)
    }
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-secondary dark:bg-dark-secondary relative"
      >
        <TouchableOpacity
          onPress={() => showFullScreen(userForm?.media)}
          className="w-full h-[25vh] relative overflow-hidden"
        >
          <View className="bg-black/50 py-1 px-3 absolute top-2 right-2 rounded-full">
            <Text className="text-white">
              {formatDateToDayMonthYY(String(userForm?.createdAt))}
            </Text>
          </View>
          {userForm?.media ? (
            <Image
              source={{ uri: String(userForm.media) }}
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
        </TouchableOpacity>
        <View className="w-full pt-2 px-3 bg-primary dark:bg-dark-primary border-b border-b-border dark:border-b-dark-border mb-1">
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
                <Text className="text-primary dark:text-dark-primary text-xl line-clamp-1 overflow-ellipsis">
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
              {`${userForm.followers === 1 ? 'Follower' : 'Followers'}`}
            </Text>
            <Text className="text-primary dark:text-dark-primary text-lg">
              {userForm?.followed} Following
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

                {loading ? (
                  <ActivityIndicator size={25} color={'#DA3986'} />
                ) : (
                  <TouchableOpacity
                    onPress={followAccount}
                    className={`${
                      userForm.followed
                        ? 'border-border dark:border-dark-border'
                        : 'bg-custom border-custom'
                    } border rounded-[25px]`}
                  >
                    <Text
                      className={`${
                        userForm.followed
                          ? 'text-primary dark:text-dark-primary'
                          : 'text-white'
                      } px-[10px] py-[3px] text-lg`}
                    >
                      {userForm.followed ? 'Unfollow' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                )}
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

          <View className="bg-secondary dark:bg-dark-secondary p-2 rounded-[10px] mb-3">
            <Text className="text-primary dark:text-dark-primary text-lg">
              {userForm.intro
                ? userForm.intro
                : 'Hello Dear, feel free to connect with me let us chat and share ideas'}
            </Text>
          </View>
          <View className="flex-row justify-around">
            <TouchableOpacity
              onPress={() => {
                if (pathname !== `/home/user/${userForm.username}`) {
                  router.push(`/home/user/${userForm.username}`)
                }
              }}
              className="items-center border-b-2 border-b-transparent"
            >
              <Text className="text-primary dark:text-dark-primary text-lg mb-[1px]">
                {formatCount(userForm?.posts)}
              </Text>
              <Text className="text-primary dark:text-dark-primary text-lg">
                Posts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (pathname !== `/home/user/${userForm.username}/comments`) {
                  router.push(`/home/user/${userForm.username}/comments`)
                }
              }}
              className="items-center border-b-2 border-b-transparent"
            >
              <Text className="text-primary dark:text-dark-primary text-lg mb-[1px]">
                {formatCount(userForm.comments)}
              </Text>
              <Text className="text-primary dark:text-dark-primary text-lg">
                Replies
              </Text>
            </TouchableOpacity>

            <View className="items-center border-b-2 border-b-transparent">
              <Text className="text-primary dark:text-dark-primary text-lg mb-[1px]">
                {formatCount(userForm.postMedia)}
              </Text>
              <Text className="text-primary dark:text-dark-primary text-lg">
                Media
              </Text>
            </View>
          </View>
        </View>

        {/* <BottomSheetProfileOptions
          visible={visible}
          onClose={() => setVisible(false)}
        >
          <TouchableOpacity
            onPress={() => {
              setVisible(false)
              router.push(`/home/user/followers`)
            }}
            className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
          >
            <Feather
              name="user-plus"
              size={25}
              color={isDark ? '#BABABA' : '#6E6E6E'}
              style={{ marginRight: 15 }}
            />
            <Text className="text-xl text-primary dark:text-dark-primary">
              Account Followers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setVisible(false)
              router.push(`/home/user/followings`)
            }}
            className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
          >
            <Feather
              name="user-check"
              size={25}
              color={isDark ? '#BABABA' : '#6E6E6E'}
              style={{ marginRight: 15 }}
            />
            <Text className="text-xl text-primary dark:text-dark-primary">
              Account Followings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setVisible(false)
              router.push(`/home/user/muted-users`)
            }}
            className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
          >
            <Feather
              name="volume-x"
              size={25}
              color={isDark ? '#BABABA' : '#6E6E6E'}
              style={{ marginRight: 15 }}
            />
            <Text className="text-xl text-primary dark:text-dark-primary">
              Muted Accounts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setVisible(false)
              router.push(`/home/user/blocked-users`)
            }}
            className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
          >
            <MaterialIcons
              name="block"
              size={25}
              color={isDark ? '#BABABA' : '#6E6E6E'}
              style={{ marginRight: 15 }}
            />
            <Text className="text-xl text-primary dark:text-dark-primary">
              Blocked Accounts
            </Text>
          </TouchableOpacity>
        </BottomSheetProfileOptions> */}

        <FullMedia
          imageSource={imageSource}
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
        />
        <Slot />
      </ScrollView>
    </>
  )
}
