// import QuestionCard from '@/components/Question/QuestionCard'
// import QuestionHeader from '@/components/Question/QuestionHeader'
// import ExamStore from '@/store/exam/Exam'
// import { useFocusEffect } from '@react-navigation/native'
// import React, { useCallback } from 'react'
// import { View, FlatList, Text, RefreshControl } from 'react-native'

// const QuestionSearch = () => {
//   const {
//     loading,
//     hasMore,
//     exams,
//     page_size,
//     currentPage,
//     getExams,
//     getMoreExams,
//   } = ExamStore()
//   const listRef = React.useRef<FlatList>(null)

//   useFocusEffect(
//     useCallback(() => {
//       let timeout: NodeJS.Timeout

//       const tryScroll = () => {
//         const { clickedIndex } = ExamStore.getState()
//         if (
//           listRef.current &&
//           clickedIndex !== null &&
//           clickedIndex >= 0 &&
//           exams.length > clickedIndex
//         ) {
//           listRef.current.scrollToIndex({
//             index: clickedIndex,
//             animated: false,
//             viewPosition: 0,
//           })
//           ExamStore.setState({ clickedIndex: null })
//         } else if (clickedIndex !== null) {
//           timeout = setTimeout(tryScroll, 50)
//         }
//       }

//       timeout = setTimeout(tryScroll, 100)

//       return () => clearTimeout(timeout)
//     }, [exams])
//   )

//   const fetchMoreExams = () => {
//     if (loading || !hasMore) return
//     getMoreExams(
//       `/competitions/exams/?page_size=${page_size}&page=${currentPage}&ordering=-createdAt`
//     )
//   }

//   const refreshExams = async () => {
//     if (loading) return
//     getExams(
//       `/competitions/exams/?page_size=${page_size}&page=1&ordering=-createdAt`
//     )
//   }
//   return (
//     <View className="flex-1">
//       <QuestionHeader />
//       <View className="flex-1">
//         <FlatList
//           ref={listRef}
//           data={exams}
//           keyExtractor={(item) => item._id}
//           renderItem={({ item, index }) => (
//             <QuestionCard item={item} index={index} />
//           )}
//           showsVerticalScrollIndicator={false}
//           onEndReachedThreshold={0.2}
//           onEndReached={fetchMoreExams}
//           refreshControl={
//             <RefreshControl
//               refreshing={loading}
//               onRefresh={refreshExams}
//               colors={['#DA3986']}
//               tintColor={'#DA3986'}
//             />
//           }
//           contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
//           ListEmptyComponent={() => (
//             <Text className="text-center justify-center items-center text-xl flex-1 text-primary dark:text-dark-primary">
//               No Questions available.
//             </Text>
//           )}
//           onScrollToIndexFailed={(info) => {
//             const wait = setTimeout(() => {
//               listRef.current?.scrollToIndex({
//                 index: info.index,
//                 animated: false,
//               })
//             }, 500)
//             return () => clearTimeout(wait)
//           }}
//         />
//       </View>
//     </View>
//   )
// }

// export default QuestionSearch
import QuestionCard from '@/components/Question/QuestionCard'
import QuestionHeader from '@/components/Question/QuestionHeader'
import ExamStore from '@/store/exam/Exam'
import React from 'react'
import { View, FlatList, Text, RefreshControl } from 'react-native'

const Questions = () => {
  const {
    loading,
    hasMore,
    exams,
    page_size,
    currentPage,
    getExams,
    getMoreExams,
  } = ExamStore()

  const fetchMoreExams = () => {
    if (loading || !hasMore) return
    getMoreExams(
      `/competitions/exams/?page_size=${page_size}&page=${currentPage}&ordering=-createdAt`
    )
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
