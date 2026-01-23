import FriendStore from '@/store/chat/Friend'
import { useRouter } from 'expo-router'
import { View, Text, Image } from 'react-native'
import CustomBtn from '../General/CustomBtn'

const NoFriends = () => {
  const router = useRouter()
  const { friendsResults } = FriendStore()

  return (
    <>
      <View className="flex-1 items-center justify-center px-3">
        <Text className="text-2xl mb-3 text-secondary dark:text-dark-secondary font-semibold text-center">
          {friendsResults.length
            ? 'Enjoying Schooling Social?'
            : ' You have no friends'}
        </Text>
        <Image
          source={require('@/assets/images/socialize.png')}
          style={{ height: 300, width: '100%', objectFit: 'contain' }}
          resizeMode="contain"
        />
        <View className="flex items-center w-full my-10 gap-5 justify-center">
          <CustomBtn
            handleSubmit={() => router.push('/accounts')}
            label="Search Friends"
            loading={false}
          />
        </View>
      </View>
    </>
  )
}

export default NoFriends
