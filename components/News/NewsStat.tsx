import 'react-native-gesture-handler'
import 'react-native-reanimated' // MUST be at top before any other imports
import { formatCount } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import NewsStore from '@/store/news/News'
import { PostStore } from '@/store/post/Post'
import { Bookmark, Eye, Heart, MessageCircle, Share } from 'lucide-react-native'
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Share as RNShare,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import * as Clipboard from 'expo-clipboard'

const NewsStat: React.FC = () => {
  const { updatePost } = PostStore()
  const { newsForm } = NewsStore()
  const { user } = AuthStore()
  const newsLink = `https://schoolingsocial.com/news/${newsForm._id}?action=shared`

  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const color = isDark ? '#BABABA' : '#6E6E6E'

  const handleLike = async () => {
    NewsStore.setState((state) => {
      const updatedPosts = state.news.map((p) =>
        p._id === newsForm._id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )

      return { news: updatedPosts }
    })

    const updatedPost = NewsStore.getState().news.find(
      (p) => p._id === newsForm._id
    )

    updatePost(`/posts/stats`, {
      likes: updatedPost?.liked,
      id: newsForm._id,
      userId: user?._id,
    })
  }

  const handleBookmark = async () => {
    NewsStore.setState((state) => {
      const news = state.news.map((p) =>
        p._id === newsForm._id
          ? {
              ...p,
              bookmarked: !p.bookmarked,
              bookmarks: p.bookmarked ? p.bookmarks - 1 : p.bookmarks + 1,
            }
          : p
      )

      return { news: news }
    })

    const updatedNews = NewsStore.getState().news.find(
      (p) => p._id === newsForm._id
    )

    updatePost(`/posts/stats`, {
      bookmarks: updatedNews?.bookmarked,
      id: newsForm._id,
      userId: user?._id,
    })
  }

  const handleShare = async () => {
    try {
      await Clipboard.setStringAsync(newsLink)

      Haptics.selectionAsync()

      await RNShare.share({
        message: `Check this out on Schooling: ${newsLink}`,
        url: newsLink,
      })
    } catch (err) {
      console.error('Error sharing link:', err)
      Alert.alert('Error', 'Could not share the link.')
    }
  }

  return (
    <View className="py-3 flex-row cursor-default flex items-center justify-between px-3">
      <View className="flex gap-1 flex-row items-center">
        <TouchableOpacity
          onPress={handleLike}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Heart
            size={18}
            color={newsForm.liked ? '#DA3986' : color}
            fill={newsForm.liked ? '#DA3986' : 'transparent'}
          />
        </TouchableOpacity>
        <Text className="text">{formatCount(newsForm.likes)}</Text>
      </View>

      <View className="flex gap-1 flex-row items-center">
        <TouchableOpacity
          onPress={handleBookmark}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Bookmark
            size={18}
            color={color}
            fill={newsForm.bookmarked ? color : 'transparent'}
          />
        </TouchableOpacity>
        <Text className="text">{formatCount(newsForm.bookmarks)}</Text>
      </View>

      <View className="flex gap-1 flex-row items-center">
        <MessageCircle size={18} color={color} />
        <Text className="text">{formatCount(newsForm.replies)}</Text>
      </View>

      <View className="flex gap-1 flex-row items-center">
        <Eye size={18} color={color} />
        <Text className="text">{formatCount(newsForm.views)}</Text>
      </View>

      <TouchableOpacity className="post_stat relative" onPress={handleShare}>
        <Share size={18} color={color} />
      </TouchableOpacity>
    </View>
  )
}

export default NewsStat
