import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { AuthStore } from '@/store/AuthStore'
import WeekendStore, { Weekend } from '@/store/exam/Weekend'

interface GiveawayContextType {
  giveaways: Weekend[]
}

const GiveawayContext = createContext<GiveawayContextType | undefined>(
  undefined
)

export const useNews = () => {
  const context = useContext(GiveawayContext)
  if (!context) {
    throw new Error('useNews must be used within a Giveaway Provider')
  }
  return context
}

interface GiveawayProviderProps {
  children: ReactNode
}

export const GiveawayProvider: React.FC<GiveawayProviderProps> = ({
  children,
}) => {
  const { giveaways, getSavedGiveaways } = WeekendStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (user && giveaways.length === 0) {
      getSavedGiveaways(user)
    }
  }, [user?._id])

  return (
    <GiveawayContext.Provider value={{ giveaways }}>
      {children}
    </GiveawayContext.Provider>
  )
}
