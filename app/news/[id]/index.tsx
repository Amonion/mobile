import 'react-native-gesture-handler'
import 'react-native-reanimated'
import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native'
import RenderHtml from 'react-native-render-html'
import NewsStore from '@/store/news/News'
import { useEffect, useRef } from 'react'
import { useLocalSearchParams } from 'expo-router'
import NewsStat from '@/components/News/NewsStat'
import { Calendar, User } from 'lucide-react-native'
import { formatDate } from '@/lib/helpers'
import { CommentSheet, CommentSheetRef } from '@/components/Sheets/CommentSheet'
import CommentStore from '@/store/post/Comment'
import { PostEmpty } from '@/store/post/Post'

const FeaturedNews: React.FC = () => {
  const { newsForm, getANews } = NewsStore()
  const { mainPost } = CommentStore()
  const { width } = useWindowDimensions()
  const { id } = useLocalSearchParams()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const color = isDark ? '#BABABA' : '#6E6E6E'
  const commentSheetRef = useRef<CommentSheetRef>(null)

  useEffect(() => {
    if (!newsForm._id) {
      getANews(`/news/${id}`)
    }
  }, [newsForm._id])

  useEffect(() => {
    if (!mainPost._id) {
      CommentStore.setState({ mainPost: { ...PostEmpty, _id: String(id) } })
    }
  }, [mainPost._id])

  return (
    <View
      className="flex-1 bg-secondary dark:bg-dark-secondary"
      style={{ position: 'relative' }}
    >
      <View style={{ width, height: 260 }}>
        {newsForm.picture && (
          <Image
            source={{ uri: String(newsForm.picture) }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        )}
      </View>
      <NewsStat onCommentPress={() => commentSheetRef.current?.open()} />
      <View className="px-3">
        <View className="py-1 gap-4 flex-row cursor-default flex items-center mb-5">
          <View className="flex gap-1 flex-row items-center">
            <User size={18} color={color} />
            <Text className="text">{newsForm.author}</Text>
          </View>

          <View className="flex gap-1 flex-row items-center">
            <Calendar size={18} color={color} />
            <Text className="text">
              {formatDate(String(newsForm.publishedAt))}
            </Text>
          </View>
        </View>

        <Text className="text-secondary dark:text-dark-secondary text-xl mb-1">
          {newsForm.title}
        </Text>
        <Text className="text-primaryLight dark:text-dark-primaryLight text-lg mb-5">
          {newsForm.title}
        </Text>
        <RenderHtml
          contentWidth={width}
          source={{ html: newsForm.content }}
          baseStyle={{
            color: isDark ? '#EFEFEF' : '#3A3A3A',
            fontSize: 17,
            fontWeight: 400,
            lineHeight: 23,
          }}
          tagsStyles={{
            a: {
              color: '#DA3986',
              textDecorationLine: 'underline',
            },
          }}
          // renderersProps={{
          //   a: {
          //     onPress: (event, href) => {
          //       Linking.openURL(href).catch((err) =>
          //         console.error('Failed to open URL:', err)
          //       )
          //     },
          //   },
          // }}
        />
      </View>

      <CommentSheet ref={commentSheetRef} />
    </View>
  )
}

export default FeaturedNews
