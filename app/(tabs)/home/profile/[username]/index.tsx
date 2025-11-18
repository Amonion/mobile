import UserPostCard from '@/components/Profile/UserPostCard'
import { getDeviceWidth } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import UserPostStore from '@/store/post/UserPost'
import { UserStore } from '@/store/user/User'
import { usePathname } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  RefreshControl,
  useColorScheme,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'

export default function UserPosts() {
  const [page_size] = useState(10)
  const { userForm } = UserStore()
  const [sort] = useState('-createdAt')
  const {
    postResults,
    loading,
    currentPage,
    hasMore,
    getMoreSavedPost,
    getPosts,
  } = UserPostStore()
  const width = getDeviceWidth()
  const pathName = usePathname()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const { user } = AuthStore()
  const scrollViewRef = useRef(null)

  const fetchPosts = () => {
    if (user) {
      getPosts(
        `/posts/?source=user&username=${userForm.username}&myId=${userForm._id}&page_size=${page_size}&page=1&ordering=${sort}&postType=main`
      )
    }
  }

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent
      const distanceFromBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height)

      if (distanceFromBottom === 0 && !loading && hasMore && user) {
        getMoreSavedPost(user)
      }
    },
    []
  )

  // useEffect(() => {
  //   if (currentPage > 1) {
  //     getMorePosts(
  //       `/posts/?source=user&username=${userForm?.username}&myId=${userForm?._id}&ordering=-createdAt&postType=main&page_size=${page_size}&page=${currentPage}`
  //     );
  //   }
  // }, [currentPage]);

  // useEffect(() => {
  //   if (userForm.username) {
  //     fetchPosts();
  //   }
  // }, [pathName, userForm]);

  return (
    <>
      {postResults.length > 0 ? (
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchPosts}
              tintColor={'#DA3986'}
              colors={['#DA3986', '#DA3986']}
              progressBackgroundColor={isDark ? '#121314' : '#FFFFFF'}
            />
          }
        >
          {postResults.map((item, index) => (
            <UserPostCard key={index} index={index} post={item} />
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
      {loading && <ActivityIndicator size={25} color={'#DA3986'} />}
    </>
  )
}
