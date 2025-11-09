import { useEffect, useState } from 'react'
import { View, Image } from 'react-native'
import { router, useRootNavigationState } from 'expo-router'
import { AuthStore } from '@/store/AuthStore'
import { useAuthHydration } from '@/lib/useAuthHydration'

const IndexScreen = () => {
  const [loading, setLoading] = useState(true)
  const { token, user } = AuthStore()
  const rootState = useRootNavigationState()
  const hydrated = useAuthHydration()

  useEffect(() => {
    const checkAuth = async () => {
      //   try {
      //     if (token && user) {
      //       SocketService.connect(token)
      //       if (user.isFirstTime) {
      //         router.replace('/welcome')
      //       } else {
      //         router.replace('/home')
      //       }
      //     } else {
      //       router.replace('/onboarding')
      //     }
      //   } catch (error) {
      //     console.log(error)
      //     router.replace('/onboarding')
      //   } finally {
      //     setLoading(false)
      //   }

      setTimeout(() => {
        router.push('/onboarding')
      }, 1000)
    }
    checkAuth()
  }, [])

  if (loading) {
    return (
      <View
        className="bg-primary dark:bg-dark-primary"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Image
          source={require('@/assets/images/app-icon.png')}
          resizeMode="contain"
          style={{
            width: 70,
            height: 70,
          }}
        />
      </View>
    )
  }

  return (
    <View
      className="bg-primary dark:bg-dark-primary"
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    ></View>
  )
}

export default IndexScreen
