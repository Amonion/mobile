import FullMedia from '@/components/FullMedia'
import ProfileSheetOptions from '@/components/Profile/ProfileSheetOptions'
import ProfileTabs from '@/components/Profile/ProfileTabs'
import { formatDateToDayMonthYY } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { ChatStore } from '@/store/chat/Chat'
import { MessageStore } from '@/store/notification/Message'
import UserPostStore from '@/store/post/UserPost'
import { UserStore } from '@/store/user/User'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { router, Slot, useLocalSearchParams, usePathname } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  useColorScheme,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
} from 'react-native'

export default function UserLayout() {
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const { getUser, userForm, updateMyUser } = UserStore()
  const { getPosts, loading } = UserPostStore()
  const { getSavedChats, setConnection } = ChatStore()
  const { username } = useLocalSearchParams()
  const pathname = usePathname()
  const isDark = useColorScheme() === 'dark'
  const [sticky, setSticky] = useState(false)
  const [tabsY, setTabsY] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [imageSource, setImageSource] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (username !== userForm.username) {
      getUser(`/users/${username}/?userId=${user?._id}`)
    }
  }, [username, pathname, user])

  useEffect(() => {
    if (username && user) {
      const key = [String(username), String(user.username)].sort().join('')
      setConnection(key)
      getSavedChats(key)
    }
  }, [username, user])

  const fetchPosts = () => {
    if (user) {
      getPosts(`/posts/user/?username=${user?.username}&page_size=40`)
    }
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y
    setSticky(offsetY >= tabsY)
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
      setIsFullScreen(true)
    }
  }

  return (
    <View className="flex-1">
      {sticky && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
          }}
        >
          <ProfileTabs userForm={userForm} pathname={pathname} />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        className="flex-1 bg-secondary dark:bg-dark-secondary"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchPosts}
            tintColor={'#DA3986'}
            colors={['#DA3986', '#DA3986']}
            progressBackgroundColor={isDark ? '#121314' : '#FFFFFF'}
          />
        }
      >
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
        <ProfileSheetOptions visible={visible} setVisible={setVisible} />
        {<ProfileTabs userForm={userForm} pathname={pathname} />}

        <Slot />
      </ScrollView>

      <FullMedia
        imageSource={imageSource}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
      />
    </View>
  )
}
