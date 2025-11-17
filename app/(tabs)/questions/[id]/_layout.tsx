import FullMedia from '@/components/FullMedia'
import Spinner from '@/components/Response/Spinner'
import { formatCount } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import ExamStore, { Exam } from '@/store/exam/Exam'
import ObjectiveStore from '@/store/exam/Objective'
import { MessageStore } from '@/store/notification/Message'
import { router, Slot, useLocalSearchParams, usePathname } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'

export default function ExamLayout() {
  const { getExam, setIsStarting, isStarting, examForm, loading } = ExamStore()
  const { getObjectives } = ObjectiveStore()
  const { id } = useLocalSearchParams()
  const pathname = usePathname()
  const [detailsLength, setDetailsLength] = useState(0)
  const { bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [imageSource, setImageSource] = useState('')

  useEffect(() => {
    if (!examForm._id) {
      getExam(`/competitions/exams/${id}`)
    } else {
      getObjectives(
        `/competitions/leagues/objectives/?paperId=${examForm._id}&ordering=createdAt&page=1&page_size=${examForm.questionsPerPage}`
      )
    }
  }, [id])

  useEffect(() => {
    const count = countFilledFields(examForm)
    setDetailsLength(count)
    return () => setIsStarting(false)
  }, [examForm])

  const startPaper = () => {
    if (examForm.questions === 0) {
      setMessage('There is 0 questions in this paper, please try again.', false)
      return
    }
    if (
      bioUserState &&
      bioUserState.examAttempts >= 5 &&
      !bioUserState.isVerified
    ) {
      setMessage(
        'You have reached your limit of 5 attempts, please verify your account at verification menu to continue with unlimited attempts.',
        false
      )
      return
    } else {
      setIsStarting(true)
      router.push(`/test/${id}`)
    }
  }

  const countFilledFields = (data: Exam) => {
    return Object.entries(data).filter(([key, value]) => {
      if (key === '_id') return false
      if (typeof value === 'boolean') return false
      if (Array.isArray(value)) return value.length > 0
      return value !== '' && value !== 0 && value !== null
    }).length
  }

  const showFullScreen = (image: string) => {
    if (image) {
      setImageSource(image)
      setIsFullScreen(!isFullScreen)
    }
  }

  const currentTab = pathname.endsWith('/comments')
    ? 'comments'
    : pathname.endsWith('/details')
    ? 'details'
    : 'users'

  const navigateTo = (tab: 'users' | 'comments' | 'details') => {
    const pathMap = {
      users: `/questions/${id}`,
      comments: `/questions/${id}/comments`,
      details: `/questions/${id}/details`,
    }
    if (pathname !== pathMap[tab]) {
      router.push(pathMap[tab])
    }
  }
  return (
    <View className="relative flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-secondary dark:bg-dark-secondary relative"
      >
        <TouchableOpacity
          onPress={() => showFullScreen(String(examForm?.picture))}
          className="w-full h-[25vh] relative overflow-hidden"
        >
          <Image
            source={
              examForm?.picture
                ? { uri: String(examForm.picture) }
                : require('@/assets/images/class.png')
            }
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
              resizeMode: 'cover',
            }}
          />
        </TouchableOpacity>
        <View className="w-full pt-2 px-3 bg-primary dark:bg-dark-primary border-b border-b-border dark:border-b-dark-border mb-1">
          <View className="w-full mb-2">
            <View className="flex-row mb-3">
              <TouchableOpacity
                onPress={() => showFullScreen(String(examForm?.logo))}
                className="h-[60px] mr-3 items-center mt-[-40px] justify-center w-[60px] bg-primary dark:bg-dark-primary rounded-full overflow-hidden p-[2px]"
              >
                <Image
                  source={
                    examForm?.logo
                      ? { uri: String(examForm.logo) }
                      : require('@/assets/images/icon.png')
                  }
                  style={{
                    height: '100%',
                    width: '100%',
                    resizeMode: 'cover',
                  }}
                  className="rounded-full border-[2px] border-gray-400 dark:border-white"
                />
              </TouchableOpacity>
              {!loading && (
                <View className="flex-row flex-1 items-center">
                  <Text className="text-custom text-lg">@{examForm?.name}</Text>
                  <TouchableOpacity
                    onPress={startPaper}
                    className="px-4 py-1 rounded-[25px] flex-row bg-custom items-center justify-center ml-auto"
                  >
                    {isStarting && <Spinner size={20} />}
                    <Text className="text-sm text-white">Start</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {loading ? (
              <View className="items-center flex-1">
                <ActivityIndicator className="" size={24} color="#DA3986" />
              </View>
            ) : (
              <Text className=" text-primary dark:text-dark-primary">
                {examForm?.title}
              </Text>
            )}
          </View>
          {!loading && (
            <View className="flex-row justify-around mt-3">
              <TabButton
                label="Users"
                count={formatCount(examForm?.participants)}
                isActive={currentTab === 'users'}
                onPress={() => navigateTo('users')}
              />
              <TabButton
                label="Comments"
                count={formatCount(examForm.comments)}
                isActive={currentTab === 'comments'}
                onPress={() => navigateTo('comments')}
              />
              <TabButton
                label="Details"
                count={detailsLength > 4 ? detailsLength - 3 : 0}
                isActive={currentTab === 'details'}
                onPress={() => navigateTo('details')}
              />
            </View>
          )}
        </View>
        <FullMedia
          imageSource={imageSource}
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
        />
        <Slot />
      </ScrollView>
    </View>
  )
}

function TabButton({
  label,
  count,
  isActive,
  onPress,
}: {
  label: string
  count: string | number
  isActive: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      className={`items-center py-1 flex-1`}
    >
      <Text
        className={`font-semibold mb-[1px] ${
          isActive ? 'text-custom' : 'text-primary dark:text-dark-primary'
        }`}
      >
        {count}
      </Text>
      <Text
        className={
          isActive ? 'text-custom' : 'text-primary dark:text-dark-primary'
        }
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}
