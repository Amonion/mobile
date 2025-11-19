import { Feather, MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, useColorScheme, TouchableOpacity } from 'react-native'
import { AuthStore } from '@/store/AuthStore'
import { Post, PostStore } from '@/store/post/Post'
import SocialStore from '@/store/post/Social'
import BottomSheetPostOptions from '../Sheets/BottomSheetPostOptions'

interface PostOptionsProps {
  post: Post
  visible: boolean
  setVisible: (state: boolean) => void
  visiblePostId?: string | null
}

const PostBottomSheetOptions: React.FC<PostOptionsProps> = ({
  post,
  visible,
  setVisible,
}) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const { deletePost, updatePost, updatePinPost, repostItem } = PostStore()
  const { muteUser, blockUser } = SocialStore()
  const { user } = AuthStore()

  const deleteItem = (id: string) => {
    deletePost(`/posts/${id}`)
    setVisible(false)
  }

  const followAccount = () => {
    updatePost(`/posts/follow/${post.userId}`, {
      post: post,
      followerId: user?._id,
    })
    setVisible(false)
  }

  const repost = (id: string) => {
    repostItem(`/posts/repost/${id}`, {
      post: post,
      userId: user?._id,
      username: user?.username,
      displayName: user?.displayName,
      isVerified: user?.isVerified,
      picture: user?.picture,
      createdAt: new Date(),
    })
    setVisible(false)
  }

  const pinPost = () => {
    updatePinPost(`/posts/pin/${post._id}`, {
      userId: user?._id,
      pinnedAt: new Date(),
    })
    // setActivePost(isActive ? null : post._id);
    setVisible(false)
  }

  const blockAccount = () => {
    blockUser(`/posts/block/${post._id}`, {
      userId: user?._id,
      username: user?.username,
      displayName: user?.displayName,
      picture: user?.picture,
      isVerified: user?.isVerified,
      accountUsername: post.username,
      accountUserId: post.userId,
      accountDisplayName: post.displayName,
      accountPicture: post.picture,
      accountIsVerified: post.isVerified,
    })
    setVisible(false)
  }

  const muteAccount = () => {
    setVisible(false)
    muteUser(`/posts/mute/${post._id}`, {
      userId: user?._id,
      username: user?.username,
      displayName: user?.displayName,
      picture: user?.picture,
      isVerified: user?.isVerified,
      accountUsername: post.username,
      accountUserId: post.userId,
      accountDisplayName: post.displayName,
      accountPicture: post.picture,
      accountIsVerified: post.isVerified,
    })
  }

  return (
    <BottomSheetPostOptions visible={visible} onClose={() => setVisible(false)}>
      <View className="">
        <TouchableOpacity
          onPress={pinPost}
          className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
        >
          <MaterialIcons
            name="push-pin"
            size={25}
            color={isDark ? '#BABABA' : '#6E6E6E'}
            style={{ marginRight: 15 }}
          />

          <Text className="text-xl text-primary dark:text-dark-primary">
            {post.isPinned ? `Unpin Post` : `Pin Post`}
          </Text>
        </TouchableOpacity>
        {user?._id !== post.userId && (
          <>
            <TouchableOpacity
              onPress={() => repost(post._id)}
              className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
            >
              <Feather
                name="refresh-ccw"
                size={25}
                color={isDark ? '#BABABA' : '#6E6E6E'}
                style={{ marginRight: 15 }}
              />
              <Text className="text-xl text-primary dark:text-dark-primary">
                Repost
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={followAccount}
              className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
            >
              <Feather
                name="paperclip"
                size={25}
                color={isDark ? '#BABABA' : '#6E6E6E'}
                style={{ marginRight: 15 }}
              />
              <Text className="text-xl text-primary dark:text-dark-primary">
                {post.followed ? `Unfollow Account` : `Follow Account`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={muteAccount}
              className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
            >
              <Feather
                name="volume-x"
                size={25}
                color={isDark ? '#BABABA' : '#6E6E6E'}
                style={{ marginRight: 15 }}
              />
              <Text className="text-xl text-primary dark:text-dark-primary">
                Mute Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={blockAccount}
              className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
            >
              <MaterialIcons
                name="block"
                size={25}
                color={isDark ? '#BABABA' : '#6E6E6E'}
                style={{ marginRight: 15 }}
              />
              <Text className="text-xl text-primary dark:text-dark-primary">
                {post.blocked ? 'Unblock User' : 'Block User'}
              </Text>
            </TouchableOpacity>
          </>
        )}
        {user?._id === post.userId && (
          <>
            <TouchableOpacity
              onPress={() => deleteItem(post._id)}
              className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
            >
              <Feather
                name="trash-2"
                size={25}
                color={isDark ? '#BABABA' : '#6E6E6E'}
                style={{ marginRight: 15 }}
              />
              <Text className="text-xl text-primary dark:text-dark-primary ">
                Delete Post
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </BottomSheetPostOptions>
  )
}

export default PostBottomSheetOptions
