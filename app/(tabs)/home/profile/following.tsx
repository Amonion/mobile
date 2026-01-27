// Following.tsx
import { useState } from 'react'
import { Animated, RefreshControl, Text, Image, View } from 'react-native'
import { HEADER_HEIGHT } from '@/constants/Sizes'
import { useScrollY } from '@/context/ScrollYContext'
import { AuthStore } from '@/store/AuthStore'
import SocialStore from '@/store/post/Social'
import FollowingCard from '@/components/Profile/FollowingCard'

const Following = () => {
  const { loading, followings, getFollowings } = SocialStore()
  const [sort] = useState('-createdAt')
  const { user } = AuthStore()
  const { onScroll } = useScrollY()

  // useEffect(() => {
  //   if (user) {
  //     setCurrentPage(1)
  //     getFollowingPosts(
  //       `/posts/following/?myId=${user._id}&page_size=20&page=${currentPage}&ordering=${sort}&postType=main`
  //     )
  //   }
  // }, [currentPage, user])

  const fetchPosts = () => {
    if (user) {
      getFollowings(
        `/posts/bookmarks/?myId=${user._id}&page_size=20&page=1&ordering=${sort}&postType=main`
      )
    }
  }

  return (
    <>
      {followings.length === 0 ? (
        <View className="flex-1 items-center justify-center px-3">
          <Text className="text-2xl mb-3 text-secondary dark:text-dark-secondary font-semibold text-center">
            No Followings
          </Text>
          <Image
            source={require('@/assets/images/socialize.png')}
            style={{ height: 300, width: '100%', objectFit: 'contain' }}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View className="flex-1 dark:bg-dark-secondary bg-secondary">
          <Animated.FlatList
            data={followings}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <FollowingCard socialUser={item} />}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                progressViewOffset={HEADER_HEIGHT + 10}
                refreshing={loading}
                onRefresh={fetchPosts}
              />
            }
            onScroll={(event) => {
              const y = event.nativeEvent.contentOffset.y
              onScroll(y)
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingTop: 0,
            }}
          />
        </View>
      )}
    </>
  )
}

export default Following
