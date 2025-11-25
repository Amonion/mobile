// Following.tsx
import { useEffect, useState } from 'react'
import { Animated, RefreshControl, View } from 'react-native'
import { HEADER_HEIGHT } from '@/constants/Sizes'
import { useScrollY } from '@/context/ScrollYContext'
import { PostStore } from '@/store/post/Post'
import { AuthStore } from '@/store/AuthStore'
import PostCard from '@/components/Posts/PostCard'

const Following = () => {
  const { loading, followingPostResults, getFollowingPosts } = PostStore()
  const [sort] = useState('-createdAt')
  const { user } = AuthStore()
  const [currentPage, setCurrentPage] = useState(1)
  const { onScroll } = useScrollY()

  useEffect(() => {
    if (user) {
      setCurrentPage(1)
      getFollowingPosts(
        `/posts/following/?myId=${user._id}&page_size=20&page=${currentPage}&ordering=${sort}&postType=main`
      )
    }
  }, [currentPage, user])

  const fetchPosts = () => {
    if (user) {
      setCurrentPage(1)
      getFollowingPosts(
        `/posts/bookmarks/?myId=${user._id}&page_size=20&page=${currentPage}&ordering=${sort}&postType=main`
      )
    }
  }

  return (
    <View className="flex-1 dark:bg-dark-secondary bg-secondary">
      <Animated.FlatList
        data={followingPostResults}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PostCard post={item} />}
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

export default Following
