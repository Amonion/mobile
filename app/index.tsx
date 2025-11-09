import { useEffect } from 'react'
import { View, Image } from 'react-native'
import { router } from 'expo-router'
import { AuthStore } from '@/store/AuthStore'
import SocketService from '@/store/socket'

const IndexScreen = () => {
  const { token, user } = AuthStore()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (token && user) {
          SocketService.connect(token)
          if (user.isFirstTime) {
            router.replace('/welcome')
          } else {
            router.replace('/home')
          }
        } else {
          router.replace('/onboarding')
        }
      } catch (error) {
        console.log(error)
        router.replace('/onboarding')
      }
    }
    checkAuth()
  }, [])

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

export default IndexScreen
