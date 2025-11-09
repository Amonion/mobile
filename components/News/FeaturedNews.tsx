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
import NewsStore from '@/store/news/News'

const FeaturedNews: React.FC = () => {
  const { featuredNews } = NewsStore()
  const { width } = useWindowDimensions()

  if (featuredNews.length === 0) return null

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

            <View
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
            />

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
              <TouchableOpacity>
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

export default FeaturedNews
