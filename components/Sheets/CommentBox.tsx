import { Platform, FlatList } from 'react-native'

import EachComment from './EachComment'
import { useEffect } from 'react'
import CommentStore from '@/store/post/Comment'
import { AuthStore } from '@/store/AuthStore'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CommentBox: React.FC = () => {
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

  useEffect(() => {
    console.log(insets.bottom)
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

  return (
    <>
      <FlatList
        data={comments}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => <EachComment comment={item} />}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: Platform.OS === 'ios' ? 120 : insets.bottom + 170,
        }}
      />
    </>
  )
}
export default CommentBox
