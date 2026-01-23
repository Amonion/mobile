import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { formatDate, formatTimeTo12Hour } from '@/lib/helpers'
import { UserExam } from '@/store/exam/UserExam'

interface ExamResultProps {
  setDisplayResult: () => void
  exam: UserExam
}

const ExamResult: React.FC<ExamResultProps> = ({ setDisplayResult, exam }) => {
  const rows = [
    ['1', 'Date', formatDate(new Date(exam.started))],
    ['2', 'Started', formatTimeTo12Hour(exam.started)],
    ['3', 'Ended', formatTimeTo12Hour(exam.ended)],
    [
      '4',
      'Duration',
      `${Math.round((exam.ended - exam.started) / 60000)} mins`,
    ],
    ['5', 'Questions', exam.questions.toString()],
    ['6', 'Answered', exam.attemptedQuestions.toString()],
    ['7', 'Passed', exam.totalCorrectAnswer.toString()],
    ['8', 'Speed', `${exam.rate.toFixed(3)} quests/sec`],
    ['9', 'Accuracy', `${(exam.accuracy * 100).toFixed(2)} %`],
    ['10', 'Metric', `${(exam.accuracy * exam.rate).toFixed(5)}`],
  ]

  return (
    <ScrollView
      contentContainerStyle={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
      className="absolute flex-1 h-full z-50 inset-0 bg-black/50"
    >
      <View className="overflow-hidden bg-primary dark:bg-dark-primary border border-border dark:border-dark-border mx-4 rounded-lg">
        <View className="w-full flex-row justify-between p-3 bg-secondary dark:bg-dark-secondary">
          <Text className="w-10 text-secondary dark:text-dark-secondary text-lg">
            SN
          </Text>
          <Text className="flex-1 text-secondary dark:text-dark-secondary text-lg">
            Property
          </Text>
          <Text className="flex-1 text-secondary dark:text-dark-secondary text-lg">
            Value
          </Text>
        </View>

        {rows.map(([sn, prop, val]) => (
          <View
            key={sn}
            className="flex-row border-b border-b-border dark:border-b-dark-border px-3 py-3"
          >
            <Text className="w-10 text-left text-primary dark:text-dark-primary">
              {sn}
            </Text>
            <Text className="flex-1 text-left text-primary dark:text-dark-primary">
              {prop}
            </Text>
            <Text className="flex-1 text-wrap text-left text-primary dark:text-dark-primary">
              {val}
            </Text>
          </View>
        ))}

        <TouchableOpacity
          onPress={setDisplayResult}
          className="mt-4 bg-custom py-3"
        >
          <Text className="text-center text-white font-semibold">
            Close Table
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default ExamResult
