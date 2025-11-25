import { formatRelativeDate, truncateString } from '@/lib/helpers'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useRef, useState } from 'react'
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
import { useRouter } from 'expo-router'
import { PostStore } from '@/store/post/Post'
import { UserStore } from '@/store/user/User'
import UserPostStore from '@/store/post/UserPost'
import PostBottomSheetOptions from '@/components/Posts/PostBottomSheet'
import HomePostMedia from '@/components/Posts/HomePostMedia'
import PollCard from '@/components/Posts/PollCard'
import PostStat from '@/components/Posts/PostStat'
import { CommentPostSheetRef } from '@/components/Posts/CommentPostSheet'

const PostDetails: React.FC = () => {
  const { width } = useWindowDimensions()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const { postForm } = PostStore()
  const { getUser } = UserStore()
  const { getPosts } = UserPostStore()
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const commentPostSheetRef = useRef<CommentPostSheetRef>(null)

  const move = () => {
    getUser(`/users/${postForm.username}/?userId=${postForm?.userId}`)
    UserPostStore.setState({ postResults: [] })
    getPosts(`/posts/user/?username=${postForm?.username}&page_size=40`)

    UserStore.setState((prev) => {
      return {
        userForm: {
          ...prev.userForm,
          username: postForm.username,
          picture: postForm.picture,
          displayName: postForm.displayName,
        },
      }
    })
    router.push(`/home/profile/${postForm.username}`)
  }

  return (
    <View className="bg-primary dark:bg-dark-primary py-4 mb-[2px]">
      <View className="flex-row px-3 items-start">
        <TouchableOpacity onPress={move} className="mr-3">
          <Image
            source={{ uri: postForm.picture }}
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
                {postForm.displayName}
              </Text>
            </TouchableOpacity>
            {postForm.isVerified && (
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={18}
                color="#DA3986"
                style={{ marginLeft: 'auto' }}
              />
            )}
          </View>
          <TouchableOpacity onPress={move}>
            <Text className="text-custom">@{postForm.username}</Text>
          </TouchableOpacity>
        </View>
        <View className="ml-auto justify-end flex-col items-end mb-auto">
          <View
            style={{ height: 25 }}
            className="items-center flex-row text-primaryLight rounded-full mb-[5px] relative"
          >
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
              post={postForm}
              visible={visible}
              setVisible={setVisible}
            />
          </View>
          <Text className="text-primary dark:text-dark-primary">
            {formatRelativeDate(String(postForm.createdAt))}
          </Text>
        </View>
      </View>

      {postForm.backgroundColor ? (
        <TouchableOpacity
          className="flex justify-center mt-3 px-3 items-center"
          style={{
            backgroundColor: postForm.backgroundColor,

            height: 250,
            width: '100%',
            position: 'relative',
          }}
        >
          <RenderHtml
            contentWidth={width}
            source={{ html: truncateString(postForm.content, 220) }}
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
          {postForm.content && (
            <TouchableOpacity className="text-secondary px-3 mt-3 dark:text-dark-secondary">
              <RenderHtml
                contentWidth={width}
                source={{ html: truncateString(postForm.content, 220) }}
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

          {postForm.media?.length > 0 && (
            <HomePostMedia sources={postForm.media} />
          )}
        </>
      )}

      {postForm.polls.length > 0 && (
        <PollCard
          postId={postForm._id}
          isSelected={postForm.isSelected}
          totalVotes={postForm.totalVotes}
        />
      )}

      <PostStat
        post={postForm}
        onCommentPress={() => commentPostSheetRef.current?.open()}
      />
    </View>
  )
}

export default PostDetails
