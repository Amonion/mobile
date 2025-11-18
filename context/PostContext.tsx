import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { Post, PostStore } from '@/store/post/Post'
import { AuthStore } from '@/store/AuthStore'

interface PostContextType {
  postResults: Post[]
}

const PostContext = createContext<PostContextType | undefined>(undefined)

export const useNews = () => {
  const context = useContext(PostContext)
  if (!context) {
    throw new Error('useNews must be used within a PostProvider')
  }
  return context
}

interface PostProviderProps {
  children: ReactNode
}

export const PostProvider: React.FC<PostProviderProps> = ({ children }) => {
  const { postResults, getSavedPosts } = PostStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (postResults.length === 0 && user) {
      getSavedPosts(user)
    }
  }, [user])

  return (
    <PostContext.Provider
      value={{
        postResults,
      }}
    >
      {children}
    </PostContext.Provider>
  )
}
