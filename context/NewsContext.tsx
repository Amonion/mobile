import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import NewsStore, { News } from '@/store/news/News'
import { AuthStore } from '@/store/AuthStore'
import { MessageStore } from '@/store/notification/Message'
// import { clearTable } from '@/lib/localStorage/db'

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
  const { news, currentPage, getNews, getSavedNews } = NewsStore()

  useEffect(() => {
    // clearTable('news')
    if (currentPage === 0 && user) {
      getSavedNews()
      getNews(
        `/news/feed/?country=${user.country}&userId=${user._id}&state=${user.state}&page_size=20&page=0`,
        setMessage
      )
    }
  }, [user])

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
