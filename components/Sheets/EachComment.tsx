import React, { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  useColorScheme,
} from 'react-native'
import { ThumbsUp, ThumbsDown } from 'lucide-react-native'
import { AuthStore } from '@/store/AuthStore'
import CommentStore, { Comment } from '@/store/post/Comment'
import { customRequest } from '@/lib/api'
import { formatRelativeDate, truncateString } from '@/lib/helpers'
import RenderHtml from 'react-native-render-html'
import { router } from 'expo-router'
import UserPostStore from '@/store/post/UserPost'
import { UserStore } from '@/store/user/User'

interface FetchCommentResponse {
  count: number
  message: string
  page_size: number
  results: Comment[]
}

interface EachCommentProps {
  comment: Comment
  onHeightChange?: (id: string, height: number) => void
  isLast?: boolean
  hasMoreComments?: boolean
  depth?: number
}

const EachComment: React.FC<EachCommentProps> = ({
  comment,
  onHeightChange,
  isLast,
  hasMoreComments,
  depth = 0,
}) => {
  const { user } = AuthStore()
  const { getUser } = UserStore()
  const { setActiveComment, updateComment } = CommentStore()
  const { getPosts } = UserPostStore()
  const { width } = useWindowDimensions()
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [replies, setReplies] = useState<Comment[]>([])
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const ref = useRef<View>(null)

  const fetchReplies = useCallback(async () => {
    try {
      setLoading(true)
      const res = await customRequest({
        url: `/posts/comments/?replyToId=${comment._id}&level=${
          comment.level + 1
        }&page=${page}&page_size=10`,
      })
      const data = res?.data?.results || []
      if (page === 1) setReplies(data)
      else setReplies((prev) => [...prev, ...data])
      setHasMore(data.length >= 10)
      setPage(page + 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page])

  const handleLayout = (e: LayoutChangeEvent) => {
    if (onHeightChange) onHeightChange(comment._id, e.nativeEvent.layout.height)
  }

  const toggleLike = () => {
    updateComment(`/comments/like`, { id: comment._id, userId: user?._id })
    CommentStore.setState((prev) => ({
      comments: prev.comments.map((c) =>
        c._id === comment._id
          ? {
              ...c,
              liked: !c.liked,
              likes: c.liked ? c.likes - 1 : c.likes + 1,
              hated: c.liked ? c.hated : false,
              hates: c.liked ? c.hates : c.hated ? c.hates - 1 : c.hates,
            }
          : c
      ),
    }))
  }

  const toggleHate = () => {
    updateComment(`/comments/hate`, { id: comment._id, userId: user?._id })
    CommentStore.setState((prev) => ({
      comments: prev.comments.map((c) =>
        c._id === comment._id
          ? {
              ...c,
              hated: !c.hated,
              hates: c.hated ? c.hates - 1 : c.hates + 1,
              liked: c.hated ? c.liked : false,
              likes: c.hated ? c.likes : c.liked ? c.likes - 1 : c.likes,
            }
          : c
      ),
    }))
  }

  const renderReply = ({ item, index }: { item: Comment; index: number }) => (
    <EachComment
      key={item._id}
      comment={item}
      depth={depth + 1}
      isLast={index === replies.length - 1}
    />
  )

  const move = () => {
    getUser(`/users/${comment.username}/?userId=${comment?.userId}`)
    UserPostStore.setState({ postResults: [] })
    getPosts(`/posts/user/?username=${comment?.username}&page_size=40`)

    UserStore.setState((prev) => {
      return {
        userForm: {
          ...prev.userForm,
          username: comment.username,
          picture: comment.picture,
          displayName: comment.displayName,
        },
      }
    })
    router.push(`/home/profile/${comment.username}`)
  }

  return (
    <View className="flex-row py-2 mb-2" onLayout={handleLayout}>
      <Image
        source={{ uri: comment.picture }}
        className="rounded-full min-w-9 w-9 h-9 mr-3"
      />
      <View className="flex-1">
        <View className="flex-row text-primary mb-1 justify-between">
          <TouchableOpacity onPress={move}>
            <Text className="font-semibold text-primary dark:text-dark-primary">
              {comment.displayName}
            </Text>
          </TouchableOpacity>
          <Text className="text-[12px] text-primaryLight dark:text-dark-primaryLight">
            {formatRelativeDate(String(comment.createdAt))} ago
          </Text>
        </View>

        <RenderHtml
          contentWidth={width}
          source={{ html: truncateString(comment.content, 220) }}
          baseStyle={{
            color: isDark ? '#848484' : '#6E6E6E',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 20,
            marginBottom: 8,
          }}
          tagsStyles={{
            a: {
              color: '#DA3986',
              textDecorationLine: 'underline',
            },
          }}
        />

        <View className="gap-2 flex-row items-center">
          <TouchableOpacity onPress={toggleLike} style={styles.btn}>
            <ThumbsUp
              size={14}
              color={comment.liked ? '#DA3986' : isDark ? '#848484' : '#6E6E6E'}
              fill={comment.liked ? '#DA3986' : 'transparent'}
            />
            <Text style={styles.count}>{comment.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleHate} style={styles.btn}>
            <ThumbsDown
              size={14}
              color={comment.hated ? '#DA3986' : isDark ? '#848484' : '#6E6E6E'}
              fill={comment.hated ? '#DA3986' : 'transparent'}
            />
            <Text style={styles.count}>{comment.hates}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setActiveComment({ ...comment, level: comment.level + 1 })
            }
          >
            <Text className="text-[13px] text-custom">Reply</Text>
          </TouchableOpacity>
        </View>

        {comment.replies > 0 && replies.length === 0 && (
          <TouchableOpacity
            onPress={fetchReplies}
            style={styles.viewRepliesContainer}
          >
            <Text style={styles.viewReplies}>
              {loading ? 'Loading...' : `View ${comment.replies} replies`}
            </Text>
          </TouchableOpacity>
        )}

        {replies.length > 0 && (
          <FlatList
            data={replies}
            renderItem={renderReply}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        )}

        {hasMore && (
          <TouchableOpacity onPress={fetchReplies}>
            <Text style={styles.more}>Load more replies</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default EachComment

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  count: {
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
  },

  viewRepliesContainer: {
    marginTop: 4,
  },
  viewReplies: {
    color: '#007AFF',
    fontSize: 13,
  },
  more: {
    textAlign: 'left',
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },
})
