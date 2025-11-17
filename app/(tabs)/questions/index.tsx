import QuestionCard from '@/components/Question/QuestionCard'
import QuestionHeader from '@/components/Question/QuestionHeader'
import ExamStore from '@/store/exam/Exam'
import React from 'react'
import { View, FlatList, Text, RefreshControl } from 'react-native'

const Questions = () => {
  const { loading, hasMore, exams, page_size, getExams, getMoreSavedExams } =
    ExamStore()

  const fetchMoreExams = () => {
    if (loading || !hasMore) return
    getMoreSavedExams()
  }

  const refreshExams = () => {
    if (loading) return
    getExams(
      `/competitions/exams/?page_size=${page_size}&page=1&ordering=-createdAt`
    )
  }

  return (
    <View className="flex-1">
      <QuestionHeader />
      <View className="flex-1">
        <FlatList
          data={exams}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <QuestionCard item={item} />}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.2}
          onEndReached={fetchMoreExams}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshExams}
              colors={['#DA3986']}
              tintColor={'#DA3986'}
            />
          }
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          ListEmptyComponent={() => (
            <Text className="text-center text-xl flex-1 text-primary dark:text-dark-primary">
              No Questions available.
            </Text>
          )}
        />
      </View>
    </View>
  )
}

export default Questions
