import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import FriendStore, { Friend } from '@/store/chat/Friend'
import { AuthStore } from '@/store/AuthStore'

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

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { friendsResults, getSavedFriends } = FriendStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (friendsResults.length === 0 && user) {
      getSavedFriends(user)
    }
  }, [user])

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
