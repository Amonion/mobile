import { useCallback, useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'
import {
  Animated,
  useColorScheme,
  View,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useScrollY } from '@/context/ScrollYContext'
import { Post, PostStore } from '@/store/post/Post'
import { AuthStore } from '@/store/AuthStore'
import PostCard from '@/components/Posts/PostCard'
import FeaturedNews from '@/components/News/FeaturedNews'
import Moments from '@/components/Moments/Moments'
import CommentPostSheetInput from '@/components/Posts/CommentPostSheetInput'
import {
  CommentPostSheet,
  CommentPostSheetRef,
} from '@/components/Posts/CommentPostSheet'
import { useSharedValue, withTiming } from 'react-native-reanimated'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>)
const viewedPostsSet = new Set<string>()
const Home = () => {
  const {
    loading,
    postResults,
    hasMore,
    getSavedPosts,
    updatePost,
    getMoreSavedPosts,
  } = PostStore()
  const { user } = AuthStore()
  const { onScroll } = useScrollY()
  const pendingViews = useRef<Set<string>>(new Set())
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const router = useRouter()
  const commentPostSheetRef = useRef<CommentPostSheetRef>(null)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  const keyboardHeight = useSharedValue(0)

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setIsKeyboardVisible(true)
      keyboardHeight.value = withTiming(e.endCoordinates.height, {
        duration: 250,
      })
    })

    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false)
      keyboardHeight.value = withTiming(0, { duration: 250 })
    })

    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  useEffect(() => {
    postResultsRef.current = postResults
  }, [postResults])

  const fetchMorePosts = () => {
    console.log('End reached', hasMore)
    if (user && hasMore) getMoreSavedPosts(user)
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-secondary dark:bg-dark-secondary relative">
        <KeyboardAvoidingView
          style={{ flex: 1, paddingBottom: 60 }}
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
            keyboardDismissMode="on-drag" // ✅ dismiss on scroll
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refreshPosts}
                tintColor={isDark ? '#6E6E6E' : '#1C1E21'}
                colors={['#DA3986']}
              />
            }
            ListHeaderComponent={
              <View>
                <FeaturedNews />
                <Moments />
              </View>
            }
          />

          {showCommentInput && (
            <View
              className={`${
                isKeyboardVisible ? 'mb-[45px] pb-[50px]' : ''
              } z-50 bg-primary dark:bg-dark-primary px-3`}
            >
              <CommentPostSheetInput />
            </View>
          )}

          <CommentPostSheet
            ref={commentPostSheetRef}
            onOpen={() => setShowCommentInput(true)}
            onClose={() => setShowCommentInput(false)}
          />
        </KeyboardAvoidingView>

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
    </TouchableWithoutFeedback>
  )
}

export default Home
