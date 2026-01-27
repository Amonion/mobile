import { useCallback, useRef } from 'react'
import { Animated, View, FlatList } from 'react-native'
import { CommentSheet, CommentSheetRef } from '@/components/Sheets/CommentSheet'
import MainGiveaway from '@/components/Giveaway/MainGiveaway'
import TopGiveaways from '@/components/Giveaway/TopGiveaway'
import GiveawayCard from '@/components/Giveaway/GiveawayCard'
import WeekendStore, { Weekend } from '@/store/exam/Weekend'
import { AuthStore } from '@/store/AuthStore'

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<Weekend> // 👈 typed FlatList
)
const GiveawayPage = () => {
  const { loading, weekends, hasMore, getMoreSavedGiveaways } = WeekendStore()
  const { user } = AuthStore()
  const commentSheetRef = useRef<CommentSheetRef>(null)

  const fetchMorePosts = () => {
    if (loading || !hasMore) return
    if (!user) return
    getMoreSavedGiveaways(user)
  }

  const renderItem = useCallback(
    ({ item }: { item: Weekend }) => (
      <GiveawayCard
        onCommentPress={() => commentSheetRef.current?.open()}
        giveaway={item}
      />
    ),
    []
  )

  const keyExtractor = useCallback((item: Weekend) => item._id, [])

  return (
    <View className="flex-1 bg-secondary dark:bg-dark-secondary relative">
      <AnimatedFlatList
        data={weekends}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        extraData={weekends}
        scrollEventThrottle={16}
        onEndReachedThreshold={0.2}
        onEndReached={fetchMorePosts}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingBottom: 0,
        }}
        ListHeaderComponent={
          <View>
            <MainGiveaway />
            <TopGiveaways />
          </View>
        }
      />
      <CommentSheet ref={commentSheetRef} />
    </View>
  )
}

export default GiveawayPage
