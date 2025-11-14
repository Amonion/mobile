import 'react-native-gesture-handler'
import 'react-native-reanimated'
import { formatCount } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import NewsStore, { News } from '@/store/news/News'
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
import { upsert } from '@/lib/localStorage/db'

type NewsStatProps = {
  newsForm: News
  onCommentPress?: () => void
}

const NewsStat: React.FC<NewsStatProps> = ({ newsForm, onCommentPress }) => {
  const { updatePost } = PostStore()
  const { user } = AuthStore()
  const newsLink = `https://schoolingsocial.com/home/news/${newsForm._id}?action=shared`
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const color = isDark ? '#BABABA' : '#6E6E6E'

  const handleLike = async () => {
    NewsStore.setState((state) => {
      const updatedNews = state.news.map((p) => {
        if (p._id !== newsForm._id) return p

        const newLiked = !p.liked
        const newLikes = newLiked ? p.likes + 1 : p.likes - 1

        return {
          ...p,
          liked: newLiked,
          likes: newLikes,
        }
      })

      const updatedNewsForm =
        state.newsForm && state.newsForm._id === newsForm._id
          ? (() => {
              const newLiked = !state.newsForm.liked
              const newLikes = newLiked
                ? state.newsForm.likes + 1
                : state.newsForm.likes - 1

              return {
                ...state.newsForm,
                liked: newLiked,
                likes: newLikes,
              }
            })()
          : state.newsForm
      upsert('news', updatedNewsForm)
      return { news: updatedNews, newsForm: updatedNewsForm }
    })

    updatePost(`/news/like`, {
      id: newsForm._id,
      userId: user?._id,
    })
  }

  const handleBookmark = async () => {
    NewsStore.setState((state) => {
      const updatedNews = state.news.map((p) =>
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
      upsert('news', updatedNewsForm)
      return { news: updatedNews, newsForm: updatedNewsForm }
    })

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
    <View className="py-1 flex-row cursor-default flex items-center justify-between px-1">
      <TouchableOpacity
        onPress={handleLike}
        activeOpacity={0.7}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        className="flex gap-1 p-2 flex-row items-center"
      >
        <Heart
          size={18}
          color={newsForm.liked ? '#DA3986' : color}
          fill={newsForm.liked ? '#DA3986' : 'transparent'}
        />
        <Text className="text">{formatCount(newsForm.likes)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleBookmark}
        activeOpacity={0.7}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        className="flex gap-1 p-2 flex-row items-center"
      >
        <Bookmark
          size={18}
          color={newsForm.bookmarked ? '#DA3986' : color}
          fill={newsForm.bookmarked ? '#DA3986' : 'transparent'}
        />
        <Text className="text">{formatCount(newsForm.bookmarks)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCommentPress}
        className="flex gap-1 flex-row items-center p-2"
        activeOpacity={0.7}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <MessageCircle size={18} color={color} />
        <Text className="text">{formatCount(newsForm.replies)}</Text>
      </TouchableOpacity>

      <View className="flex gap-1 flex-row items-center">
        <Eye size={18} color={color} />
        <Text className="text">{formatCount(newsForm.views)}</Text>
      </View>

      <TouchableOpacity
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        className="p-3"
        onPress={handleShare}
      >
        <Share size={18} color={color} />
      </TouchableOpacity>
    </View>
  )
}

export default NewsStat
