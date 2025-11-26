// Followers.tsx
import { useState } from 'react'
import { Animated, RefreshControl, View } from 'react-native'
import { HEADER_HEIGHT } from '@/constants/Sizes'
import { useScrollY } from '@/context/ScrollYContext'
import { AuthStore } from '@/store/AuthStore'
import FollowerCard from '@/components/Profile/FollowerCard'
import SocialStore from '@/store/post/Social'

const Followers = () => {
  const { loading, followers, getFollowers } = SocialStore()
  const [sort] = useState('-createdAt')
  const { user } = AuthStore()
  const [currentPage, setCurrentPage] = useState(1)
  const { onScroll } = useScrollY()

  // useEffect(() => {
  //   if (user) {
  //     setCurrentPage(1)
  //     getFollowers(
  //       `/posts/following/?myId=${user._id}&page_size=20&page=${currentPage}&ordering=${sort}&postType=main`
  //     )
  //   }
  // }, [currentPage, user])

  const fetchPosts = () => {
    if (user) {
      setCurrentPage(1)
      getFollowers(
        `/posts/bookmarks/?myId=${user._id}&page_size=20&page=${currentPage}&ordering=${sort}&postType=main`
      )
    }
  }

  return (
    <View className="flex-1 dark:bg-dark-secondary bg-secondary">
      <Animated.FlatList
        data={followers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <FollowerCard socialUser={item} />}
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
  )
}

export default Followers
