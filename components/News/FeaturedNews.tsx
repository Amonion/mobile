import {
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import NewsStore, { News } from '@/store/news/News'
import { router } from 'expo-router'
import CommentStore from '@/store/post/Comment'
import { PostEmpty } from '@/store/post/Post'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import NewsInfo from './NewsInfo'
import { AuthStore } from '@/store/AuthStore'

const FeaturedNews: React.FC = () => {
  const { getComments } = CommentStore()
  const { news } = NewsStore()
  const { user } = AuthStore()
  const { width } = useWindowDimensions()
  const [featuredNews, setFeatureNews] = useState<News[]>([])

  useEffect(() => {
    if (news.length > 0) {
      setFeatureNews(news.filter((item) => item.isFeatured))
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
    getComments(`/comments/?postId=${id}&ordering=score&myId=${user?._id}`)
  }

  return (
    <View className="mb-1" style={{ height: 260, position: 'relative' }}>
      <Carousel
        width={width}
        height={260}
        data={featuredNews}
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

            <TouchableOpacity
              style={{ position: 'absolute', bottom: 0, padding: 12 }}
              onPress={() => move(item._id)}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 18,
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

export default FeaturedNews
