import {
  formatDateToDDMMYY,
  formatTimeTo12Hour,
  truncateStringNormal,
} from '@/lib/helpers'
import ExamStore from '@/store/exam/Exam'
import UserExamStore from '@/store/exam/UserExam'
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native'

interface QuestionTestHeadProps {
  isLastResults: boolean
  toggleDisplayResult: () => void
}

const QuestionTestHead: React.FC<QuestionTestHeadProps> = ({
  isLastResults,
  toggleDisplayResult,
}) => {
  const { examForm } = ExamStore()
  const { userExamForm } = UserExamStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  return (
    <View
      className={`items-center pb-1 relative border-b border-b-border dark:border-b-dark-border ${
        userExamForm && userExamForm?.attempts > 0 ? 'mb-10' : 'mb-5'
      }`}
    >
      <Text className="text-secondary dark:text-dark-secondary text-center text-lg mb-2">
        {examForm.title}
      </Text>
      {examForm.subtitle && (
        <Text className="text-primary mb-2 dark:text-dark-primary">
          {examForm.subtitle}
        </Text>
      )}
      {examForm.instruction && (
        <Text className="mb-2 text-primary dark:text-dark-primaryLight">
          {examForm.instruction}
        </Text>
      )}

      <View className="flex-row w-full items-center mt-2 justify-evenly flex-wrap">
        <View className="flex-row items-center">
          <MaterialIcons
            name="hourglass-empty"
            size={16}
            color={isDark ? '#848484' : '#6E6E6E'}
          />
          <Text className="text-primary dark:text-dark-primaryLight ">
            {examForm.duration}min
          </Text>
        </View>

        {examForm.type && (
          <View className="flex-row items-center">
            <Feather
              name="file-text"
              size={16}
              color={isDark ? '#848484' : '#6E6E6E'}
              className="mr-[2px]"
            />
            <Text className="text-primary dark:text-dark-primaryLight">
              {truncateStringNormal(examForm.type, 3)}
            </Text>
          </View>
        )}

        <View className="flex-row items-center">
          <Feather
            name="clock"
            color={isDark ? '#848484' : '#6E6E6E'}
            size={16}
            className="mr-[2px]"
          />
          <Text className="text-primary dark:text-dark-primaryLight ">
            {formatTimeTo12Hour(examForm.publishedAt)}
          </Text>
        </View>

        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="calendar-check"
            size={16}
            className="mr-[2px]"
            color={isDark ? '#848484' : '#6E6E6E'}
          />
          <Text className="text-primary dark:text-dark-primaryLight ">
            {formatDateToDDMMYY(examForm.publishedAt)}
          </Text>
        </View>
      </View>

      {userExamForm && userExamForm?.attempts > 0 && (
        <View className="flex-row justify-between w-full absolute left-0 bottom-[-30px]">
          <Text className="text-primary dark:text-dark-primary">
            {userExamForm?.attempts} Attempts
          </Text>
          <TouchableOpacity
            onPress={toggleDisplayResult}
            className="px-4 py-1 rounded-[25px] bg-custom items-center justify-center ml-auto"
          >
            <Text className="text-white">
              {isLastResults ? 'Hide Result' : 'Show Result'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default QuestionTestHead
