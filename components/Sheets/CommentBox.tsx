import { Platform, FlatList } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import EachComment from './EachComment'
import { useEffect } from 'react'
import CommentStore from '@/store/post/Comment'
import { AuthStore } from '@/store/AuthStore'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import NewsStore from '@/store/news/News'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'

interface CommentBoxProps {
  translateY: SharedValue<number>
  visibleHeight: SharedValue<number>
}

const CommentBox: React.FC<CommentBoxProps> = ({ visibleHeight }) => {
  const {
    mainPost,
    postedComment,
    page_size,
    currentPage,
    sort,
    hasMoreComments,
    tempComment,
    comments,
    getComments,
    resetActiveComment,
    resetPostedComment,
  } = CommentStore()
  const { user } = AuthStore()
  const insets = useSafeAreaInsets()

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: visibleHeight.value - 100,
    }
  })

  useEffect(() => {
    return () => {
      CommentStore.setState({ comments: [] })
    }
  }, [])

  useEffect(() => {
    if (mainPost._id !== tempComment.postId) return

    CommentStore.setState((prev) => {
      const insertComment = (
        commentsList: typeof prev.comments
      ): typeof prev.comments => {
        return commentsList.map((comment) => {
          if (tempComment.level === 4) {
            const index = comment.comments.findIndex(
              (c) => c._id === tempComment.replyToId
            )
            if (index !== -1) {
              const updatedChildren = [
                ...comment.comments.slice(0, index + 1),
                tempComment,
                ...comment.comments.slice(index + 1),
              ]
              return {
                ...comment,
                comments: updatedChildren,
              }
            }
          }

          if (comment._id === tempComment.replyToId) {
            return {
              ...comment,
              comments: [tempComment, ...comment.comments],
            }
          }

          return {
            ...comment,
            comments: insertComment(comment.comments),
          }
        })
      }

      if (tempComment.level === 1) {
        return {
          comments: [tempComment, ...prev.comments],
        }
      }

      return {
        comments: insertComment(prev.comments),
      }
    })

    resetActiveComment()
  }, [tempComment])

  useEffect(() => {
    if (!postedComment._id || !postedComment.uniqueId) return

    if (postedComment.level === 1) {
      NewsStore.setState((state) => ({
        newsForm: {
          ...state.newsForm,
          replies: (state.newsForm.replies || 0) + 1,
        },
      }))
    } else {
      CommentStore.setState((prev) => {
        let didIncrement = false

        const replaceComment = (
          commentsList: typeof prev.comments
        ): typeof prev.comments => {
          return commentsList.map((comment) => {
            if (!didIncrement && comment._id === postedComment.replyToId) {
              didIncrement = true
              return {
                ...comment,
                replies: comment.replies + 1,
                comments: replaceComment(comment.comments),
              }
            }

            if (comment.uniqueId === postedComment.uniqueId) {
              return {
                ...comment,
                ...postedComment,
              }
            }

            return {
              ...comment,
              comments: replaceComment(comment.comments),
            }
          })
        }

        return {
          comments: replaceComment(prev.comments),
        }
      })
    }

    resetPostedComment()
  }, [postedComment])

  return (
    <>
      <Animated.View style={[{ flexGrow: 0 }, animatedStyle]}>
        <FlatList
          data={comments}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <EachComment comment={item} />}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'ios' ? 120 : insets.bottom + 70,
          }}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </>
  )
}
export default CommentBox
