import { useCallback, useRef } from 'react'
import { Animated, View, FlatList } from 'react-native'
import NewsStore, { News } from '@/store/news/News'
import NewsCard from '@/components/News/NewsCard'
import MainNews from '@/components/News/MainNews'
import { CommentSheet, CommentSheetRef } from '@/components/Sheets/CommentSheet'

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<News> // 👈 typed FlatList
)
const NewsPage = () => {
  const { loading, news, hasMore, setCurrentPage, currentPage } = NewsStore()
  const commentSheetRef = useRef<CommentSheetRef>(null)

  const fetchMorePosts = () => {
    if (loading || !hasMore) return
    setCurrentPage(currentPage + 1)
  }

  const renderItem = useCallback(
    ({ item }: { item: News }) => (
      <NewsCard
        onCommentPress={() => commentSheetRef.current?.open()}
        news={item}
      />
    ),
    []
  )

  const keyExtractor = useCallback((item: News) => item._id, [])

  return (
    <View className="flex-1 bg-secondary dark:bg-dark-secondary relative">
      <AnimatedFlatList
        data={news}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        extraData={news}
        scrollEventThrottle={16}
        onEndReachedThreshold={0.2}
        onEndReached={fetchMorePosts}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingBottom: 0,
        }}
        ListHeaderComponent={
          <View>
            <MainNews />
          </View>
        }
      />
      <CommentSheet ref={commentSheetRef} />
    </View>
  )
}

export default NewsPage
