import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  useColorScheme,
} from 'react-native'
import React from 'react'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { AuthStore } from '@/store/AuthStore'
import ThemeToggle from './ThemeToggle'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { UserStore } from '@/store/user/User'
import UserPostStore from '@/store/post/UserPost'
import { PostStore } from '@/store/post/Post'

const SCREEN_WIDTH = Dimensions.get('window').width

const SideDrawer = ({
  visible,
  onClose,
}: {
  visible: boolean
  onClose: () => void
}) => {
  const [animation] = React.useState(new Animated.Value(-SCREEN_WIDTH))
  const { user, logout } = AuthStore()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { getUser } = UserStore()
  const { getPosts } = UserPostStore()
  const { loading, bookmarkedPostResults, getBookmarkedPosts } = PostStore()

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: visible ? 0 : -SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [visible])

  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const logoutUser = () => {
    logout()
    router.replace('/sign-in')
  }

  const move = () => {
    if (user) {
      getUser(`/users/${user?.username}/?userId=${user?._id}`)
      getPosts(`/posts/user/?username=${user?.username}&page_size=40`)

      UserStore.setState((prev) => {
        return {
          userForm: {
            ...prev.userForm,
            username: user?.username,
            picture: user?.picture,
            displayName: user?.displayName,
          },
        }
      })

      router.push(`/home/profile/${user?.username}`)
    }
  }

  const moveToBookmarks = () => {
    if (user) {
      getBookmarkedPosts(
        `/posts/bookmarks/?myId=${user._id}&page_size=20&page=1&ordering=-score`
      )
      router.push(`/home/post/bookmarks`)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: SCREEN_WIDTH,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 50,
          transform: [{ translateX: animation }],
        }}
      >
        <TouchableWithoutFeedback onPress={() => {}}>
          <View className="bg-primary dark:bg-dark-primary z-50 shadow-md h-full w-[75%] pt-[10px] px-[20px]">
            <View
              style={{ marginTop: insets.top + 5 }}
              className="flex items-center flex-row mb-10"
            >
              <View className="w-[60px] h-[60px] mr-3 border border-border dark:border-dark-border rounded-full overflow-hidden">
                <Image
                  source={
                    user
                      ? { uri: user?.picture }
                      : require('@/assets/images/avatar.jpg')
                  }
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              {user && (
                <View className="w-full">
                  <Text className="text-xl text-primary dark:text-dark-primary flex-1 line-clamp-1 overflow-ellipsis">
                    {user.displayName}
                  </Text>
                  <Text className="text-custom text-lg flex-1 line-clamp-1 overflow-ellipsis">
                    @{user.username}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-1">
              <TouchableOpacity
                onPress={() => router.push('/home')}
                className="w-full py-5 flex-row items-center border-b border-b-border dark:border-b-dark-border"
              >
                <Feather
                  name="home"
                  size={25}
                  color={isDark ? '#BABABA' : '#6E6E6E'}
                  style={{ marginRight: 16 }}
                />
                <Text className="text-2xl text-primary dark:text-dark-primary">
                  Home
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={move}
                className="w-full py-5 flex-row items-center border-b border-b-border dark:border-b-dark-border"
              >
                <Feather
                  name="user"
                  size={25}
                  color={isDark ? '#BABABA' : '#6E6E6E'}
                  style={{ marginRight: 16 }}
                />
                <Text className="text-2xl text-primary dark:text-dark-primary">
                  Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={moveToBookmarks}
                className="w-full py-5 flex-row items-center border-b border-b-border dark:border-b-dark-border"
              >
                <Feather
                  name="bookmark"
                  size={25}
                  color={isDark ? '#BABABA' : '#6E6E6E'}
                  style={{ marginRight: 16 }}
                />
                <Text className="text-2xl text-primary dark:text-dark-primary">
                  Bookmarks
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                // onPress={() => router.push('/home/verification/profile')}
                className="w-full py-5 flex-row items-center border-b border-b-border dark:border-b-dark-border"
              >
                <Feather
                  name="check-circle"
                  size={25}
                  color={isDark ? '#BABABA' : '#6E6E6E'}
                  style={{ marginRight: 16 }}
                />
                <Text className="text-2xl text-primary dark:text-dark-primary">
                  Verification
                </Text>
                {user?.isVerified ? (
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={25}
                    color="#22C55E"
                    style={{ marginLeft: 'auto' }}
                  />
                ) : (
                  <Feather
                    name="clock"
                    size={25}
                    color="#DA3986"
                    style={{ marginLeft: 'auto' }}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                // onPress={() => router.push('/home/notifications')}
                className="w-full py-5 flex-row items-center border-b border-b-border dark:border-b-dark-border"
              >
                <Feather
                  name="bell"
                  size={25}
                  color={isDark ? '#BABABA' : '#6E6E6E'}
                  style={{ marginRight: 16 }}
                />
                <Text className="text-2xl text-primary dark:text-dark-primary">
                  Notifications
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                // onPress={() => router.push('/home/settings')}
                className="w-full py-5 flex-row items-center border-b border-b-border dark:border-b-dark-border"
              >
                <Feather
                  name="settings"
                  size={25}
                  color={isDark ? '#BABABA' : '#6E6E6E'}
                  style={{ marginRight: 16 }}
                />
                <Text className="text-2xl text-primary dark:text-dark-primary">
                  Settings
                </Text>
              </TouchableOpacity>
              <View className="w-full mt-10 flex-row items-center rounded-[50px] dark:bg-dark-secondary bg-secondary p-1">
                <TouchableOpacity
                  onPress={logoutUser}
                  className="flex bg-primary dark:bg-dark-primary rounded-full w-[45px] h-[45px] items-center justify-center"
                >
                  <Feather
                    name="log-out"
                    color={isDark ? '#BABABA' : '#6E6E6E'}
                    size={25}
                    className="text-primary dark:text-dark-primary"
                  />
                </TouchableOpacity>
                <ThemeToggle />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </TouchableWithoutFeedback>
  )
}

export default SideDrawer
