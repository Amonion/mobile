import { AuthStore } from '@/store/AuthStore'
import CommentStore from '@/store/post/Comment'
import { PostStore } from '@/store/post/Post'
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import EachComment from '../Sheets/EachComment'

export default function ProfileCommentBox() {
  const {
    mainPost,
    postedComment,
    page_size,
    currentPage,
    sort,
    hasMoreComments,
    tempComment,
    getComments,
    resetActiveComment,
    resetPostedComment,
  } = CommentStore()
  const comments = CommentStore((state) => state.comments)
  const { user } = AuthStore()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

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
  }, [tempComment, mainPost])

  useEffect(() => {
    if (!postedComment._id || !postedComment.uniqueId) return

    if (postedComment.level === 1) {
      PostStore.setState((state) => {
        const updatedPosts = state.postResults.map((p) =>
          p._id === postedComment.postId ? { ...p, replies: p.replies + 1 } : p
        )
        return {
          postResults: updatedPosts,
        }
      })
    }

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

    resetPostedComment()
  }, [postedComment])
  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 mb-[50px]"
      >
        {comments.map((result, index) => (
          <EachComment key={index} comment={result} />
        ))}
      </ScrollView>
    </View>
  )
}
