import EachFriend from '@/components/Friends/EachFriend'
import FriendsSearchHeader from '@/components/Friends/QuestionHeader'
import FriendStore from '@/store/chat/Friend'
import React from 'react'
import { View, FlatList, Text } from 'react-native'

const Friends = () => {
  const { loading, hasMore, friendsResults } = FriendStore()

  const fetchMoreFriends = () => {
    if ((loading && !hasMore) || friendsResults.length === 0) return
  }

  return (
    <View className="flex-1">
      <FriendsSearchHeader />
      <View className="flex-1">
        <FlatList
          data={friendsResults}
          keyExtractor={(item) => item.connection}
          renderItem={({ item }) => <EachFriend friend={item} />}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.2}
          onEndReached={fetchMoreFriends}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={() => (
            <Text className="text-center text-xl mt-10 flex-1 text-primary dark:text-dark-primary">
              No Friends Available.
            </Text>
          )}
        />
      </View>
    </View>
  )
}

export default Friends
