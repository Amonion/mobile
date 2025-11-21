import { formatRelativeDate } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { ChatStore } from '@/store/chat/Chat'
import FriendStore, { Friend } from '@/store/chat/Friend'
import { useRouter } from 'expo-router'
import {
  Check,
  CheckCheck,
  Clock,
  ImageIcon,
  VideoIcon,
} from 'lucide-react-native'
import { useEffect, useState } from 'react'
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  useWindowDimensions,
  useColorScheme,
} from 'react-native'
import RenderHTML from 'react-native-render-html'

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
  const { getSavedChats, connection } = ChatStore()
  const [unread, setUnread] = useState(0)
  const router = useRouter()
  const isSender = friend.senderUsername === user?.username
  const { width } = useWindowDimensions()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const primaryColor = isDark ? '#BABABA' : '#6E6E6E'

  const selectFriend = () => {
    if (friendForm.connection !== friend.connection) {
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

    router.push(`/chat`)
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
    <TouchableOpacity
      onPress={() => selectFriend()}
      className={`hover:bg-[var(--primary)] px-3 py-2 rounded-[10px] mb-2 flex w-full items-start cursor-pointer`}
    >
      <View className="rounded-full w-12 h-12 relative overflow-hidden">
        <Image
          source={
            isSender
              ? { uri: currentFriend.receiverPicture }
              : { uri: currentFriend.senderPicture }
          }
          style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
        />
      </View>

      <View className="flex-1 pl-2">
        <View className="flex w-full items-center mb-1">
          <Text className="font-semibold line-clamp-1 text-[var(--text-secondary)] mr-auto">
            {isSender
              ? currentFriend.receiverDisplayName
              : currentFriend.senderDisplayName}
          </Text>
          <Text className="text-[12px] ml-2 block">
            {formatRelativeDate(String(currentFriend.updatedAt))}
          </Text>
        </View>

        <View className="flex relative items-center w-full">
          {isSender && (
            <View style={{ marginRight: 4 }}>
              {currentFriend.status === 'pending' ? (
                <Clock size={14} color="#999" />
              ) : currentFriend.status === 'sent' ? (
                <Check size={14} color="#999" />
              ) : currentFriend.status === 'delivered' ? (
                <CheckCheck size={16} color="#999" />
              ) : currentFriend.status === 'read' ? (
                <CheckCheck size={16} color={'var(--custom)'} />
              ) : (
                <Clock size={14} color="#999" />
              )}
            </View>
          )}
          {unread > 0 && (
            <View
              className={`${
                unread >= 100
                  ? 'w-[20px] h-[20px] text-[10px]'
                  : 'w-[15px] h-[15px] text-[12px]'
              } flex items-center  text-white absolute right-0 bottom-1 z-30 justify-center rounded-full bg-[var(--custom)]`}
            >
              <Text className="text-white">
                {unread >= 100 ? '99+' : unread}
              </Text>
            </View>
          )}

          {currentFriend.media && currentFriend.media.length > 0 && (
            <View style={{ marginRight: 4 }}>
              {currentFriend.media[0].type.includes('image') ? (
                <ImageIcon size={16} color="#999" />
              ) : currentFriend.media[0].type.includes('video') ? (
                <VideoIcon size={16} color="#999" />
              ) : null}
            </View>
          )}
          <View style={{ marginBottom: 4 }}>
            <RenderHTML
              contentWidth={width}
              source={{ html: currentFriend.content }}
              baseStyle={{
                color: !isSender ? '#FFF' : primaryColor,
                fontSize: 17,
                fontWeight: 400,
                lineHeight: 23,
                textAlign: 'left',
              }}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
