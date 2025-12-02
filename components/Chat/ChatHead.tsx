import { moveToProfile } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { ChatStore } from '@/store/chat/Chat'
import FriendStore, { FriendEmpty } from '@/store/chat/Friend'
import { MessageStore } from '@/store/notification/Message'
import UserPostStore from '@/store/post/UserPost'
import { UserStore } from '@/store/user/User'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Feather from '@expo/vector-icons/Feather'
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router'
import { Trash } from 'lucide-react-native'
import { useEffect } from 'react'
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  useColorScheme,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ChatHead() {
  const { setMessage } = MessageStore()
  const { friendsResults } = FriendStore()
  const { userForm, getUser } = UserStore()
  const { user } = AuthStore()
  const { getPosts } = UserPostStore()
  const pathname = usePathname()
  const { chatUserForm, selectedItems, massDelete, getChatUser } = ChatStore()
  const { username } = useLocalSearchParams()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const color = isDark ? '#BABABA' : '#6E6E6E'
  useEffect(() => {
    if (!chatUserForm.username) {
      getChatUser(`/users/chat/${username}`, setMessage)
    }
  }, [chatUserForm, pathname])

  useEffect(() => {
    if (friendsResults.length > 0 && username) {
      FriendStore.setState((prev) => {
        const friend = prev.friendsResults.find(
          (item) =>
            item.senderUsername === username ||
            item.receiverUsername === username
        )
        return {
          friendForm: friend ? friend : FriendEmpty,
        }
      })
    } else {
      FriendStore.setState({ friendForm: FriendEmpty })
    }
  }, [username, friendsResults.length])

  const move = () => {
    if (user) {
      moveToProfile(
        {
          ...userForm,
          media: String(userForm.media),
          picture: String(userForm.picture),
        },
        user.username
      )

      router.push(`/home/profile/${userForm?.username}`)
    }
  }

  return (
    <>
      <View
        className="flex-row items-center bg-primary dark:bg-dark-primary px-3 pb-2"
        style={{
          paddingTop: insets.top,
        }}
      >
        <TouchableOpacity
          className="bg-secondary dark:bg-dark-secondary justify-center items-center"
          onPress={() => router.back()}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            marginRight: 8,
          }}
        >
          <Feather color={color} name="arrow-left" size={20} />
        </TouchableOpacity>

        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={move}
            style={{
              width: 50,
              height: 50,
              borderRadius: 30,
              overflow: 'hidden',
              marginRight: 12,
            }}
          >
            <Image
              source={{ uri: chatUserForm.picture || '/avatar.png' }}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={move}>
                <Text
                  className="text-primary dark:text-dark-primary text-lg"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ fontWeight: 'bold' }}
                >
                  {chatUserForm.displayName}
                </Text>
              </TouchableOpacity>
              {userForm?.isVerified && (
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={18}
                  color="#DA3986"
                  style={{ marginLeft: 5 }}
                />
              )}
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 2,
              }}
            >
              <TouchableOpacity onPress={move}>
                <Text className="text-custom" style={{ marginRight: 28 }}>
                  @{chatUserForm.username}
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 'auto',
                }}
              >
                <TouchableOpacity
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  onPress={() => router.push('/friends')}
                  style={{ marginLeft: 8 }}
                >
                  <Feather color={color} name="users" size={25} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {selectedItems.length > 0 && (
          <View className="absolute px-3 z-30 flex-row -bottom-8">
            <TouchableOpacity
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              style={{ width: 30, height: 30 }}
              onPress={() => massDelete(String(user?.username))}
            >
              <Trash size={25} color={color} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  )
}
