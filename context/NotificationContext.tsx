import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { AuthStore } from '@/store/AuthStore'
import SocketService from '@/store/socket'
import {
  Notification,
  NotificationStore,
} from '@/store/notification/Notification'

interface NotificationContextType {
  notifications: Notification[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

export const useChats = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useChats must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

interface NotificationData {
  socialNotification: Notification
  unreadNotifications: number
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { notifications, getSavedNotifications } = NotificationStore()
  const { user } = AuthStore()
  const socket = SocketService.getSocket()

  useEffect(() => {
    if (user) {
      getSavedNotifications()
    }
  }, [user])

  useEffect(() => {
    if (!user || !socket) return
    //////////////PERSONAL NOTIFICATION//////////////
    socket.on(
      `social_notification_${user?.username}`,
      (data: NotificationData) => {
        if (data.socialNotification) {
          NotificationStore.setState((prev) => {
            const notes = [data.socialNotification, ...prev.notifications]
            return {
              notifications: notes,
              unreadNotifications: data.unreadNotifications,
            }
          })
        }
      }
    )

    //////////////STATE UPDATE//////////////
    return () => {
      socket?.off(`social_notification_${user.username}`)
    }
  }, [socket, user])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
