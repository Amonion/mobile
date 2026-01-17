import ExamTextAppBar from '@/components/Question/ExamTestAppBar'
import { AuthStore } from '@/store/AuthStore'
import ExamStore from '@/store/exam/Exam'
import UserExamStore from '@/store/exam/UserExam'
import { Slot, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { View, useColorScheme } from 'react-native'

export default function UserTestLayout() {
  const { id } = useLocalSearchParams()
  const { getExam } = ExamStore()
  const { getUserExam } = UserExamStore()
  const { bioUser, bioUserState } = AuthStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false

  useEffect(() => {
    getExam(`/competitions/exams/${id}`)
  }, [id])

  useEffect(() => {
    if (bioUser?._id) {
      getUserExam(
        `/user-competitions/exams/?bioUserId=${bioUser?._id}&paperId=${id}`
      )
    }
  }, [id, bioUser?._id])

  useEffect(() => {
    if (bioUserState?.examAttempts === 0) {
      ExamStore.setState({ isFirstTime: true })
    }
  }, [bioUserState])

  return (
    <View className="relative flex-1">
      <StatusBar
        backgroundColor={isDark ? '#1C1E21' : '#FFFFFF'}
        style="auto"
      />

      <ExamTextAppBar />
      <Slot />
    </View>
  )
}
