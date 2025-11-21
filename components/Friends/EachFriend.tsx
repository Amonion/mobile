import { formatRelativeDate } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { ChatStore } from '@/store/chat/Chat'
import FriendStore, { Friend } from '@/store/chat/Friend'
import { useRouter } from 'expo-router'
import {
  Video,
  ImageIcon,
  File,
  Check,
  CheckCheck,
  Clock,
} from 'lucide-react-native'
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
} from 'react-native'
import RenderHtml from 'react-native-render-html'

interface EachFriendProps {
  friend: Friend
}

export default function EachFriend({ friend }: EachFriendProps) {
  const friendState = FriendStore((state) =>
    state.friendsResults.find((f) => f.connection === friend.connection)
  )
  const currentFriend = friendState ?? friend
  const { user } = AuthStore()
  const { friendForm } = FriendStore()
  const { getSavedChats, setConnection } = ChatStore()
  const [unread, setUnread] = useState(0)
  const router = useRouter()
  const isSender = friend.senderUsername === user?.username
  const colorScheme = useColorScheme()
  const { width } = useWindowDimensions()
  const isDark = colorScheme === 'dark'
  const primaryColor = isDark ? '#BABABA' : '#6E6E6E'

  const selectFriend = () => {
    if (friendForm.connection !== friend.connection && user) {
      setConnection(friend.connection)
      ChatStore.setState({
        chats: [],
        username: isSender ? friend.receiverUsername : friend.senderUsername,
        chatUserForm: {
          username: isSender ? friend.receiverUsername : friend.senderUsername,
          picture: isSender ? friend.receiverPicture : friend.senderPicture,
          displayName: isSender
            ? friend.receiverDisplayName
            : friend.senderDisplayName,
          _id: '',
          isFriends: friend.isFriends,
        },
      })
      getSavedChats(friend.connection)

      FriendStore.setState(() => ({
        friendForm: currentFriend,
      }))
    }

    router.push(
      `/chat/${isSender ? friend.receiverUsername : friend.senderUsername}`
    )
  }

  useEffect(() => {
    if (currentFriend.unreadMessages && user) {
      for (let i = 0; i < currentFriend.unreadMessages.length; i++) {
        const el = currentFriend.unreadMessages[i]
        if (el.username === user?.username) {
          setUnread(el.unread)
        }
      }
    }
  }, [currentFriend, user])

  return (
    <View
      className={`px-3 py-3 rounded-[10px] mb-2 flex-row w-full items-start cursor-pointer`}
    >
      <TouchableOpacity className="flex-row" onPress={() => selectFriend()}>
        <View className="rounded-full w-[50px] h-[50px] relative overflow-hidden mr-2">
          <Image
            style={{ height: '100%', objectFit: 'cover' }}
            source={
              isSender
                ? { uri: currentFriend.receiverPicture }
                : { uri: currentFriend.senderPicture }
            }
            className="w-full h-full"
          />
        </View>

        <View className="flex-1 pl-2">
          <View className="flex-row w-full items-center mb-1">
            <Text className="text-xl line-clamp-1 text-secondary dark:text-dark-secondary mr-auto">
              {isSender
                ? currentFriend.receiverDisplayName
                : currentFriend.senderDisplayName}
            </Text>
            <Text className="text-[12px] ml-2 text-primary dark:text-dark-primary">
              {formatRelativeDate(String(currentFriend.updatedAt))}
            </Text>
          </View>

          <View className="flex-row relative items-center w-full">
            {isSender && (
              <View className="mr-1">
                {currentFriend.status === 'pending' ? (
                  <Clock size={14} color="#888" strokeWidth={2.5} />
                ) : currentFriend.status === 'sent' ? (
                  <Check size={16} color="#888" strokeWidth={2.5} />
                ) : currentFriend.status === 'delivered' ? (
                  <CheckCheck size={16} color="#888" strokeWidth={2.5} />
                ) : currentFriend.status === 'read' ? (
                  <CheckCheck size={16} color="#DA3986" strokeWidth={2.5} />
                ) : (
                  <Clock size={14} color="#888" strokeWidth={2.5} />
                )}
              </View>
            )}
            {unread > 0 && (
              <Text
                className={`${
                  unread >= 100
                    ? 'w-[20px] h-[20px] text-[10px]'
                    : 'w-[15px] h-[15px] text-[12px]'
                } flex items-center  text-white absolute right-0 bottom-1 z-30 justify-center rounded-full bg-[var(--custom)]`}
              >
                {unread >= 100 ? '99+' : unread}
              </Text>
            )}
            {currentFriend.media && currentFriend.media.length > 0 && (
              <View className="mr-1">
                {currentFriend.media[0]?.type.includes('image') ? (
                  <ImageIcon size={20} color="#888" strokeWidth={2} />
                ) : currentFriend.media[0]?.type.includes('video') ? (
                  <Video size={20} color="#888" strokeWidth={2} />
                ) : (
                  <File size={20} color="#888" strokeWidth={2} />
                )}
              </View>
            )}

            <View className="flex-1">
              <RenderHtml
                contentWidth={width}
                source={{ html: currentFriend.content }}
                baseStyle={{
                  color: primaryColor,
                  fontSize: 14,
                  fontWeight: '400',
                  lineHeight: 23,
                  flexGrow: 1,
                }}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}
