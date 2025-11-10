import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import NewsStore, { News } from '@/store/news/News'
import { AuthStore } from '@/store/AuthStore'
import { MessageStore } from '@/store/notification/Message'

interface NewsContextType {
  news: News[]
}

const NewsContext = createContext<NewsContextType | undefined>(undefined)

export const useNews = () => {
  const context = useContext(NewsContext)
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider')
  }
  return context
}

interface NewsProviderProps {
  children: ReactNode
}

export const NewsProvider: React.FC<NewsProviderProps> = ({ children }) => {
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const { news, getNews, getSavedNews } = NewsStore()

  useEffect(() => {
    if (news.length === 0 && user) {
      getSavedNews()
      getNews(
        `/news/?country=${user.country}&state=${user.state}&page_size=20&page=0`,
        setMessage
      )
    }
  }, [])

  return (
    <NewsContext.Provider
      value={{
        news,
      }}
    >
      {children}
    </NewsContext.Provider>
  )
}
