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
  Linking,
} from 'react-native'
import RenderHtml from 'react-native-render-html'
import PostStat from './PostStat'
import { useRouter } from 'expo-router'
import PollCard from './PollCard'
import HomePostMedia from './HomePostMedia'
import { Post } from '@/store/post/Post'
import { UserStore } from '@/store/user/User'
import PostBottomSheetOptions from './PostBottomSheet'
import UserPostStore from '@/store/post/UserPost'

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
  const { getPosts } = UserPostStore()
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const move = () => {
    getUser(`/users/${post.username}/?userId=${post?.userId}`)
    UserPostStore.setState({ postResults: [] })
    getPosts(`/posts/user/?username=${post?.username}&page_size=40`)

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
                renderersProps={{
                  a: {
                    onPress: (event, href) => {
                      Linking.openURL(href).catch((err) =>
                        console.error('Failed to open URL:', err)
                      )
                    },
                  },
                }}
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
