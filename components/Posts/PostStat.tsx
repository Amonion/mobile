import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import {
  View,
  Text,
  useColorScheme,
  TouchableOpacity,
  useWindowDimensions,
  Share,
} from 'react-native'
import { formatCount } from '@/lib/helpers'
import { decode } from 'html-entities'
import { AuthStore } from '@/store/AuthStore'
import { Post, PostStore } from '@/store/post/Post'
import CommentStore from '@/store/post/Comment'

interface Props {
  post: Post
}

const PostStat = ({ post }: Props) => {
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

  // ✅ Subscribe to the latest post data from store
  const livePost =
    PostStore((state) => state.postResults.find((p) => p._id === post._id)) ||
    post

  const handleLike = async () => {
    PostStore.setState((state) => ({
      postResults: state.postResults.map((p) =>
        p._id === livePost._id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p
      ),
    }))

    const updatedPost = PostStore.getState().postResults.find(
      (p) => p._id === livePost._id
    )

    updatePost(`/posts/stats`, {
      likes: updatedPost?.liked,
      id: livePost._id,
      userId: user?._id,
    })
  }

  const handleBookmark = async () => {
    PostStore.setState((state) => ({
      postResults: state.postResults.map((p) =>
        p._id === livePost._id
          ? {
              ...p,
              bookmarked: !p.bookmarked,
              bookmarks: p.bookmarked ? p.bookmarks - 1 : p.bookmarks + 1,
            }
          : p
      ),
    }))

    const updatedPost = PostStore.getState().postResults.find(
      (p) => p._id === livePost._id
    )

    updatePost(`/posts/stats`, {
      bookmarks: updatedPost?.bookmarked,
      id: livePost._id,
      userId: user?._id,
    })
  }

  const handleShare = async () => {
    try {
      const result = await Share.share({
        title: 'Schooling Social',
        message: `${plainText}\n\nCheck out our app here: https://schoolingsocial.com/home`,
        url: 'https://schoolingsocial.com/home',
      })

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared with ${result.activityType}`)
        } else {
          console.log('Shared successfully')
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed')
      }
    } catch (error) {
      console.error('Error sharing', error)
    }
  }

  const handleShowComments = () => {
    setMainPost(post)
    if (comments.length === 0) {
      fetchComments()
    } else if (comments.length > 0 && comments[0].postId !== post._id) {
      fetchComments()
    }
    setShowComment(!showComments)
  }

  const fetchComments = async () => {
    getComments(
      `/posts/?postId=${post._id}&myId=${user?._id}&page_size=${page_size}&page=1&ordering=${sort}`
    )
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
