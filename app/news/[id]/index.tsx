import 'react-native-gesture-handler'
import 'react-native-reanimated'
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native'
import RenderHtml from 'react-native-render-html'
import NewsStore from '@/store/news/News'
import { useEffect, useRef } from 'react'
import { useLocalSearchParams, usePathname } from 'expo-router'
import NewsStat from '@/components/News/NewsStat'
import { Calendar, User } from 'lucide-react-native'
import { formatDate } from '@/lib/helpers'
import { CommentSheet, CommentSheetRef } from '@/components/Sheets/CommentSheet'
import CommentStore from '@/store/post/Comment'
import { PostEmpty } from '@/store/post/Post'
import { AuthStore } from '@/store/AuthStore'
import { upsert } from '@/lib/localStorage/db'
import CommentSheetInput from '@/components/Sheets/CommentSheetInput'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const FeaturedNews: React.FC = () => {
  const newsForm = NewsStore((state) => state.newsForm)
  const newsType = NewsStore((state) => state.newsType)
  const getANews = NewsStore((state) => state.getANews)
  const updateNews = NewsStore((state) => state.updateNews)
  const { mainPost } = CommentStore()
  const { width } = useWindowDimensions()
  const { id } = useLocalSearchParams()
  const { user } = AuthStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const color = isDark ? '#BABABA' : '#6E6E6E'
  const commentSheetRef = useRef<CommentSheetRef>(null)
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  // const [keyboardVisible, setKeyboardVisible] = useState(false)
  // const [keyboardHeight, setKeyboardHeight] = useState(0)

  // useEffect(() => {
  //   const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
  //     setKeyboardVisible(true)
  //     setKeyboardHeight(e.endCoordinates.height)
  //   })
  //   const hideListener = Keyboard.addListener('keyboardDidHide', () => {
  //     setKeyboardVisible(false)
  //     setKeyboardHeight(0)
  //   })

  //   return () => {
  //     showListener.remove()
  //     hideListener.remove()
  //   }
  // }, [])

  useEffect(() => {
    const updateNewsViews = async () => {
      updateNews(`/news/views`, {
        id,
        userId: user?._id,
      })

      await upsert(newsType, newsForm)
    }
    if (pathname === `/news/${id}` && !newsForm.viewed) {
      updateNewsViews()
    }
  }, [pathname])

  useEffect(() => {
    if (!newsForm._id && pathname === `/news/${id}`) {
      getANews(`/news/${id}`)
    }
  }, [newsForm._id, pathname])

  useEffect(() => {
    if (!mainPost._id && pathname === `/news/${id}`) {
      CommentStore.setState({ mainPost: { ...PostEmpty, _id: String(id) } })
    }
  }, [mainPost._id, pathname])

  return (
    <View className="flex-1 bg-secondary dark:bg-dark-secondary">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 30 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={{ width, height: 260 }}>
              {newsForm.picture && (
                <Image
                  source={{ uri: String(newsForm.picture) }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              )}
            </View>

            <NewsStat
              newsForm={newsForm}
              onCommentPress={() => commentSheetRef.current?.open()}
            />

            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                // paddingBottom: keyboardVisible ? 20 : 80,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="py-2 px-3 gap-4 flex-row items-center mb-3">
                <TouchableOpacity>
                  <View className="flex gap-1 flex-row items-center">
                    <User size={18} color={color} />
                    <Text className="text">{newsForm.author}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity>
                  <View className="flex gap-1 flex-row items-center">
                    <Calendar size={16} color={color} />
                    <Text className="text">
                      {formatDate(String(newsForm.publishedAt))}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={1}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                className="px-4 pb-3"
              >
                <Text className="text-custom underline text-xl mb-1">
                  {newsForm.title}
                </Text>
                <RenderHtml
                  contentWidth={width}
                  source={{ html: newsForm.content || '' }}
                  baseStyle={{
                    color: isDark ? '#EFEFEF' : '#3A3A3A',
                    fontSize: 16,
                    fontWeight: '400',
                    lineHeight: 23,
                    marginBottom: insets.bottom + 60,
                  }}
                  tagsStyles={{
                    a: { color: '#DA3986', textDecorationLine: 'underline' },
                  }}
                />
              </TouchableOpacity>
            </ScrollView>

            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: isDark ? '#1C1E21' : '#FFFFFF',
                paddingBottom: insets.bottom,
                paddingTop: 12,
                paddingHorizontal: 12,
                borderTopWidth: 1,
                borderTopColor: isDark ? '#333' : '#EEE',
                zIndex: 100,
              }}
            >
              <CommentSheetInput />
            </View>

            <CommentSheet ref={commentSheetRef} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  )
}

export default FeaturedNews
