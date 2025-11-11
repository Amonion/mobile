import { formatRelativeDate } from '@/lib/helpers'
import React from 'react'
import {
  View,
  Text,
  Image,
  useColorScheme,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native'
import NewsStore, { News } from '@/store/news/News'
import NewsStat from './NewsStat'
import { router } from 'expo-router'
import CommentStore from '@/store/post/Comment'
import { PostEmpty } from '@/store/post/Post'
import { Clock } from 'lucide-react-native'
import { AuthStore } from '@/store/AuthStore'

interface NewsCardProps {
  news: News
  onCommentPress?: () => void

  visiblePostId?: string | null
}

const NewsCard: React.FC<NewsCardProps> = ({ news, onCommentPress }) => {
  const colorScheme = useColorScheme()
  const color = colorScheme === 'dark' ? '#6E6E6E' : '#BABABA'
  const { getComments } = CommentStore()
  const { user } = AuthStore()

  const move = () => {
    CommentStore.setState({ mainPost: { ...PostEmpty, _id: news._id } })

    NewsStore.setState((prev) => {
      const newsItem = prev.news.find((item) => item._id === news._id)
      if (!newsItem) return prev
      return {
        newsForm: newsItem,
      }
    })

    router.push(`/news/${news._id}`)
    getComments(`/comments?postId=${news._id}&ordering=score&myId=${user?._id}`)
  }

  return (
    <>
      <View className="bg-primary pt-3 dark:bg-dark-primary mb-[2px]">
        <View className="flex-row px-3 mb-2">
          <View className="flex-1 pr-3">
            <TouchableOpacity onPress={move} className="flex-1">
              <Text className="text-lg line-clamp-3 overflow-ellipsis text-secondary dark:text-dark-secondary">
                {news.title}
              </Text>
            </TouchableOpacity>
            <View className="flex-row items-center gap-1">
              <Clock color={color} size={16} />
              <Text className="text-primary dark:text-dark-primary mb-[2px]">
                {formatRelativeDate(String(news.publishedAt))}
              </Text>
            </View>
          </View>
          <Image
            source={{ uri: String(news.picture) }}
            className="h-full rounded-[10px]"
            style={{
              width: 90,
              height: 100,
            }}
          />
        </View>

        <NewsStat newsForm={news} onCommentPress={onCommentPress} />
      </View>
    </>
  )
}

function areEqual(prevProps: NewsCardProps, nextProps: NewsCardProps) {
  return (
    prevProps.news._id === nextProps.news._id &&
    prevProps.news.createdAt === nextProps.news.createdAt &&
    prevProps.news.likes === nextProps.news.likes &&
    prevProps.news.liked === nextProps.news.liked &&
    prevProps.news.bookmarks === nextProps.news.bookmarks &&
    prevProps.news.bookmarked === nextProps.news.bookmarked
  )
}

export default React.memo(NewsCard, areEqual)
