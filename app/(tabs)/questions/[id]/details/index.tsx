import { formatDate } from '@/lib/helpers'
import ExamStore from '@/store/exam/Exam'
import { View, Text } from 'react-native'

export default function ExamDetails() {
  const { examForm } = ExamStore()

  return (
    <>
      <View className="bg-primary dark:bg-dark-primary p-3">
        <View className="flex-1 mb-3">
          <Text className="text-lg text-secondary dark:text-dark-secondary font-pmedium">
            Name:
          </Text>
          <View className="bg-secondary dark:bg-dark-secondary rounded-[10px]">
            <Text className="text-primary  p-2 dark:text-dark-primary font-pmedium">
              {examForm.name}
            </Text>
          </View>
        </View>
        <View className="flex-1 mb-3">
          <Text className="text-lg text-secondary dark:text-dark-secondary font-pmedium">
            Title:
          </Text>
          <View className="bg-secondary dark:bg-dark-secondary rounded-[10px]">
            <Text className="text-primary  p-2 dark:text-dark-primary font-pmedium">
              {examForm.title}
            </Text>
          </View>
        </View>
        <View className="flex-1 mb-3">
          <Text className="text-lg text-secondary dark:text-dark-secondary font-pmedium">
            Subtitle:
          </Text>
          <View className="bg-secondary dark:bg-dark-secondary rounded-[10px]">
            <Text className="text-primary  p-2 dark:text-dark-primary font-pmedium">
              {examForm.subtitle}
            </Text>
          </View>
        </View>
        <View className="flex-1 mb-3">
          <Text className="text-lg text-secondary dark:text-dark-secondary font-pmedium">
            Subject:
          </Text>
          <View className="bg-secondary dark:bg-dark-secondary rounded-[10px]">
            <Text className="text-primary  p-2 dark:text-dark-primary font-pmedium">
              {examForm.subjects}
            </Text>
          </View>
        </View>
        <View className="flex-1 mb-3">
          <Text className="text-lg text-secondary dark:text-dark-secondary font-pmedium">
            Type:
          </Text>
          <View className="bg-secondary dark:bg-dark-secondary rounded-[10px]">
            <Text className="text-primary  p-2 dark:text-dark-primary font-pmedium">
              {examForm.type}
            </Text>
          </View>
        </View>
        <View className="flex-1 mb-3">
          <Text className="text-lg text-secondary dark:text-dark-secondary font-pmedium">
            Instruction:
          </Text>
          <View className="bg-secondary dark:bg-dark-secondary rounded-[10px]">
            <Text className="text-primary  p-2 dark:text-dark-primary font-pmedium">
              {examForm.instruction}
            </Text>
          </View>
        </View>
        <View className="flex-1 mb-3">
          <Text className="text-lg text-secondary dark:text-dark-secondary font-pmedium">
            Participants:
          </Text>
          <View className="bg-secondary dark:bg-dark-secondary rounded-[10px]">
            <Text className="text-primary  p-2 dark:text-dark-primary font-pmedium">
              {examForm.participants}
            </Text>
          </View>
        </View>
        <View className="flex-1 mb-3">
          <Text className="text-lg text-secondary dark:text-dark-secondary font-pmedium">
            Duration:
          </Text>
          <View className="bg-secondary dark:bg-dark-secondary rounded-[10px]">
            <Text className="text-primary  p-2 dark:text-dark-primary font-pmedium">
              {examForm.duration} Mins
            </Text>
          </View>
        </View>
        <View className="flex-1 mb-3">
          <Text className="text-lg text-secondary dark:text-dark-secondary font-pmedium">
            Questions:
          </Text>
          <View className="bg-secondary dark:bg-dark-secondary rounded-[10px]">
            <Text className="text-primary  p-2 dark:text-dark-primary font-pmedium">
              {examForm.questions}
            </Text>
          </View>
        </View>
        <View className="flex-1 mb-3">
          <Text className="text-lg text-secondary dark:text-dark-secondary font-pmedium">
            Questions Per Page:
          </Text>
          <View className="bg-secondary dark:bg-dark-secondary rounded-[10px]">
            <Text className="text-primary  p-2 dark:text-dark-primary font-pmedium">
              {examForm.questionsPerPage}
            </Text>
          </View>
        </View>
        <View className="flex-1 mb-3">
          <Text className="text-lg text-secondary dark:text-dark-secondary font-pmedium">
            Options Per Questions:
          </Text>
          <View className="bg-secondary dark:bg-dark-secondary rounded-[10px]">
            <Text className="text-primary  p-2 dark:text-dark-primary font-pmedium">
              {examForm.optionsPerQuestion}
            </Text>
          </View>
        </View>
        <View className="flex-1 mb-3">
          <Text className="text-lg text-secondary dark:text-dark-secondary font-pmedium">
            Published At:
          </Text>
          <View className="bg-secondary dark:bg-dark-secondary rounded-[10px]">
            <Text className="text-primary  p-2 dark:text-dark-primary font-pmedium">
              {formatDate(String(examForm.publishedAt))}
            </Text>
          </View>
        </View>
      </View>
    </>
  )
}
