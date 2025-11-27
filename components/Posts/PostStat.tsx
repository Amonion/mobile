import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import {
  View,
  Text,
  useColorScheme,
  TouchableOpacity,
  useWindowDimensions,
  Share as RNShare,
  Alert,
} from 'react-native'
import { formatCount } from '@/lib/helpers'
import { decode } from 'html-entities'
import { AuthStore } from '@/store/AuthStore'
import { Post, PostStore } from '@/store/post/Post'
import CommentStore from '@/store/post/Comment'
import * as Haptics from 'expo-haptics'
import * as Clipboard from 'expo-clipboard'
import { upsert } from '@/lib/localStorage/db'
interface Props {
  post: Post
  onCommentPress?: () => void
}

const PostStat = ({ post, onCommentPress }: Props) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const {
    setShowComment,
    getComments,
    setMainPost,
    comments,
    showComments,
    page_size,
    sort,
  } = CommentStore()
  const { updatePost } = PostStore()
  const { user } = AuthStore()
  const { width } = useWindowDimensions()
  const fontSize = 20
  const plainText = decode(post.content.replace(/<[^>]+>/g, ''))
  const newsLink = `https://schoolingsocial.com/home/news/${post._id}?action=shared`

  const livePost =
    PostStore((state) => state.postResults.find((p) => p._id === post._id)) ||
    post

  const handleLike = async () => {
    PostStore.setState((state) => ({
      postResults: state.postResults.map((p) => {
        if (p._id !== livePost._id) return p

        const likes = typeof p.likes === 'number' ? p.likes : 0

        return {
          ...p,
          liked: !p.liked,
          likes: p.liked ? likes - 1 : likes + 1,
        }
      }),
    }))

    updatePost(`/posts/like`, {
      id: livePost._id,
      userId: user?._id,
    })
  }

  const handleBookmark = async () => {
    PostStore.setState((state) => ({
      postResults: state.postResults.map((p) => {
        if (p._id !== livePost._id) return p

        const bookmarks = typeof p.bookmarks === 'number' ? p.bookmarks : 0

        const updatedPost = {
          ...p,
          bookmarked: !p.bookmarked,
          bookmarks: p.bookmarked ? bookmarks - 1 : bookmarks + 1,
        }
        upsert('posts', updatedPost)

        return updatedPost
      }),
    }))
    PostStore.setState((state) => ({
      bookmarkedPostResults: state.bookmarkedPostResults.map((p) => {
        if (p._id !== livePost._id) return p

        const bookmarks = typeof p.bookmarks === 'number' ? p.bookmarks : 0

        const updatedPost = {
          ...p,
          bookmarked: !p.bookmarked,
          bookmarks: p.bookmarked ? bookmarks - 1 : bookmarks + 1,
        }
        return updatedPost
      }),
    }))

    updatePost(`/posts/bookmarks`, {
      id: livePost._id,
      userId: user?._id,
    })
  }

  const handleShare = async () => {
    try {
      await Clipboard.setStringAsync(newsLink)

      Haptics.selectionAsync()

      await RNShare.share({
        title: 'Schooling Social',
        message: `${plainText}\n\nCheck out our app here: ${newsLink}`,
        url: newsLink,
      })
    } catch (err) {
      console.error('Error sharing link:', err)
      Alert.alert('Error', 'Could not share the link.')
    }
  }

  const handleShowComments = () => {
    setMainPost(post)
    if (comments.length > 0 && comments[0].postId !== post._id) {
      CommentStore.setState({ comments: [] })
    }
    setShowComment(!showComments)
    fetchComments()
  }

  const fetchComments = async () => {
    getComments(
      `/comments/?postId=${post._id}&myId=${user?._id}&page_size=${page_size}&page=1&ordering=${sort}`
    )
    if (onCommentPress) {
      onCommentPress()
    }
  }

  return (
    <View className={`flex-row justify-between mt-3 h-[30px] px-3`}>
      <TouchableOpacity onPress={handleLike} className="flex-row items-center">
        {livePost.liked ? (
          <Ionicons
            name="heart"
            className="mr-1"
            size={fontSize}
            color="#DA3986"
          />
        ) : (
          <Ionicons
            name="heart-outline"
            className="mr-1"
            size={fontSize}
            color={isDark ? '#848484' : '#A4A2A2'}
          />
        )}
        <Text className="text-primaryLight dark:text-dark-primaryLight">
          {formatCount(livePost.likes)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleBookmark}
        className="flex-row items-center"
      >
        {livePost.bookmarked ? (
          <MaterialIcons
            name="bookmark"
            size={fontSize}
            color="#DA3986"
            style={{ marginRight: 4 }}
          />
        ) : (
          <MaterialIcons
            name="bookmark-outline"
            size={fontSize}
            color={isDark ? '#848484' : '#A4A2A2'}
            style={{ marginRight: 4 }}
          />
        )}
        <Text className="text-primaryLight dark:text-dark-primaryLight">
          {formatCount(livePost.bookmarks)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleShowComments}
        className="flex-row items-center justify-center block"
      >
        <View className="flex-row items-center justify-center">
          <Ionicons
            className="mr-1"
            name="chatbubble-ellipses-outline"
            size={fontSize}
            color={isDark ? '#848484' : '#A4A2A2'}
          />

          <Text className="text-primaryLight dark:text-dark-primaryLight">
            {formatCount(livePost.replies)}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row items-center">
        <Feather
          name="eye"
          className="mr-1"
          size={fontSize}
          color={isDark ? '#848484' : '#A4A2A2'}
        />
        <Text className="text-primaryLight dark:text-dark-primaryLight">
          {formatCount(livePost.views)}
        </Text>
      </View>

      <View className="flex-row items-center">
        <Ionicons
          name="share-social-outline"
          size={width * 0.06}
          color={isDark ? '#848484' : '#A4A2A2'}
          onPress={handleShare}
        />
      </View>
    </View>
  )
}

export default PostStat
