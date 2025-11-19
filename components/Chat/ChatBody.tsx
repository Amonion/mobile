import FriendStore, { Friend } from '@/store/chat/Friend'
import EachChat from './EachChat'
import { useEffect, useRef, useState } from 'react'
import { ChatContent, ChatStore } from '@/store/chat/Chat'
import { AuthStore } from '@/store/AuthStore'
import { usePathname, useRouter } from 'expo-router'
import SocketService from '@/store/socket'
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native'

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
    username,
    updatePendingChat,
    addNewChat,
  } = ChatStore()
  const { updatePendingFriendsChat, updateFriendsChat } = FriendStore()
  const { user } = AuthStore()
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()
  const [isNearBottom, setIsNearBottom] = useState(true)
  const socket = SocketService.getSocket()
  const [isFriends, setIsFriends] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const scrollToBottom = () => {
      const container = chatContainerRef.current
      if (container) {
        container.scrollTop = container.scrollHeight
        setIsNearBottom(true)
      }
    }

    scrollToBottom()

    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100)

    return () => clearTimeout(timer)
  }, [chats.length, pathname])

  //  const handleFetchOlderChats = async (user: User) => {
  //     const container = chatContainerRef.current
  //     if (!container) return

  //     const prevScrollHeight = container.scrollHeight
  //     const key = setConnectionKey(String(username), String(user.username))

  //     await ChatStore.getState().addChats(
  //       `/user-messages/user-chats/?connection=${key}&page_size=10&ordering=-createdAt&username=${user.username}&deletedUsername[ne]=${user.username}`,
  //       setMessage
  //     )

  //     requestAnimationFrame(() => {
  //       const newScrollHeight = container.scrollHeight
  //       const scrollDiff = newScrollHeight - prevScrollHeight

  //       container.scrollTop = scrollDiff
  //     })
  //   }

  const scrollDown = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    if (chats.length > 0 && user) {
      const isUsersFriends = ChatStore.getState().chats.some(
        (item) =>
          (item.senderUsername === user.username ||
            item.receiverUsername === user.username) &&
          (item.senderUsername === username ||
            item.receiverUsername === username)
      )

      setIsFriends(isUsersFriends)
    }
  }, [chats.length, user])

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
    const observeScroll = () => {
      const container = chatContainerRef.current
      if (container) {
        const distanceFromBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight
        if (distanceFromBottom >= 200) {
          setIsNearBottom(false)
        } else {
          setIsNearBottom(true)
        }
      }
    }

    const container = chatContainerRef.current
    if (container) {
      container.addEventListener('scroll', observeScroll)
      return () => {
        container.removeEventListener('scroll', observeScroll)
      }
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    if (user) {
      socket.on(`updateChatToRead${connection}`, (data: response) => {
        // if (username === data.receiverUsername) {
        for (let i = 0; i < data.chats.length; i++) {
          const el = data.chats[i]
          updatePendingChat(el)
        }
        updatePendingFriendsChat(data.friend)
        // }
      })
    }

    return () => {
      socket.off(`updateChatToRead${user?.username}`)
    }
  }, [user, socket])

  useEffect(() => {
    if (!socket) return

    if (user) {
      socket.on(`addCreatedChat${username}`, (data: response) => {
        updateFriendsChat({ ...data.friend })
        if (data.connection === connection) {
          addNewChat(data.chat)
        }
      })
    }

    return () => {
      socket.off(`addCreatedChat${username}`)
    }
  }, [user, socket, connection])

  return (
    <>
      <View className="flex relative flex-1 px-1 sm:px-2 flex-col mb-auto overflow-auto chat_scrollbar">
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

        {/* {chats.map((chat, index) => {
          const prevChat = chats[index - 1]
          const nextChat = chats[index + 1]

          const showDate = index === 0 || chat.day !== prevChat.day

          const isSameSenderAsPrev =
            prevChat && prevChat.senderUsername === chat.senderUsername
          const isSameSenderAsNext =
            nextChat && nextChat.senderUsername === chat.senderUsername

          const isGroupStart = !isSameSenderAsPrev
          const isGroupEnd = !isSameSenderAsNext

          return (
            <View key={chat.timeNumber} className={`w-full flex flex-col`}>
              {showDate && (
                <Text className="mx-auto text-[12px] sm:text-sm my-3 rounded-[25px] py-1 px-3 bg-[var(--primary)]">
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
        })} */}

        <FlatList
          data={chats}
          keyExtractor={(item) => item.timeNumber.toString()}
          renderItem={({ item: chat, index }) => {
            const prevChat = chats[index - 1]
            const nextChat = chats[index + 1]

            const showDate = index === 0 || chat.day !== prevChat?.day

            const isSameSenderAsPrev =
              prevChat && prevChat.senderUsername === chat.senderUsername
            const isSameSenderAsNext =
              nextChat && nextChat.senderUsername === chat.senderUsername

            const isGroupStart = !isSameSenderAsPrev
            const isGroupEnd = !isSameSenderAsNext

            return (
              <View style={{ width: '100%', flexDirection: 'column' }}>
                {showDate && (
                  <Text
                    style={{
                      alignSelf: 'center',
                      fontSize: 12,
                      marginVertical: 12,
                      paddingVertical: 4,
                      paddingHorizontal: 12,
                      borderRadius: 25,
                      backgroundColor: '#eee',
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
          <View className="w-full flex flex-col items-center px-[10px] mt-10">
            <View className="text-center max-w-[400px] text-lg leading-[25px]">
              <Text className="text-[var(--custom)]">
                {chatUserForm.username}
              </Text>
              <Text className="">
                will not see you as friend until you send a reply.
              </Text>
            </View>
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
          className="cursor-pointer w-8 h-8 border border-[var(--border)] rounded-full flex items-center justify-center bg-[var(--primary)] absolute right-[20px] sm:bottom-[40px] bottom-[70px]"
        >
          <i className="bi bi-arrow-down"></i>
        </TouchableOpacity>
      )}
    </>
  )
}

export default ChatBody
