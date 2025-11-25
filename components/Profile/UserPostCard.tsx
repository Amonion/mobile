// import { formatRelativeDate, truncateString } from '@/lib/helpers'
// import {
//   Feather,
//   MaterialCommunityIcons,
//   MaterialIcons,
// } from '@expo/vector-icons'
// import React, { useState } from 'react'
// import {
//   View,
//   Text,
//   Image,
//   useColorScheme,
//   useWindowDimensions,
//   TouchableOpacity,
//   Linking,
// } from 'react-native'
// import RenderHtml from 'react-native-render-html'
// import { usePathname } from 'expo-router'
// import { AuthStore } from '@/store/AuthStore'
// import { Post, PostStore } from '@/store/post/Post'
// import SocialStore from '@/store/post/Social'
// import BottomSheetPostOptions from '../Sheets/BottomSheetPostOptions'
// import HomePostMedia from '../Posts/HomePostMedia'
// import PollCard from '../Posts/PollCard'
// import PostStat from '../Posts/PostStat'

// interface UserPostCardProps {
//   post: Post
//   index: number
// }

// const UserPostCard: React.FC<UserPostCardProps> = ({ post, index }) => {
//   const { width } = useWindowDimensions()
//   const colorScheme = useColorScheme()
//   const isDark = colorScheme === 'dark' ? true : false
//   const { deletePost, updatePost, updatePinPost, repostItem } = PostStore()
//   const { muteUser, blockUser } = SocialStore()
//   const { user } = AuthStore()
//   const pathName = usePathname()
//   const [visible, setVisible] = useState(false)

//   const deleteItem = (id: string) => {
//     deletePost(`/posts/${id}`)
//     setVisible(false)
//   }

//   const followAccount = () => {
//     updatePost(`/posts/follow/${post.userId}`, {
//       post: post,
//       followerId: user?._id,
//     })
//     setVisible(false)
//   }

//   const repost = (id: string) => {
//     repostItem(`/posts/repost/${id}`, {
//       post: post,
//       userId: user?._id,
//       username: user?.username,
//       displayName: user?.displayName,
//       isVerified: user?.isVerified,
//       picture: user?.picture,
//       createdAt: new Date(),
//     })
//     setVisible(false)
//   }

//   const pinPost = () => {
//     updatePinPost(`/posts/pin/${post._id}`, {
//       userId: user?._id,
//       pinnedAt: new Date(),
//     })
//     // setActivePost(isActive ? null : post._id);
//     setVisible(false)
//   }

//   const move = () => {
//     if (
//       pathName === '/home' ||
//       (!pathName.includes('/home/profile') && !pathName.includes('/home/user'))
//     ) {
//       // router.push({
//       //   pathname: '/home/user/[username]',
//       //   params: { username: post.username },
//       // })
//     }
//   }

//   const blockAccount = () => {
//     blockUser(`/posts/block/${post._id}`, {
//       userId: user?._id,
//       username: user?.username,
//       displayName: user?.displayName,
//       picture: user?.picture,
//       isVerified: user?.isVerified,
//       accountUsername: post.username,
//       accountUserId: post.userId,
//       accountDisplayName: post.displayName,
//       accountPicture: post.picture,
//       accountIsVerified: post.isVerified,
//     })
//     setVisible(false)
//   }

//   const muteAccount = () => {
//     setVisible(false)
//     muteUser(`/posts/mute/${post._id}`, {
//       userId: user?._id,
//       username: user?.username,
//       displayName: user?.displayName,
//       picture: user?.picture,
//       isVerified: user?.isVerified,
//       accountUsername: post.username,
//       accountUserId: post.userId,
//       accountDisplayName: post.displayName,
//       accountPicture: post.picture,
//       accountIsVerified: post.isVerified,
//     })
//   }

//   return (
//     <View className="bg-primary dark:bg-dark-primary py-4 mb-[2px]">
//       <View className="flex-row px-3 items-start">
//         <TouchableOpacity onPress={move} className="mr-3">
//           <Image
//             source={{ uri: post.picture }}
//             className="rounded-full"
//             style={{
//               width: 55,
//               height: 55,
//             }}
//           />
//         </TouchableOpacity>

//         <View>
//           <View className="flex-row items-center">
//             <Text className="font-semibold mr-2 text-xl text-primary dark:text-dark-primary line-clamp-1 overflow-ellipsis">
//               {post.displayName}
//             </Text>
//             {post.isVerified && (
//               <MaterialCommunityIcons
//                 name="shield-check-outline"
//                 size={18}
//                 color="#DA3986"
//                 style={{ marginLeft: 'auto' }}
//               />
//             )}
//           </View>
//           <TouchableOpacity onPress={move}>
//             <Text className="text-custom">@{post.username}</Text>
//           </TouchableOpacity>
//         </View>
//         <View className="ml-auto justify-end flex-col items-end mb-auto">
//           <View
//             style={{ height: 25 }}
//             className="items-center flex-row text-primaryLight rounded-full mb-[5px] relative"
//           >
//             {post.isPinned && (
//               <TouchableOpacity className="">
//                 <MaterialIcons
//                   name="push-pin"
//                   size={23}
//                   color={isDark ? '#848484' : '#A4A2A2'}
//                   style={{ marginRight: 5 }}
//                 />
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity
//               onPress={() => {
//                 setVisible(true)
//               }}
//               className=""
//             >
//               <Feather
//                 name="more-vertical"
//                 size={23}
//                 color={isDark ? '#848484' : '#A4A2A2'}
//               />
//             </TouchableOpacity>

//             <BottomSheetPostOptions
//               visible={visible}
//               onClose={() => setVisible(false)}
//             >
//               <View className="">
//                 <TouchableOpacity
//                   onPress={pinPost}
//                   className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
//                 >
//                   <MaterialIcons
//                     name="push-pin"
//                     size={25}
//                     color={isDark ? '#BABABA' : '#6E6E6E'}
//                     style={{ marginRight: 15 }}
//                   />

//                   <Text className="text-xl text-primary dark:text-dark-primary">
//                     {post.isPinned ? `Unpin Post` : `Pin Post`}
//                   </Text>
//                 </TouchableOpacity>
//                 {user?._id !== post.userId && (
//                   <>
//                     <TouchableOpacity
//                       onPress={() => repost(post._id)}
//                       className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
//                     >
//                       <Feather
//                         name="refresh-ccw"
//                         size={25}
//                         color={isDark ? '#BABABA' : '#6E6E6E'}
//                         style={{ marginRight: 15 }}
//                       />
//                       <Text className="text-xl text-primary dark:text-dark-primary">
//                         Repost
//                       </Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={followAccount}
//                       className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
//                     >
//                       <Feather
//                         name="paperclip"
//                         size={25}
//                         color={isDark ? '#BABABA' : '#6E6E6E'}
//                         style={{ marginRight: 15 }}
//                       />
//                       <Text className="text-xl text-primary dark:text-dark-primary">
//                         {post.followed ? `Unfollow Account` : `Follow Account`}
//                       </Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={muteAccount}
//                       className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
//                     >
//                       <Feather
//                         name="volume-x"
//                         size={25}
//                         color={isDark ? '#BABABA' : '#6E6E6E'}
//                         style={{ marginRight: 15 }}
//                       />
//                       <Text className="text-xl text-primary dark:text-dark-primary">
//                         Mute Account
//                       </Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={blockAccount}
//                       className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
//                     >
//                       <MaterialIcons
//                         name="block"
//                         size={25}
//                         color={isDark ? '#BABABA' : '#6E6E6E'}
//                         style={{ marginRight: 15 }}
//                       />
//                       <Text className="text-xl text-primary dark:text-dark-primary">
//                         {post.blocked ? 'Unblock User' : 'Block User'}
//                       </Text>
//                     </TouchableOpacity>
//                   </>
//                 )}
//                 {user?._id === post.userId && (
//                   <>
//                     <TouchableOpacity
//                       onPress={() => deleteItem(post._id)}
//                       className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
//                     >
//                       <Feather
//                         name="trash-2"
//                         size={25}
//                         color={isDark ? '#BABABA' : '#6E6E6E'}
//                         style={{ marginRight: 15 }}
//                       />
//                       <Text className="text-xl text-primary dark:text-dark-primary ">
//                         Delete Post
//                       </Text>
//                     </TouchableOpacity>
//                   </>
//                 )}
//               </View>
//             </BottomSheetPostOptions>
//           </View>
//           <Text className="text-primary dark:text-dark-primary">
//             {formatRelativeDate(String(post.createdAt))}
//           </Text>
//         </View>
//       </View>

//       {post.backgroundColor ? (
//         <View
//           className="flex justify-center mt-3 px-3 items-center"
//           style={{
//             backgroundColor: post.backgroundColor,

//             height: 250,
//             width: '100%',
//             position: 'relative',
//           }}
//         >
//           <RenderHtml
//             contentWidth={width}
//             source={{ html: truncateString(post.content, 220) }}
//             baseStyle={{
//               color: '#FFF',
//               fontSize: 17,
//               fontWeight: 400,
//               lineHeight: 23,
//               textAlign: 'center',
//             }}
//             tagsStyles={{
//               a: {
//                 color: '#DA3986',
//                 textDecorationLine: 'underline',
//               },
//             }}
//           />
//         </View>
//       ) : (
//         <>
//           {post.content && (
//             <TouchableOpacity className="text-secondary px-3 mt-3 dark:text-dark-secondary">
//               <RenderHtml
//                 contentWidth={width}
//                 source={{ html: truncateString(post.content, 220) }}
//                 baseStyle={{
//                   color: isDark ? '#EFEFEF' : '#3A3A3A',
//                   fontSize: 17,
//                   fontWeight: 400,
//                   lineHeight: 23,
//                 }}
//                 tagsStyles={{
//                   a: {
//                     color: '#DA3986',
//                     textDecorationLine: 'underline',
//                   },
//                 }}
//                 // renderersProps={{
//                 //   a: {
//                 //     onPress: (event, href) => {
//                 //       Linking.openURL(href).catch((err) =>
//                 //         console.error('Failed to open URL:', err)
//                 //       )
//                 //     },
//                 //   },
//                 // }}
//               />
//             </TouchableOpacity>
//           )}

//           {post.media?.length > 0 && <HomePostMedia sources={post.media} />}
//         </>
//       )}

//       {post.polls.length > 0 && (
//         <PollCard
//           postId={post._id}
//           isSelected={post.isSelected}
//           totalVotes={post.totalVotes}
//         />
//       )}

//       <PostStat post={post} />
//     </View>
//   )
// }

// function areEqual(prevProps: UserPostCardProps, nextProps: UserPostCardProps) {
//   return (
//     prevProps.post._id === nextProps.post._id &&
//     prevProps.post.createdAt === nextProps.post.createdAt &&
//     prevProps.post.likes === nextProps.post.likes &&
//     prevProps.post.liked === nextProps.post.liked &&
//     prevProps.post.bookmarks === nextProps.post.bookmarks &&
//     prevProps.post.bookmarked === nextProps.post.bookmarked
//   )
// }

// export default React.memo(UserPostCard, areEqual)

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
import { useRouter } from 'expo-router'
import { Post } from '@/store/post/Post'
import { UserStore } from '@/store/user/User'
import UserPostStore from '@/store/post/UserPost'
import PostBottomSheetOptions from '../Posts/PostBottomSheet'
import HomePostMedia from '../Posts/HomePostMedia'
import PollCard from '../Posts/PollCard'
import PostStat from '../Posts/PostStat'

interface UserPostCardProps {
  post: Post
  onCommentPress?: () => void
  index?: number
  visiblePostId?: string | null
}

const UserPostCard: React.FC<UserPostCardProps> = ({
  post,
  onCommentPress,
}) => {
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

function areEqual(prevProps: UserPostCardProps, nextProps: UserPostCardProps) {
  return (
    prevProps.post._id === nextProps.post._id &&
    prevProps.post.createdAt === nextProps.post.createdAt &&
    prevProps.post.likes === nextProps.post.likes &&
    prevProps.post.liked === nextProps.post.liked &&
    prevProps.post.bookmarks === nextProps.post.bookmarks &&
    prevProps.post.bookmarked === nextProps.post.bookmarked
  )
}

export default React.memo(UserPostCard, areEqual)
