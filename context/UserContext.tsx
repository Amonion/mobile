import {
  createContext,
  useEffect,
  useContext,
  ReactNode,
  useRef,
  useState,
} from 'react'
import SocketService from '@/store/socket'
import { User } from '@/store/user/User'
import { BioUserState } from '@/store/user/BioUserState'
import { BioUser } from '@/store/user/BioUser'
import { BioUserSchoolInfo } from '@/store/user/BioUserSchoolInfo'
import { AuthStore } from '@/store/AuthStore'
import { getDeviceIP } from '@/lib/helpers'
import { AppState, AppStateStatus } from 'react-native'
import {
  PersonalNotification,
  PersonalNotificationStore,
} from '@/store/notification/PersonalNotification'

interface UserContextType {
  user: User | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserData {
  count: number
  receiverCount: number
  bioUserState: BioUserState
  bioUser: BioUser
  user: User
  bioUserSchoolInfo: BioUserSchoolInfo
}

interface UserProviderProps {
  children: ReactNode
}

interface NotificationData {
  personalNotification: PersonalNotification
  count: number
  bioUserState: BioUserState
  bioUser: BioUser
  user: User
  bioUserSchoolInfo: BioUserSchoolInfo
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const socket = SocketService.getSocket()
  const appState = useRef<AppStateStatus>(AppState.currentState)
  const { bioUser, user } = AuthStore()
  const [userIp, setUserIp] = useState('')

  const setIp = async () => {
    const ip = await getDeviceIP()
    if (ip) {
      setUserIp(ip)
    }
  }

  useEffect(() => {
    if (!bioUser || !socket) return
    socket.on(`stats_${bioUser.bioUserUsername}`, (data: UserData) => {
      if (data.bioUserState) {
        AuthStore.getState().setBioUserState(data.bioUserState)
      }
    })

    return () => {
      socket?.off(`stats_${bioUser.bioUserUsername}`)
    }
  }, [socket, bioUser])

  useEffect(() => {
    if (!bioUser || !socket) return
    //////////////PERSONAL NOTIFICATION//////////////
    socket.on(
      `official_message_${bioUser.bioUserUsername}`,
      (data: UserData) => {
        if (data.bioUserState) {
          AuthStore.getState().setBioUserState(data.bioUserState)
        }
      }
    )

    socket.on(
      `personal_notification_${bioUser._id}`,
      (data: NotificationData) => {
        if (data.personalNotification) {
          PersonalNotificationStore.setState((prev) => {
            const notes = [
              data.personalNotification,
              ...prev.personalNotifications,
            ]
            return {
              personalNotifications: notes,
              personalUnread: data.count,
            }
          })
        }

        if (data.bioUserState) {
          AuthStore.getState().setAllUser(data.bioUserState, data.bioUser)
        }
        if (data.user) {
          AuthStore.getState().setUser(data.user)
        }
      }
    )

    socket.on(`update_state_${bioUser.bioUserUsername}`, (data: UserData) => {
      AuthStore.getState().setBioUserState(data.bioUserState)
    })

    return () => {
      socket?.off(`official_message_${bioUser.bioUserUsername}`)
      socket?.off(`personal_notification_${bioUser._id}`)
      socket?.off(`update_state_${bioUser.bioUserUsername}`)
    }
  }, [socket, bioUser])

  useEffect(() => {
    setIp()
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (userIp) {
          updateUserPresence(userIp, true)
        }
      }

      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        if (userIp) {
          updateUserPresence(userIp, false)
        }
      }

      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [userIp])

  const updateUserPresence = async (ip: string, online: boolean) => {
    try {
      const data = {
        ip: ip,
        username: user?.username,
        userId: user?._id,
        bioUserId: user?.bioUserId,
        online: online,
        visitedAt: new Date(),
      }

      const formData = {
        data: data,
        to: 'users',
        action: 'visit',
      }

      socket?.emit('message', formData)
    } catch (error) {
      console.error('Error fetching user location:', error)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => useContext(UserContext)
