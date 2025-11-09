import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import NewsStore, { News } from '@/store/news/News'
import { AuthStore } from '@/store/AuthStore'
import { MessageStore } from '@/store/notification/Message'

interface NewsContextType {
  featuredNews: News[]
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
  const url = '/news/feed'
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const { featuredNews, getBannerNews, getSavedBannersNews } = NewsStore()

  useEffect(() => {
    if (featuredNews.length === 0 && user) {
      getSavedBannersNews()
      const params = `?country=${user.country}&state=${user.state}`
      getBannerNews(`${url}${params}`, setMessage)
    }
  }, [])

  return (
    <NewsContext.Provider
      value={{
        featuredNews,
      }}
    >
      {children}
    </NewsContext.Provider>
  )
}
