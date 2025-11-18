import { useCallback, useEffect, useRef } from 'react'
import { debounce } from 'lodash'
import {
  Animated,
  useColorScheme,
  View,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
// import { HEADER_HEIGHT } from "@/constants/Sizes";
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useScrollY } from '@/context/ScrollYContext'
import { Post, PostStore } from '@/store/post/Post'
import { AuthStore } from '@/store/AuthStore'
import PostCard from '@/components/Posts/PostCard'
import FeaturedNews from '@/components/News/FeaturedNews'
import Moments from '@/components/Moments/Moments'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>)
const viewedPostsSet = new Set<string>()
const Home = () => {
  const {
    loading,
    postResults,
    updatePost,
    // fetchMore,
    hasMore,
    setCurrentPage,
    currentPage,
  } = PostStore()
  const { user } = AuthStore()
  const { onScroll } = useScrollY()
  const pendingViews = useRef<Set<string>>(new Set())
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const router = useRouter()

  // useEffect(() => {
  //   if (currentPage > 1) {
  //     fetchMore(
  //       `/posts/?myId=${user?._id}&page_size=${page_size}&page=${currentPage}&ordering=${sort}&postType=main&status=true`
  //     )
  //   }
  // }, [currentPage])

  const fetchMorePosts = () => {
    if (loading || !hasMore) return
    setCurrentPage(currentPage + 1)
  }

  const sendViewedPosts = useCallback(
    debounce(async () => {
      if (pendingViews.current.size === 0) return

      const ids = Array.from(pendingViews.current)
      pendingViews.current.clear()

      PostStore.setState((state) => {
        const updatedPosts = state.postResults.map((post) => {
          if (ids.includes(post._id) && !viewedPostsSet.has(post._id)) {
            return { ...post, viewed: true, views: post.views + 1 }
          }
          return post
        })

        return { postResults: updatedPosts }
      })

      updatePost(`/posts/view`, {
        viewedPostIds: ids,
        userId: user?._id,
      })
    }, 1500),
    []
  )

  const postResultsRef = useRef(postResults)
  useEffect(() => {
    postResultsRef.current = postResults
  }, [postResults])

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y
      onScroll(y)

      const visiblePosts = postResultsRef.current
      visiblePosts.forEach((post) => {
        if (!post.viewed && !viewedPostsSet.has(post._id)) {
          pendingViews.current.add(post._id)
        }
      })

      sendViewedPosts()
    },
    []
  )

  const renderItem = useCallback(
    ({ item }: { item: Post }) => <PostCard post={item} />,
    []
  )

  const keyExtractor = useCallback((item: Post) => item._id, [])

  return (
    <View className="flex-1 bg-secondary dark:bg-dark-secondary relative">
      <AnimatedFlatList
        data={postResults}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        extraData={postResults}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReachedThreshold={0.2}
        onEndReached={fetchMorePosts}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingBottom: 0,
        }}
        ListHeaderComponent={
          <View>
            <FeaturedNews />
            <Moments />
          </View>
        }
      />
      <TouchableOpacity
        onPress={() => router.push('/create-post')}
        className="rounded-full bg-custom absolute bottom-6 right-4 items-center justify-center"
        style={{
          shadowColor: isDark ? '#000000' : '#6E6E6E',
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 6,
          elevation: 8,
          width: 50,
          height: 50,
        }}
      >
        <Feather name="edit-2" color="#FFFFFF" size={25} />
      </TouchableOpacity>
    </View>
  )
}

export default Home
