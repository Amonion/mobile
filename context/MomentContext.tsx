import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { AuthStore } from '@/store/AuthStore'
import { Moment, MomentStore } from '@/store/post/Moment'
// import { clearTable } from '@/lib/localStorage/db'

interface MomentContextType {
  moments: Moment[]
}

const MomentContext = createContext<MomentContextType | undefined>(undefined)

export const useNews = () => {
  const context = useContext(MomentContext)
  if (!context) {
    throw new Error('useNews must be used within a MomentProvider')
  }
  return context
}

interface MomentProviderProps {
  children: ReactNode
}

export const MomentProvider: React.FC<MomentProviderProps> = ({ children }) => {
  const { user } = AuthStore()
  const { moments, getMoments, getSavedMoments } = MomentStore()

  useEffect(() => {
    // clearTable('news')
    if (user) {
      getSavedMoments()
      getMoments(
        `/posts/moments/?myId=${user._id}&page_size=20&page=1&ordering=-createdAt`
      )
    }
  }, [user])

  return (
    <MomentContext.Provider
      value={{
        moments,
      }}
    >
      {children}
    </MomentContext.Provider>
  )
}
