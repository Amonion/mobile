import { Friend } from '@/store/chat/Friend'
import EachChat from './EachChat'
import { useEffect, useRef, useState } from 'react'
import { ChatContent, ChatStore } from '@/store/chat/Chat'
import { AuthStore } from '@/store/AuthStore'
import SocketService from '@/store/socket'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ViewToken,
} from 'react-native'
import { ArrowDown } from 'lucide-react-native'
import { useLocalSearchParams, usePathname } from 'expo-router'

type response = {
  friend: Friend
  connection: string
  ids: number[]
  senderUsername: string
  receiverUsername: string
  chat: ChatContent
  chats: ChatContent[]
}

const ChatBody = () => {
  const {
    chats,
    chatUserForm,
    loading,
    unread,
    connection,
    isFriends,
    setIsFriends,
    updatePendingChat,
    addNewChat,
  } = ChatStore()
  // const { updatePendingFriendsChat } = FriendStore()
  const { user } = AuthStore()
  const [isNearBottom, setIsNearBottom] = useState(true)
  const socket = SocketService.getSocket()
  const flatListRef = useRef<FlatList>(null)
  const { username } = useLocalSearchParams()
  const pathname = usePathname()

  const scrollDown = () => {
    flatListRef.current?.scrollToEnd({ animated: true })
  }

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 1000)
  }, [chats.length])

  useEffect(() => {
    if (chats.length > 0 && user) {
      const myChats = ChatStore.getState().chats.some(
        (item) => item.senderUsername === user.username
      )
      const userChats = ChatStore.getState().chats.some(
        (item) => item.senderUsername === username
      )

      setIsFriends(myChats && userChats)
    }
  }, [chats, user])

  useEffect(() => {
    return () => {
      chats.forEach((msg) => {
        msg.media?.forEach((m) => {
          if (m.previewUrl) URL.revokeObjectURL(m.previewUrl)
        })
      })
    }
  }, [chats])

  useEffect(() => {
    if (!socket) return

    if (user) {
      socket.on(`updateChatToRead${connection}`, (data: response) => {
        if (username === data.receiverUsername) {
          for (let i = 0; i < data.chats.length; i++) {
            const el = data.chats[i]
            updatePendingChat(el)
          }
          // updatePendingFriendsChat(data.friend)
        }
      })
    }

    return () => {
      socket.off(`updateChatToRead${user?.username}`)
    }
  }, [user, socket])

  useEffect(() => {
    if (!socket) return

    if (user) {
      socket.on(`addCreatedChat${user.username}`, (data: response) => {
        if (data.connection === connection) {
          addNewChat(data.chat)
        }
      })
    }

    return () => {
      socket.off(`addCreatedChat${username}`)
    }
  }, [user, socket, connection])

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      viewableItems.forEach((viewable) => {
        const chat = viewable.item

        if (
          chat.receiverUsername === user?.username &&
          chat.status !== 'read' &&
          pathname === `/chat/${username}`
        ) {
          ChatStore.setState((prev) => {
            const updatedIds = new Set([
              ...prev.unseenChatIds,
              Number(chat.timeNumber),
            ])

            return { unseenChatIds: [...updatedIds] }
          })
        }
      })
    }
  ).current

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  }

  return (
    <>
      <View className="flex relative flex-1 flex-col">
        {chats.length === 0 && !loading && (
          <View className="w-full flex-1 flex flex-col items-center px-[10px] mt-10">
            <View className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mb-5">
              <Image
                source={{ uri: chatUserForm.picture || '/avatar.png' }}
                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              />
            </View>

            <View style={{ flex: 1, paddingHorizontal: 12 }}>
              <Text style={{ flexWrap: 'wrap', textAlign: 'center' }}>
                <Text className="text-custom leading-[20px]">
                  {chatUserForm.username}
                </Text>
                <Text className="text-primary dark:text-dark-primary">
                  {' '}
                  would not see your message as friends. Both of you will be
                  friends when{' '}
                </Text>
                <Text className="text-custom">{chatUserForm.username}</Text>
                <Text className="text-primary dark:text-dark-primary">
                  {' '}
                  sees your message in notifications and reply you.
                </Text>
              </Text>
            </View>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          onContentSizeChange={() => {
            if (isNearBottom) {
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          }}
          onLayout={() => {
            flatListRef.current?.scrollToEnd({ animated: false })
          }}
          onScroll={(event) => {
            const { contentOffset, contentSize, layoutMeasurement } =
              event.nativeEvent

            const distanceFromBottom =
              contentSize.height - (contentOffset.y + layoutMeasurement.height)

            if (distanceFromBottom <= 50) {
              if (!isNearBottom) setIsNearBottom(true)
            } else {
              if (isNearBottom) setIsNearBottom(false)
            }
          }}
          data={chats}
          keyExtractor={(item) => item.timeNumber.toString()}
          onViewableItemsChanged={onViewableItemsChanged}
          showsVerticalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item: chat, index }) => {
            const prevChat = chats[index - 1]
            const nextChat = chats[index + 1]

            const showDate = index === 0 || chat.day !== prevChat?.day

            const isSameSenderAsPrev =
              prevChat?.senderUsername === chat.senderUsername
            const isSameSenderAsNext =
              nextChat?.senderUsername === chat.senderUsername

            const isGroupStart = !isSameSenderAsPrev
            const isGroupEnd = !isSameSenderAsNext

            return (
              <View style={{ width: '100%', flexDirection: 'column' }}>
                {showDate && (
                  <Text
                    className="bg-primary dark:bg-dark-primary text-secondary dark:text-dark-secondary"
                    style={{
                      alignSelf: 'center',
                      fontSize: 14,
                      marginVertical: 12,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 25,
                    }}
                  >
                    {chat.day}
                  </Text>
                )}

                <EachChat
                  e={chat}
                  isFirst={index === 0}
                  isGroupStart={isGroupStart}
                  isGroupEnd={isGroupEnd}
                  index={index}
                />
              </View>
            )
          }}
        />

        {!isFriends && chats.length > 0 && (
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <Text
              style={{
                flexWrap: 'wrap',
                textAlign: 'center',
                fontSize: 18,
              }}
            >
              <Text className="text-custom leading-[25px]">
                {chatUserForm.username}{' '}
              </Text>
              {user?.username === chats[0].senderUsername ? (
                <Text className="text-primary dark:text-dark-primary">
                  {`will not see you as friend until ${chatUserForm.displayName} send a reply.`}
                </Text>
              ) : (
                <Text className="text-primary dark:text-dark-primary">
                  {`will not see you as friend until you send a reply.`}
                </Text>
              )}
            </Text>
          </View>
        )}

        {!isNearBottom && unread > 0 && (
          <TouchableOpacity
            onPress={scrollDown}
            className="cursor-pointer w-[20px] h-[20px] border border-[var(--border)] text-[10px] text-white rounded-full flex items-center justify-center bg-[var(--custom)] absolute left-[10px] top-[-40px]"
          >
            <Text className="text-[10px] text-white">
              {unread < 100 ? unread : '99+'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {!isNearBottom && (
        <TouchableOpacity
          onPress={scrollDown}
          className="cursor-pointer w-12 h-12 rounded-full flex items-center justify-center bg-custom absolute right-[20px] sm:bottom-[40px] bottom-[70px]"
        >
          <ArrowDown color={'#FFF'} size={25} strokeWidth={2} />
        </TouchableOpacity>
      )}
    </>
  )
}

export default ChatBody
