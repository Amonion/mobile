import { useState, useEffect, useRef } from 'react'
import { useLocalSearchParams } from 'expo-router'
import {
  View,
  ScrollView,
  useColorScheme,
  useWindowDimensions,
} from 'react-native'
import { customRequest } from '@/lib/api'
import ExamStore from '@/store/exam/Exam'
import ObjectiveStore, { Objective } from '@/store/exam/Objective'
import { BioUserState } from '@/store/user/BioUserState'
import UserExamStore, { UserExam } from '@/store/exam/UserExam'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import Pagination from '@/components/Question/Pagination'
import CountdownTimer from '@/components/Question/CountDownTimer'
import ExamResult from '@/components/Question/ExamResult'
import FirstTimeMessage from '@/components/Question/FirstTimeMessage'
import QuestionTestHead from '@/components/Question/QuestionTestHead'
import QuestionsList from '@/components/Question/QuestionList'
import Spinner from '@/components/Response/Spinner'

interface Test {
  bioUserState: BioUserState
  exam: UserExam
  attempt: number
  results: Objective[]
}

const ExamStart = () => {
  const { examForm } = ExamStore()
  const { userExamForm, updateUserExam, createUserExam } = UserExamStore()
  const { bioUser, bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const {
    count,
    currentPage,
    answeredQuestions,
    questions,
    lastQuestions,
    getLastQuestions,
    getQuestions,
  } = ObjectiveStore()
  const duration = examForm.duration * 60
  const { setAlert } = AlartStore()
  const { id } = useLocalSearchParams()
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [isResultDisplayed, displayResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isLastResults, showLastResults] = useState(false)

  const optionsLabel = ['A', 'B', 'C', 'D', 'E', 'F']
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const { width } = useWindowDimensions()
  const scrollRef = useRef<ScrollView>(null)

  const setDisplayResult = () => {
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

  const startCountdown = () => {
    if (isActive) {
      setAlert(
        'Warning',
        'You are about to end this test without submitting it for scoring, are you sure you want to continue?',
        true,
        () => submitData()
      )
    } else if (bioUser && bioUser.bioUserUsername && !bioUser.bioUserPicture) {
      setMessage(
        'Please go to verification at the public tab and set your username and picture to begin this test.',
        false
      )
    } else if (bioUser) {
      if (userExamForm && userExamForm._id) {
        const form = {
          paperId: examForm._id,
          bioUserId: bioUser?._id,
          isActive: true,
          started: new Date().getTime(),
        }
        updateUserExam(`/user-competitions/exams/${userExamForm._id}`, form)
      } else {
        const form = {
          paperId: examForm._id,
          bioUserId: bioUser?._id,
          bioUserUsername: bioUser.bioUserUsername,
          bioUserPicture: bioUser.bioUserPicture,
          title: examForm.title,
          instruction: examForm.instruction,
          type: examForm.type,
          isActive: true,
          bioUserDisplayName: bioUser.bioUserDisplayName,
          started: new Date().getTime(),
        }
        createUserExam(`/user-competitions/exams/`, form)
      }
    }
  }

  const submitData = async () => {
    if (isActive && bioUser?._id === 'ckdkd') {
      const form = {
        ended: String(new Date().getTime()),
        started: userExamForm.started,
        paperId: String(id),
        bioUserId: bioUser._id,
      }
      try {
        setLoading(true)
        const response = await customRequest({
          url: `/user-competitions/exams/submit?bioUserId=${bioUser?._id}&paperId=${id}&page=${currentPage}&page_size=${examForm.questionsPerPage}`,
          method: 'POST',
          showMessage: true,
          data: form,
        })

        const res = response?.data as unknown as Test
        if (res.exam) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          showLastResults(true)
          AuthStore.getState().setBioUserState(res.bioUserState)
          setMessage(
            'Congratulations! Your test was scored successfully, please click the table icon at your bottom left to see your progress.',
            true
          )
          ExamStore.setState({
            attempt: res.attempt,
          })
          ObjectiveStore.setState({
            lastQuestions: res.results,
          })
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    } else {
      setMessage(
        'Sorry, test cannot be submitted as you have not started.',
        false
      )
    }
  }

  useEffect(() => {
    if (userExamForm.started && duration) {
      const now = new Date().getTime()
      const remaining = userExamForm.started
        ? Math.floor((now - userExamForm.started) / 1000)
        : null

      if (duration > 0) {
        if (remaining && duration > remaining) {
          setTimeLeft(duration - remaining)
        } else if (isActive) {
          submitData()
        }
      }
    }
  }, [userExamForm.started, duration])

  useEffect(() => {
    if (examForm.questionsPerPage) {
      getQuestions(examForm.questionsPerPage, currentPage)
      getLastQuestions(examForm.questionsPerPage, currentPage)
      scrollRef.current?.scrollTo({ y: 0, animated: true })
    }
  }, [currentPage, examForm])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      submitData()
    }
    return () => clearInterval(timer)
  }, [isActive, timeLeft])

  return (
    <>
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

          {questions.length === 0 ? (
            <View className="p-5 flex-1 items-center justify-center">
              <Spinner size={40} />
            </View>
          ) : (
            <>
              {examForm.questionsPerPage > 0 && (
                <QuestionsList
                  data={isLastResults ? lastQuestions : questions}
                  isLastResults={isLastResults}
                  pageSize={examForm.questionsPerPage}
                  currentPage={currentPage}
                  width={width}
                  isDark={isDark}
                  optionsLabel={optionsLabel}
                />
              )}
              <View className="mb-[100px]">
                <Pagination
                  currentPage={currentPage}
                  totalItems={examForm.questions}
                  pageSize={examForm.questionsPerPage}
                />
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
