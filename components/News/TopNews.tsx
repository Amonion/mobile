import { FlatList, View, Text, Image, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import CommentStore from '@/store/post/Comment'
import NewsStore, { News } from '@/store/news/News'
import { LinearGradient } from 'expo-linear-gradient'
import { PostEmpty } from '@/store/post/Post'
import { router } from 'expo-router'
import { formatRelativeDate } from '@/lib/helpers'

const TopNews: React.FC = () => {
  const { news } = NewsStore()
  const { getComments } = CommentStore()
  const [topNews, setTopNews] = useState<News[]>([])

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

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    const todaysNews = news
      .filter((item) => {
        const publishedDate = new Date(String(item.publishedAt))
          .toISOString()
          .split('T')[0]
        return publishedDate === today
      })
      .sort((a, b) => b.scores - a.scores)

    setTopNews(todaysNews)
  }, [news])

  return (
    <>
      <View className="flex-1 py-4">
        <View className="px-3 mb-2">
          <Text className="text-xl text-secondary dark:text-dark-secondary">
            {`Today's Top News`}
          </Text>
        </View>

        <FlatList
          data={topNews}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => (
            <View className="rounded-[15px] overflow-hidden bg-primary dark:bg-dark-primary h-[250px] w-[200px]">
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
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 0,
                  padding: 10,
                }}
                onPress={() => move(item._id)}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 4,
                    lineHeight: 20,
                  }}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          contentContainerStyle={{
            paddingHorizontal: 10,
          }}
        />
      </View>
    </>
  )
}
export default TopNews
