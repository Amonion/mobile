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

type NewsStatProps = {
  onCommentPress?: () => void
}

const NewsStat: React.FC<NewsStatProps> = ({ onCommentPress }) => {
  const { updatePost } = PostStore()
  const { news, newsForm, newsType } = NewsStore()
  const currentNews = news.find((n) => n._id === newsForm._id) || newsForm
  const { user } = AuthStore()
  const newsLink = `https://schoolingsocial.com/news/${newsForm._id}?action=shared`
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const color = isDark ? '#BABABA' : '#6E6E6E'

  const handleLike = async () => {
    if (newsType === 'featuredNews') {
      NewsStore.setState((state) => {
        const updatedNews = state.featuredNews.map((p) =>
          p._id === newsForm._id
            ? {
                ...p,
                liked: !p.liked,
                likes: p.liked ? p.likes - 1 : p.likes + 1,
              }
            : p
        )

        const updatedNewsForm =
          state.newsForm && state.newsForm._id === newsForm._id
            ? {
                ...state.newsForm,
                liked: !state.newsForm.liked,
                likes: state.newsForm.liked
                  ? state.newsForm.likes - 1
                  : state.newsForm.likes + 1,
              }
            : state.newsForm

        return { featuredNews: updatedNews, newsForm: updatedNewsForm }
      })
    }

    updatePost(`/news/like`, {
      id: newsForm._id,
      userId: user?._id,
    })
  }

  const handleBookmark = async () => {
    if (newsType === 'featuredNews') {
      NewsStore.setState((state) => {
        const updatedNews = state.featuredNews.map((p) =>
          p._id === newsForm._id
            ? {
                ...p,
                bookmarked: !p.bookmarked,
                bookmarks: p.bookmarked ? p.bookmarks - 1 : p.bookmarks + 1,
              }
            : p
        )

        const updatedNewsForm =
          state.newsForm && state.newsForm._id === newsForm._id
            ? {
                ...state.newsForm,
                bookmarked: !state.newsForm.bookmarked,
                bookmarks: state.newsForm.bookmarked
                  ? state.newsForm.bookmarks - 1
                  : state.newsForm.bookmarks + 1,
              }
            : state.newsForm

        return { featuredNews: updatedNews, newsForm: updatedNewsForm }
      })
    }

    updatePost(`/news/bookmark`, {
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
      <TouchableOpacity
        onPress={handleLike}
        activeOpacity={0.7}
        className="flex gap-1 flex-row items-center"
      >
        <Heart
          size={18}
          color={currentNews.liked ? '#DA3986' : color}
          fill={currentNews.liked ? '#DA3986' : 'transparent'}
        />
        <Text className="text">{formatCount(currentNews.likes)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleBookmark}
        activeOpacity={0.7}
        className="flex gap-1 flex-row items-center"
      >
        <Bookmark
          size={18}
          color={currentNews.bookmarked ? '#DA3986' : color}
          fill={currentNews.bookmarked ? '#DA3986' : 'transparent'}
        />
        <Text className="text">{formatCount(currentNews.bookmarks)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCommentPress}
        className="flex gap-1 flex-row items-center"
      >
        <MessageCircle size={18} color={color} />
        <Text className="text">{formatCount(currentNews.replies)}</Text>
      </TouchableOpacity>

      <View className="flex gap-1 flex-row items-center">
        <Eye size={18} color={color} />
        <Text className="text">{formatCount(currentNews.views)}</Text>
      </View>

      <TouchableOpacity className="post_stat relative" onPress={handleShare}>
        <Share size={18} color={color} />
      </TouchableOpacity>
    </View>
  )
}

export default NewsStat
