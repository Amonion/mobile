import {
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import { formatCount, formatRelativeDate } from '@/lib/helpers'
import RenderHTML from 'react-native-render-html'
import { Eye, Heart, MessageCircle } from 'lucide-react-native'
import Carousel from 'react-native-reanimated-carousel'
import NewsStore, { News } from '@/store/news/News'
import { useEffect, useState } from 'react'
import CommentStore from '@/store/post/Comment'
import { PostEmpty } from '@/store/post/Post'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

const MainNews: React.FC = () => {
  const { width } = useWindowDimensions()
  const { getComments } = CommentStore()
  const { news } = NewsStore()
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
    getComments(`/posts/comments?postType=comment&postId=${id}`)
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

            <View
              style={{
                position: 'absolute',
                right: 8,
                top: 8,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 25,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>
                {formatRelativeDate(String(item?.publishedAt))}
              </Text>
            </View>

            <View style={{ position: 'absolute', bottom: 0, padding: 12 }}>
              <TouchableOpacity onPress={() => move(item._id)}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 4,
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <RenderHTML
                  contentWidth={width}
                  source={{ html: item.subtitle || '' }}
                  baseStyle={{
                    color: '#D1D5DB',
                    fontSize: 14,
                    lineHeight: 22,
                  }}
                  tagsStyles={{ p: { margin: 0 } }}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                position: 'absolute',
                bottom: 20,
                right: 12,
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Eye size={18} color="white" />
                <Text style={{ color: 'white', fontSize: 12 }}>
                  {item.views > 0 ? formatCount(item.views) : ''}
                </Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Heart size={18} color="white" />
                <Text style={{ color: 'white', fontSize: 12 }}>
                  {item.likes > 0 ? formatCount(item.likes) : ''}
                </Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <MessageCircle size={18} color="white" />
                <Text style={{ color: 'white', fontSize: 12 }}>
                  {item.replies > 0 ? formatCount(item.replies) : ''}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  )
}

export default MainNews
