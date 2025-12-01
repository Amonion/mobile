import { useCallback, useEffect, useRef } from 'react'
import {
  Animated,
  useColorScheme,
  View,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { AuthStore } from '@/store/AuthStore'
import { PeopleStore } from '@/store/Trace/People'
import PeopleCard from '@/components/Trace/PeopleCard'
import { BioUserSchoolInfo } from '@/store/user/BioUserSchoolInfo'

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<BioUserSchoolInfo>
)
const Accounts = () => {
  const {
    loading,
    people,
    getPeople,
    // fetchMore,
  } = PeopleStore()
  const { user } = AuthStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false

  // useEffect(() => {
  //   if (currentPage > 1) {
  //     fetchMore(
  //       `/posts/?myId=${user?._id}&page_size=${page_size}&page=${currentPage}&ordering=${sort}&postType=main&status=true`
  //     )
  //   }
  // }, [currentPage])

  const fetchMorePosts = () => {}

  const refreshPosts = () => {
    if (!user) return
    getPeople(`/users`)
  }

  const peopleRef = useRef(people)
  useEffect(() => {
    peopleRef.current = people
  }, [people])

  const renderItem = useCallback(
    ({ item }: { item: BioUserSchoolInfo }) => <PeopleCard user={item} />,
    []
  )

  const keyExtractor = useCallback((item: BioUserSchoolInfo) => item._id, [])

  return (
    <View className="flex-1 bg-secondary dark:bg-dark-secondary relative">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={50}
      >
        <AnimatedFlatList
          data={people}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          extraData={people}
          //   onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReachedThreshold={0.2}
          onEndReached={fetchMorePosts}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={{
            paddingBottom: 0,
          }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshPosts}
              tintColor={isDark ? '#6E6E6E' : '#1C1E21'}
              colors={['#DA3986']}
            />
          }
        />
      </KeyboardAvoidingView>
    </View>
  )
}

export default Accounts
