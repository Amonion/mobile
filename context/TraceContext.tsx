import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { AuthStore } from '@/store/AuthStore'
import { PostStore } from '@/store/Trace/Post'
import { Post } from '@/store/post/Post'
import { AccountStore } from '@/store/Trace/Accounts'
import { PeopleStore } from '@/store/Trace/People'

interface TracePostContextType {
  postResults: Post[]
}

const TracePostContext = createContext<TracePostContextType | undefined>(
  undefined
)

export const useNews = () => {
  const context = useContext(TracePostContext)
  if (!context) {
    throw new Error('useNews must be used within a TraceProvider')
  }
  return context
}

interface TraceProviderProps {
  children: ReactNode
}

export const TraceProvider: React.FC<TraceProviderProps> = ({ children }) => {
  const { postResults, getSavedPosts } = PostStore()
  const { getSavedAccounts } = AccountStore()
  const { getSavedPeople } = PeopleStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (postResults.length === 0 && user) {
      getSavedPosts(user)
      getSavedAccounts(user)
      getSavedPeople(user)
    }
  }, [user])

  return (
    <TracePostContext.Provider
      value={{
        postResults,
      }}
    >
      {children}
    </TracePostContext.Provider>
  )
}
