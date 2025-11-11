import { Text, View } from 'react-native'
import { formatCount, formatRelativeDate } from '@/lib/helpers'
import { Eye, Heart, MessageCircle } from 'lucide-react-native'
import { News } from '@/store/news/News'

interface NewsInfoProps {
  newsForm: News
}

const NewsInfo: React.FC<NewsInfoProps> = ({ newsForm }) => {
  return (
    <>
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
          {formatRelativeDate(String(newsForm?.publishedAt))}
        </Text>
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 30,
          right: 12,
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Eye size={18} color="white" />
          <Text style={{ color: 'white', fontSize: 12 }}>
            {newsForm.views > 0 ? formatCount(newsForm.views) : ''}
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Heart size={18} color="white" />
          <Text style={{ color: 'white', fontSize: 12 }}>
            {newsForm.likes > 0 ? formatCount(newsForm.likes) : ''}
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <MessageCircle size={18} color="white" />
          <Text style={{ color: 'white', fontSize: 12 }}>
            {newsForm.replies > 0 ? formatCount(newsForm.replies) : ''}
          </Text>
        </View>
      </View>
    </>
  )
}

export default NewsInfo
