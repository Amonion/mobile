import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
} from 'react'
import FriendStore, { Friend } from '@/store/chat/Friend'
import { AuthStore } from '@/store/AuthStore'
import SocketService from '@/store/socket'
import { ChatContent, ChatStore } from '@/store/chat/Chat'

interface ChatContextType {
  friendsResults: Friend[]
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChats = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChats must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: ReactNode
}

type response = {
  friend: Friend
  connection: string
  totalUnread: number
  isFriends: boolean
  userId: string
  ids: number[]
  username: string
  pending: boolean
  chat: ChatContent
  chats: ChatContent[]
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { friendsResults, getSavedFriends, updatePendingFriendsChat } =
    FriendStore()
  const { connection, updatePendingChat } = ChatStore()
  const [chat, setChat] = useState<ChatContent | null>(null)

  const { user } = AuthStore()
  const socket = SocketService.getSocket()

  useEffect(() => {
    if (friendsResults.length === 0 && user) {
      getSavedFriends(user)
    }
  }, [user])

  useEffect(() => {
    if (!socket) return

    if (user) {
      socket.on(`updatePendingChat${user.username}`, (data: response) => {
        updatePendingChat(data.chat)
        setChat(data.chat)
        updatePendingFriendsChat(data.friend)
        FriendStore.setState((prev) => {
          return {
            friendForm: {
              ...prev.friendForm,
              isFriends: data.isFriends,
            },
          }
        })
      })

      socket.on(`updateChatToDelivered${user.username}`, (data: response) => {
        updatePendingChat(data.chat)
        updatePendingFriendsChat(data.friend)
      })

      socket.on(`updateCheckedChats${user.username}`, (data: response) => {
        for (let i = 0; i < data.chats.length; i++) {
          const el = data.chats[i]
          updatePendingChat(el)
        }
      })

      socket.on(`updateChatWithFile${user.username}`, (data: response) => {
        if (data.chat) {
          // saveOrUpdateMessageInDB(data.chat)
          ChatStore.setState((prev) => {
            return {
              chats: prev.chats.map((item) =>
                item.timeNumber === data.chat.timeNumber ? data.chat : item
              ),
            }
          })
        }
      })
    }

    return () => {
      socket.off(`updateChatWithFile${user?.username}`)
      socket.off(`updateCheckedChats${user?.username}`)
      socket.off(`updateChatToDelivered${user?.username}`)
      socket.off(`updatePendingChat${connection}`)
    }
  }, [user, socket])

  useEffect(() => {
    if (!socket) return
    if (chat) {
      socket.emit(`message`, { to: 'deliveredChat', chat })
    }
    return () => {
      socket.off(`deliveredChat${user?.username}`)
    }
  }, [chat, socket])

  return (
    <ChatContext.Provider
      value={{
        friendsResults,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
