import Pagination from '@/components/Question/Pagination'
import UserExamStore from '@/store/exam/UserExam'
import { useLocalSearchParams, usePathname } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native'

export default function ExamTable() {
  const { id } = useLocalSearchParams()
  const { getExamParticipants, userExamResults, loading, count } =
    UserExamStore()
  const pathName = usePathname()
  const [page_size] = useState(10)
  const [ordering] = useState('metric')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const find = async () => {
      if (id) {
        getExamParticipants(
          `/user-competitions/table/?paperId=${id}&ordering=-${ordering}&page_size=${page_size}&page=${currentPage}`
        )
      }
    }

    find()
  }, [id, pathName, currentPage])

  return (
    <>
      <View className="bg-primary dark:bg-dark-primary p-2">
        <View className="flex-row items-center bg-secondary dark:bg-dark-secondary">
          <Text className="min-w-12 text-secondary dark:text-dark-secondary font-pmedium  p-2">
            S/N
          </Text>
          <Text className="text-secondary  p-2 dark:text-dark-secondary font-pmedium flex-1">
            User
          </Text>
          <Text className="text-secondary min-w-16 dark:text-dark-secondary font-pmedium  p-2">
            Atts.
          </Text>
          <Text className="text-secondary w-[68px] dark:text-dark-secondary font-pmedium  p-2">
            Metric
          </Text>
        </View>

        {loading ? (
          <View className="items-center flex-1">
            <ActivityIndicator className="" size={24} color="#DA3986" />
          </View>
        ) : (
          <>
            {userExamResults.map((exam, index) => (
              <View
                key={index}
                className={`${
                  index % 2 === 1 ? 'bg-secondary dark:bg-dark-secondary' : ''
                } flex-row items-center mb-2`}
              >
                <Text className="min-w-12 text-secondary dark:text-dark-secondary font-pmedium  p-2">
                  {(Number(currentPage) - 1) * page_size + index + 1}
                </Text>
                <TouchableOpacity className="flex-row p-2 flex-1 items-center">
                  <Image
                    source={{ uri: exam.picture }}
                    className="rounded-full w-12 h-12 mr-2"
                  />
                  <Text className="text-secondary flex-1 line-clamp-2 overflow-ellipsis dark:text-dark-secondary font-pmedium">
                    {exam.username}
                  </Text>
                </TouchableOpacity>
                <Text className="text-secondary min-w-16 dark:text-dark-secondary font-pmedium  p-2">
                  {exam.attempts}
                </Text>
                <Text className="text-secondary w-[68px] dark:text-dark-secondary font-pmedium  p-2">
                  {(exam.accuracy * 100).toFixed(2)}
                </Text>
                <Text className="text-secondary w-[68px] dark:text-dark-secondary font-pmedium  p-2">
                  {exam.rate.toFixed(2)}
                </Text>
                <Text className="text-secondary w-[68px] dark:text-dark-secondary font-pmedium  p-2">
                  {exam.metric.toFixed(3)}
                </Text>
              </View>
            ))}

            <Pagination
              currentPage={currentPage}
              totalItems={count}
              pageSize={page_size}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </View>
    </>
  )
}
