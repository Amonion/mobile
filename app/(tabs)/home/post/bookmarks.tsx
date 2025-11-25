// Bookmarks.tsx
import { useEffect, useState } from 'react'
import { Animated, RefreshControl, View } from 'react-native'
import { HEADER_HEIGHT } from '@/constants/Sizes'
import { useScrollY } from '@/context/ScrollYContext'
import { PostStore } from '@/store/post/Post'
import { AuthStore } from '@/store/AuthStore'
import PostCard from '@/components/Posts/PostCard'

const Bookmarks = () => {
  const { loading, bookmarkedPostResults, getBookmarkedPosts } = PostStore()
  const [sort] = useState('-createdAt')
  const { user } = AuthStore()
  const [currentPage, setCurrentPage] = useState(1)
  const { onScroll } = useScrollY()

  const fetchPosts = () => {
    if (user) {
      setCurrentPage(1)
      getBookmarkedPosts(
        `/posts/bookmarks/?myId=${user._id}&page_size=20&page=${currentPage}&ordering=${sort}`
      )
    }
  }

  return (
    <View className="flex-1 dark:bg-dark-secondary bg-secondary">
      <Animated.FlatList
        data={bookmarkedPostResults}
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

export default Bookmarks
