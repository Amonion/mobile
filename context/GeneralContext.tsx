import { MessageStore } from '@/store/notification/Message'
import React, { createContext, useEffect, ReactNode } from 'react'

interface GeneralContextType {
  baseURL: string
}

const GeneralContext = createContext<GeneralContextType | undefined>(undefined)

interface GeneralProviderProps {
  children: ReactNode
}

export const GeneralProvider: React.FC<GeneralProviderProps> = ({
  children,
}) => {
  const { setBaseUrl, baseURL } = MessageStore()

  useEffect(() => {
    if (__DEV__) {
      setBaseUrl('http://192.168.1.44:8080/api/v1')
    } else {
      setBaseUrl('https://schoolingsocial-api-v1.onrender.com/api/v1')
    }
  }, [])

  return (
    <GeneralContext.Provider
      value={{
        baseURL,
      }}
    >
      {children}
    </GeneralContext.Provider>
  )
}
