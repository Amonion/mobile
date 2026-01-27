import React, { useEffect } from 'react'
import { View, Image, Pressable, Text, ScrollView } from 'react-native'
import { ResizeMode, Video } from 'expo-av'
import CommentStore from '@/store/post/Comment'
import UserPostStore from '@/store/post/UserPost'
import { Post } from '@/store/post/Post'

type MediaItem = {
  src: string
  preview?: string
  content: string
  type: string
  backgroundColor?: string
  postId?: string
}

const MediaGrid: React.FC = () => {
  const { currentPage, page_size, sort, setShowActions, getComments } =
    CommentStore()

  const {
    userMediaResults,
    setSelectedUserMedia,
    setCurrentIndex,
    setFitMode,
    setIsMobile,
  } = UserPostStore()

  useEffect(() => {
    setIsMobile(true)
    setShowActions(false)
  }, [])

  const setMainPost = (index: number) => {
    let comment: Post | undefined

    UserPostStore.setState((prev) => {
      comment = prev.postResults.find(
        (item) => item._id === userMediaResults[index].postId
      )
      return { userPostForm: comment }
    })

    CommentStore.setState({ mainPost: comment })

    if (userMediaResults[index].postId) {
      getComments(
        `/comments?page=${currentPage}&ordering=${sort}&page_size=${page_size}&postType=comment&postId=${userMediaResults[index].postId}&level=1`
      )
    }
  }

  const openFullScreen = (index: number) => {
    setMainPost(index)
    setSelectedUserMedia(userMediaResults[index])
    setCurrentIndex(index)
    setFitMode(false)
  }

  const renderItem = (item: MediaItem, index: number) => (
    <Pressable
      onPress={() => openFullScreen(index)}
      className="w-full h-[180px] overflow-hidden"
    >
      {item.type.includes('image') ? (
        <Image
          source={{ uri: item.src }}
          className="w-full h-[180px]"
          resizeMode="cover"
        />
      ) : item.backgroundColor ? (
        <View
          className="w-full h-[180px] items-center justify-center px-1"
          style={{ backgroundColor: item.backgroundColor }}
        >
          <Text
            numberOfLines={3}
            className="text-white text-xs text-center leading-5"
          >
            {item.content}
          </Text>
        </View>
      ) : (
        <Video
          source={{ uri: item.src }}
          posterSource={{ uri: item.preview }}
          className="w-full h-[180px]"
          resizeMode={ResizeMode.COVER}
          isMuted
          isLooping
          usePoster
        />
      )}

      {item.type.includes('video') && (
        <View className="absolute top-2 right-2 bg-black/60 rounded-full px-1.5 py-0.5">
          <Text className="text-white text-xs">▶</Text>
        </View>
      )}
    </Pressable>
  )

  return (
    <View className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap">
          {userMediaResults.map((item, index) => (
            <View key={index} className="w-1/3 aspect-square p-[2px]">
              {renderItem(item, index)}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default MediaGrid
