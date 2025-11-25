import { formatRelativeDate, truncateString } from '@/lib/helpers'
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import React, { useState } from 'react'
import {
  View,
  Text,
  Image,
  useColorScheme,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native'
import RenderHtml from 'react-native-render-html'
import PostStat from './PostStat'
import { useRouter } from 'expo-router'
import PollCard from './PollCard'
import HomePostMedia from './HomePostMedia'
import { Post, PostStore } from '@/store/post/Post'
import { UserStore } from '@/store/user/User'
import PostBottomSheetOptions from './PostBottomSheet'
import CommentStore from '@/store/post/Comment'

interface PostCardProps {
  post: Post
  onCommentPress?: () => void
  visiblePostId?: string | null
}

const PostCard: React.FC<PostCardProps> = ({ post, onCommentPress }) => {
  const { width } = useWindowDimensions()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const { getUser } = UserStore()
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const { page_size, currentPage, getComments } = CommentStore()
  const { mediaResults, setSelectedMedia, setCurrentIndex, setFitMode } =
    PostStore()
  const move = () => {
    getUser(`/users/${post.username}/?userId=${post?.userId}`)

    UserStore.setState((prev) => {
      return {
        userForm: {
          ...prev.userForm,
          username: post.username,
          picture: post.picture,
          displayName: post.displayName,
        },
      }
    })
    router.push(`/home/profile/${post.username}`)
  }

  const setMainPost = (index: number) => {
    let comment: Post | undefined
    PostStore.setState((prev) => {
      comment = prev.postResults.find(
        (item) => item._id === mediaResults[index].postId
      )
      return {
        postForm: prev.postResults.find(
          (item) => item._id === mediaResults[index].postId
        ),
      }
    })
    CommentStore.setState({ mainPost: comment })
    if (mediaResults[index].postId) {
      getComments(
        `/posts/comments?page=${currentPage}&page_size=${page_size}&postType=comment&postId=${mediaResults[index].postId}&level=1`
      )
    }
    router.push(`/full-post`)
  }

  const setMedia = () => {
    const mediaIndex = mediaResults.findIndex(
      (item) => item.postId === post._id
    )
    setMainPost(mediaIndex)
    setCurrentIndex(mediaIndex)
    setFitMode(false)
    setSelectedMedia(mediaResults[mediaIndex])
  }

  return (
    <View className="bg-primary dark:bg-dark-primary py-4 mb-[2px]">
      <View className="flex-row px-3 items-start">
        <TouchableOpacity onPress={move} className="mr-3">
          <Image
            source={{ uri: post.picture }}
            className="rounded-full"
            style={{
              width: 55,
              height: 55,
            }}
          />
        </TouchableOpacity>

        <View>
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-2" onPress={move}>
              <Text className="font-semibold text-xl text-primary dark:text-dark-primary line-clamp-1 overflow-ellipsis">
                {post.displayName}
              </Text>
            </TouchableOpacity>
            {post.isVerified && (
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={18}
                color="#DA3986"
                style={{ marginLeft: 'auto' }}
              />
            )}
          </View>
          <TouchableOpacity onPress={move}>
            <Text className="text-custom">@{post.username}</Text>
          </TouchableOpacity>
        </View>
        <View className="ml-auto justify-end flex-col items-end mb-auto">
          <View
            style={{ height: 25 }}
            className="items-center flex-row text-primaryLight rounded-full mb-[5px] relative"
          >
            {post.isPinned && (
              <TouchableOpacity className="">
                <MaterialIcons
                  name="push-pin"
                  size={23}
                  color={isDark ? '#848484' : '#A4A2A2'}
                  style={{ marginRight: 5 }}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                setVisible(true)
              }}
              className=""
            >
              <Feather
                name="more-vertical"
                size={23}
                color={isDark ? '#848484' : '#A4A2A2'}
              />
            </TouchableOpacity>

            <PostBottomSheetOptions
              post={post}
              visible={visible}
              setVisible={setVisible}
            />
          </View>
          <Text className="text-primary dark:text-dark-primary">
            {formatRelativeDate(String(post.createdAt))}
          </Text>
        </View>
      </View>

      {post.backgroundColor ? (
        <TouchableOpacity
          onPress={setMedia}
          className="flex justify-center mt-3 px-3 items-center"
          style={{
            backgroundColor: post.backgroundColor,

            height: 250,
            width: '100%',
            position: 'relative',
          }}
        >
          <RenderHtml
            contentWidth={width}
            source={{ html: truncateString(post.content, 220) }}
            baseStyle={{
              color: '#FFF',
              fontSize: 17,
              fontWeight: 400,
              lineHeight: 23,
              textAlign: 'center',
            }}
            tagsStyles={{
              a: {
                color: '#DA3986',
                textDecorationLine: 'underline',
              },
            }}
          />
        </TouchableOpacity>
      ) : (
        <>
          {post.content && (
            <TouchableOpacity className="text-secondary px-3 mt-3 dark:text-dark-secondary">
              <RenderHtml
                contentWidth={width}
                source={{ html: truncateString(post.content, 220) }}
                baseStyle={{
                  color: isDark ? '#EFEFEF' : '#3A3A3A',
                  fontSize: 17,
                  fontWeight: 400,
                  lineHeight: 23,
                }}
                tagsStyles={{
                  a: {
                    color: '#DA3986',
                    textDecorationLine: 'underline',
                  },
                }}
                // renderersProps={{
                //   a: {
                //     onPress: (event, href) => {
                //       Linking.openURL(href).catch((err) =>
                //         console.error('Failed to open URL:', err)
                //       )
                //     },
                //   },
                // }}
              />
            </TouchableOpacity>
          )}

          {post.media?.length > 0 && <HomePostMedia sources={post.media} />}
        </>
      )}

      {post.polls.length > 0 && (
        <PollCard
          postId={post._id}
          isSelected={post.isSelected}
          totalVotes={post.totalVotes}
        />
      )}

      <PostStat post={post} onCommentPress={onCommentPress} />
    </View>
  )
}

function areEqual(prevProps: PostCardProps, nextProps: PostCardProps) {
  return (
    prevProps.post._id === nextProps.post._id &&
    prevProps.post.createdAt === nextProps.post.createdAt &&
    prevProps.post.likes === nextProps.post.likes &&
    prevProps.post.liked === nextProps.post.liked &&
    prevProps.post.bookmarks === nextProps.post.bookmarks &&
    prevProps.post.bookmarked === nextProps.post.bookmarked
  )
}

export default React.memo(PostCard, areEqual)
