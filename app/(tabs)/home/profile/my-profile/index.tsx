import ProfileCommentSheet from '@/components/Profile/ProfileCommentSheet'
import UserPostCard from '@/components/Profile/UserPostCard'
import { getDeviceWidth } from '@/lib/helpers'
import UserPostStore from '@/store/post/UserPost'
import { UserStore } from '@/store/user/User'
import { useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'

export default function UserPosts() {
  const { postResults, loading, hasMore, getMoreSavedPost } = UserPostStore()
  const width = getDeviceWidth()
  const { userForm } = UserStore()
  const scrollViewRef = useRef(null)
  const [visible, setVisible] = useState(false)

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent
      const distanceFromBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height)

      if (
        distanceFromBottom === 0 &&
        !loading &&
        hasMore &&
        userForm.username
      ) {
        getMoreSavedPost(userForm)
      }
    },
    []
  )

  const showSheet = () => {
    setVisible(true)
  }

  return (
    <View className="flex-1">
      {postResults.length > 0 ? (
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {postResults.map((item, index) => (
            <UserPostCard
              key={index}
              index={index}
              post={item}
              onCommentPress={showSheet}
            />
          ))}
        </ScrollView>
      ) : (
        <View className="relative bg-primary dark:bg-dark-primary flex-1 items-center justify-center p-10">
          <View className="relative">
            <Image
              source={require('@/assets/images/not-found.png')}
              style={{
                width: width * 0.8,
                height: width * 0.7,
                resizeMode: 'contain',
              }}
            />
            <View className="bg-secondary w-full dark:bg-dark-secondary py-3 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
              <Text className="text-xl uppercase text-center text-secondary dark:text-dark-secondary">
                Sorry, No Post Found
              </Text>
            </View>
          </View>
        </View>
      )}
      <ProfileCommentSheet visible={visible} setVisible={setVisible} />

      {loading && <ActivityIndicator size={25} color={'#DA3986'} />}
    </View>
  )
}
