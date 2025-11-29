import { useCallback, useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'
import {
  Animated,
  useColorScheme,
  View,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { AuthStore } from '@/store/AuthStore'
import PostCard from '@/components/Posts/PostCard'
import CommentPostSheetInput from '@/components/Posts/CommentPostSheetInput'
import {
  CommentPostSheet,
  CommentPostSheetRef,
} from '@/components/Posts/CommentPostSheet'
import { Post } from '@/store/post/Post'
import { PostStore } from '@/store/Trace/Post'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>)
const viewedPostsSet = new Set<string>()
const Home = () => {
  const {
    loading,
    postResults,
    hasMore,
    getSavedPosts,
    updatePost,
    // fetchMore,
  } = PostStore()
  const { user } = AuthStore()
  const pendingViews = useRef<Set<string>>(new Set())
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const commentPostSheetRef = useRef<CommentPostSheetRef>(null)
  const [showCommentInput, setShowCommentInput] = useState(false)
  // useEffect(() => {
  //   if (currentPage > 1) {
  //     fetchMore(
  //       `/posts/?myId=${user?._id}&page_size=${page_size}&page=${currentPage}&ordering=${sort}&postType=main&status=true`
  //     )
  //   }
  // }, [currentPage])

  const fetchMorePosts = () => {
    if (loading || !hasMore) return
  }

  const refreshPosts = () => {
    if (!user) return
    getSavedPosts(user)
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
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        onCommentPress={() => commentPostSheetRef.current?.open()}
      />
    ),
    []
  )

  const keyExtractor = useCallback((item: Post) => item._id, [])

  return (
    <View className="flex-1 bg-secondary dark:bg-dark-secondary relative">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={50}
      >
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
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshPosts}
              tintColor={isDark ? '#6E6E6E' : '#1C1E21'}
              colors={['#DA3986']}
            />
          }
        />
        {showCommentInput && (
          <View className="absolute bottom-0 left-0 right-0 z-50 bg-primary dark:bg-dark-primary pb-2  px-3">
            <CommentPostSheetInput />
          </View>
        )}

        <CommentPostSheet
          ref={commentPostSheetRef}
          onOpen={() => setShowCommentInput(true)}
          onClose={() => setShowCommentInput(false)}
        />
      </KeyboardAvoidingView>
    </View>
  )
}

export default Home
