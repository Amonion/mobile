import EachFriend from '@/components/Friends/EachFriend'
import NoFriends from '@/components/Friends/NoFriends'
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
            <>
              <NoFriends />
            </>
          )}
        />
      </View>
    </View>
  )
}

export default Friends
