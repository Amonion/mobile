// Blocks.tsx
import { useState } from 'react'
import { Animated, RefreshControl, View } from 'react-native'
import { HEADER_HEIGHT } from '@/constants/Sizes'
import { useScrollY } from '@/context/ScrollYContext'
import { AuthStore } from '@/store/AuthStore'
import SocialStore from '@/store/post/Social'
import BlockCard from '@/components/Profile/BlockCard'

const Blocks = () => {
  const { loading, mutedUsers, getMutedUsers } = SocialStore()
  const [sort] = useState('-createdAt')
  const { user } = AuthStore()
  const { onScroll } = useScrollY()

  const fetchPosts = () => {
    if (user) {
      getMutedUsers(
        `/posts/bookmarks/?myId=${user._id}&page_size=20&page=1&ordering=${sort}&postType=main`
      )
    }
  }

  return (
    <View className="flex-1 dark:bg-dark-secondary bg-secondary">
      <Animated.FlatList
        data={mutedUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <BlockCard socialUser={item} />}
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

export default Blocks
