import { useState, useEffect, useRef } from 'react'
import { useLocalSearchParams } from 'expo-router'
import {
  View,
  ScrollView,
  useColorScheme,
  useWindowDimensions,
  AppState,
} from 'react-native'
import { customRequest } from '@/lib/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import ExamStore from '@/store/exam/Exam'
import ObjectiveStore, { IOption, Objective } from '@/store/exam/Objective'
import { BioUserState } from '@/store/user/BioUserState'
import UserExamStore, { UserExam } from '@/store/exam/UserExam'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import Pagination from '@/components/Question/Pagination'
import CountdownTimer from '@/components/Question/CountDownTimer'
import ExamResult from '@/components/Question/ExamResult'
import { StatusBar } from 'expo-status-bar'
import FirstTimeMessage from '@/components/Question/FirstTimeMessage'
import QuestionTestHead from '@/components/Question/QuestionTestHead'
import QuestionsList from '@/components/Question/QuestionList'
import Spinner from '@/components/Response/Spinner'
import MinorAppBar from '@/components/Navigation/MinorAppBar'

interface Test {
  bioUserState: BioUserState
  exam: UserExam
  attempt: number
  results: Objective[]
}

const ExamStart = () => {
  const url = '/competitions/leagues/objectives/'
  const { getExam, setIsStarting, examForm } = ExamStore()
  const { userExamForm, setUserExamForm } = UserExamStore()
  const { user, bioUser, bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const { count, objectiveResults, getObjectives, reshuffleResults } =
    ObjectiveStore()
  const { setAlert } = AlartStore()
  const { id } = useLocalSearchParams()
  const [answeredQuestions, setAnsweredQuestions] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isInteracting, setIsInteracting] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [isResultDisplayed, displayResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isLastResults, showLastResults] = useState(false)
  // const [currentPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1)
  const [page_size, setPageSize] = useState<number | null>()
  const [sort] = useState('createdAt')
  const [questions, setQuestion] = useState<Objective[]>([])
  const [lastResults, setLastResults] = useState<Objective[]>([])
  const optionsLabel = ['A', 'B', 'C', 'D', 'E', 'F']
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const { width } = useWindowDimensions()
  const scrollRef = useRef<ScrollView>(null)
  const navigation = useNavigation()
  const appState = useRef(AppState.currentState)

  const nextSection = async (size: number) => {
    getObjectives(
      `${url}?paperId=${examForm._id}&ordering=${sort}&page=${currentPage}&page_size=${size}`
    )

    const response = await customRequest({
      url: `/user-competitions/exams/?bioUserId=${user?.bioUserId}&paperId=${id}&page=${currentPage}&page_size=${size}`,
    })
    const res = response?.data as unknown as Test
    if (res.exam) {
      setUserExamForm(res.exam)
      setLastResults(res.results)
    }
  }

  const endExam = async () => {
    await AsyncStorage.removeItem('questions1')
    await AsyncStorage.removeItem('started')
    reshuffleResults()
    setIsActive(false)
    setIsInteracting(true)
  }

  const setDisplayResult = () => {
    if (!isResultDisplayed) {
      scrollToTop()
    }
    displayResult((e) => !e)
  }

  const toggleDisplayResult = () => {
    if (isActive) {
      setMessage(
        'Complete or stop the current test to see your last result.',
        false
      )
    } else {
      showLastResults((e) => !e)
    }
  }

  const startCountdown = async () => {
    if (
      bioUserState &&
      bioUserState?.examAttempts >= 5 &&
      !bioUserState?.isVerified
    ) {
      setMessage(
        'You have reached your limit of 5 attempts, please verify your account at verification menu to continue with unlimited attempts.',
        false
      )
      return
    }
    displayResult(false)
    showLastResults(false)
    await AsyncStorage.removeItem('questions')
    await AsyncStorage.setItem('started', JSON.stringify(new Date().getTime()))
    setDuration(examForm.duration * 60)
    setIsActive(true)
    setIsInteracting(true)
  }

  const submitData = async () => {
    if (bioUserState && !bioUserState.isVerified) {
      setMessage('Please verify your account to continue', false)
      return
    }
    const savedItems = await AsyncStorage.getItem('questions1')
    const started = await AsyncStorage.getItem('started')
    const startTime = started ? JSON.parse(started) : undefined
    const savedQuestions = savedItems ? JSON.parse(savedItems) : []

    if (savedQuestions && savedQuestions.length > 0 && bioUser) {
      const form = new FormData()
      form.append('bioUserUsername', bioUser.bioUserUsername)
      form.append('bioUserId', bioUser._id)
      form.append('bioUserPicture', bioUser.bioUserPicture)
      form.append('bioUserDisplayName', bioUser.bioUserDisplayName)
      form.append('instruction', examForm.instruction)
      form.append('started', startTime)
      form.append('ended', String(new Date().getTime()))
      form.append('paperId', String(id))
      form.append('questions', JSON.stringify(savedQuestions))

      try {
        setLoading(true)
        const response = await customRequest(
          {
            url: `/user-competitions/exams?bioUserId=${bioUser?._id}&paperId=${id}&page=${currentPage}&page_size=${page_size}`,
            method: 'POST',
            data: form,
          },
          true
        )

        const res = response?.data as unknown as Test
        if (res.exam) {
          scrollToTop()
          showLastResults(true)
          endExam()
          setUserExamForm(res.exam)
          setLastResults(res.results)
          setMessage(
            'Congratulations! Your test was scored successfully, please click the table icon at your bottom left to see your progress.',
            true
          )
          AuthStore.getState().setBioUserState(res.bioUserState)
          ExamStore.setState({
            attempt: res.attempt,
          })
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    } else {
      setMessage(
        'Sorry, test cannot be submitted as you have not made any attempt.',
        false
      )
    }
  }

  const selectAnswer = async (item: IOption, questionId: string) => {
    if (!isActive) {
      setMessage('Please click the play button to begin your test.', false)
      return
    }

    const local = await AsyncStorage.getItem('questions1')
    let storedQuestions1 = local ? JSON.parse(local) : []
    setQuestion((prevQuestions) => {
      const updatedQuestions = prevQuestions.map((question) =>
        question._id === questionId
          ? {
              ...question,
              isClicked: true,
              options: question.options.map((option) => ({
                ...option,
                isClicked: option.index === item.index,
              })),
            }
          : question
      )

      const updatedQuestions1 = storedQuestions1.map((question: Objective) =>
        question._id === questionId
          ? {
              ...question,
              isClicked: true,
              options: question.options.map((option) => ({
                ...option,
                isClicked: option.index === item.index,
              })),
            }
          : question
      )

      const clickedQuestions1 = updatedQuestions1.filter(
        (q: Objective) => q.isClicked
      )

      for (let i = 0; i < clickedQuestions1.length; i++) {
        const el = clickedQuestions1[i]
        const stored = storedQuestions1.find((q: Objective) => q._id === el._id)

        if (stored) {
          const updatedStoredQuestions1 = storedQuestions1.map(
            (question: Objective) =>
              question._id === stored._id
                ? {
                    ...question,
                    isClicked: true,
                    options: question.options.map((option) => ({
                      ...option,
                      isClicked: option.index === item.index,
                    })),
                  }
                : question
          )
          storedQuestions1 = updatedStoredQuestions1
        } else {
          storedQuestions1.push(el)
        }
      }
      setAnsweredQuestions(clickedQuestions1.length)
      AsyncStorage.setItem('questions1', JSON.stringify(updatedQuestions1))
      return updatedQuestions
    })
  }

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: 0,
        animated: true,
      })
    }
  }

  useEffect(() => {
    setIsStarting(false)
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/active/) &&
        nextAppState === 'background' &&
        isActive
      ) {
        submitData()
      }

      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [isActive])

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isActive) {
        e.preventDefault()

        setAlert(
          'Discard Exam?',
          'You have active test you have not submitted, if you leave it will be sent and recorded as part of your attempts.',
          true,
          submitData
        )
      }
    })

    return unsubscribe
  }, [navigation, isActive])

  useEffect(() => {
    if (examForm.questionsPerPage > 0 && user) {
      setPageSize(examForm.questionsPerPage)
      setDuration(examForm.duration * 60)
      setTimeLeft(examForm.duration * 60)
      // nextSection(examForm.questionsPerPage)
      // setFromForm(false)
    } else {
      getExam(`/competitions/exams/${id}`)
    }
  }, [examForm._id, user])

  useEffect(() => {
    if (page_size) {
      nextSection(Number(page_size))
      scrollToTop()
    }
  }, [currentPage, page_size])

  useEffect(() => {
    const prepareQuestion = async () => {
      const items = ObjectiveStore.getState().objectiveResults
      const local = await AsyncStorage.getItem('questions1')
      const localObjArr = local ? JSON.parse(local) : []
      const existingIds = new Set(
        localObjArr.map((item: Objective) => item._id)
      )

      const newItems = objectiveResults.filter(
        (item) => !existingIds.has(item._id)
      )
      const updatedLocalObjArr = [...localObjArr, ...newItems]
      await AsyncStorage.setItem(
        'questions1',
        JSON.stringify(updatedLocalObjArr)
      )

      setQuestion([])

      if (updatedLocalObjArr && updatedLocalObjArr.length > 0) {
        const updatedQuestions = items.map((question) => {
          const savedQuestion = updatedLocalObjArr.find(
            (sq: Objective) => sq._id === question._id
          )
          if (savedQuestion) {
            return {
              ...question,
              isClicked: savedQuestion.isClicked,
              options: question.options.map((option) => {
                const savedOption = savedQuestion.options.find(
                  (so: IOption) => so.index === option.index
                )
                return {
                  ...option,
                  isClicked: savedOption ? savedOption.isClicked : false,
                }
              }),
            }
          }
          return question
        })
        const clickedQuestions = updatedLocalObjArr.filter(
          (question) => question.isClicked
        )
        setAnsweredQuestions(clickedQuestions.length)
        setQuestion([...updatedQuestions])
      } else {
        for (let i = 0; i < items.length; i++) {
          const el = items[i]
          setQuestion((prevQuestions) => [...prevQuestions, el])
        }
        setAnsweredQuestions(0)
      }
    }
    prepareQuestion()
  }, [objectiveResults])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    if (isActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      setIsActive(false)
      submitData()
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isActive, timeLeft])

  return (
    <>
      <StatusBar
        backgroundColor={isDark ? '#1C1E21' : '#FFFFFF'}
        style="auto"
      />

      <MinorAppBar />

      {bioUserState?.examAttempts === 0 && !isActive ? (
        <FirstTimeMessage />
      ) : (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-primary dark:bg-dark-primary p-3"
        >
          <QuestionTestHead
            isLastResults={isLastResults}
            toggleDisplayResult={toggleDisplayResult}
          />

          {userExamForm && isLastResults && isResultDisplayed && (
            <ExamResult
              exam={userExamForm}
              setDisplayResult={setDisplayResult}
            />
          )}

          {objectiveResults.length === 0 ? (
            <View className="p-5 flex-1 items-center justify-center">
              <Spinner size={40} />
            </View>
          ) : (
            <>
              {examForm.questionsPerPage > 0 && (
                <QuestionsList
                  data={isLastResults ? lastResults : questions}
                  isLastResults={isLastResults}
                  pageSize={examForm.questionsPerPage}
                  currentPage={currentPage}
                  width={width}
                  isDark={isDark}
                  optionsLabel={optionsLabel}
                  selectAnswer={selectAnswer}
                />
              )}
              <View className="mb-[100px]">
                {page_size && (
                  <Pagination
                    currentPage={currentPage}
                    totalItems={count}
                    pageSize={page_size}
                    onPageChange={setCurrentPage}
                  />
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}
      {examForm.duration > 0 && bioUserState && (
        <CountdownTimer
          durationInSeconds={duration}
          isActive={isActive}
          startCountdown={startCountdown}
          isLastResults={isLastResults}
          setDisplayResult={setDisplayResult}
          isInteracting={isInteracting}
          isLoading={isLoading}
          submit={submitData}
          total={count}
          answered={answeredQuestions}
          timeLeft={timeLeft}
          totalAttempts={bioUserState.examAttempts}
        />
      )}
    </>
  )
}

export default ExamStart
