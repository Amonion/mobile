import {
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import NewsStore, { News } from '@/store/news/News'
import { useEffect, useState } from 'react'
import CommentStore from '@/store/post/Comment'
import { PostEmpty } from '@/store/post/Post'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import NewsInfo from './NewsInfo'
import { AuthStore } from '@/store/AuthStore'

const MainNews: React.FC = () => {
  const { width } = useWindowDimensions()
  const { getComments } = CommentStore()
  const { news } = NewsStore()
  const { user } = AuthStore()
  const [mainNews, setMainNews] = useState<News[]>([])

  useEffect(() => {
    if (news.length > 0) {
      setMainNews(news.filter((item) => item.isMain))
    }
  }, [news])

  const move = (id: string) => {
    CommentStore.setState({ mainPost: { ...PostEmpty, _id: id } })

    NewsStore.setState((prev) => {
      const newsItem = prev.news.find((item) => item._id === id)
      if (!newsItem) return prev
      return {
        newsForm: newsItem,
      }
    })

    router.push(`/news/${id}`)
    getComments(`/comments?postId=${id}&ordering=score&myId=${user?._id}`)
  }

  return (
    <View className="mb-1" style={{ height: 260, position: 'relative' }}>
      <Carousel
        width={width}
        height={260}
        data={mainNews}
        autoPlay
        autoPlayInterval={6000}
        scrollAnimationDuration={1200}
        loop
        renderItem={({ item }) => (
          <View style={{ width, height: '100%' }}>
            {item.picture && (
              <Image
                source={{ uri: String(item.picture) }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            )}

            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.1)', 'transparent']}
              locations={[0, 0.5, 1]}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
              }}
            />

            <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            <TouchableOpacity
              style={{ position: 'absolute', bottom: 0, padding: 12 }}
              onPress={() => move(item._id)}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: 4,
                  lineHeight: 22,
                }}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </TouchableOpacity>

            <NewsInfo newsForm={item} />
          </View>
        )}
      />
    </View>
  )
}

export default MainNews
