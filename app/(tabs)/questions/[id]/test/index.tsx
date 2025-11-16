import {
  formatTimeTo12Hour,
  formatDateToDDMMYY,
  truncateStringNormal,
} from '@/lib/helpers'
import { useState, useEffect, useRef } from 'react'
import { useLocalSearchParams, usePathname } from 'expo-router'
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  useWindowDimensions,
  AppState,
  ActivityIndicator,
} from 'react-native'
import RenderHtml from 'react-native-render-html'
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import { customRequest } from '@/lib/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import ExamStore, { Exam } from '@/store/exam/Exam'
import ObjectiveStore, { IOption, Objective } from '@/store/exam/Objective'
import { BioUserState } from '@/store/user/BioUserState'
import { UserExam } from '@/store/exam/UserExam'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import Pagination from '@/components/Question/Pagination'
import CountdownTimer from '@/components/Question/CountDownTimer'
import ExamResult from '@/components/Question/ExamResult'

interface Test {
  bioUserState: BioUserState
  exam: UserExam
  attempt: number
  results: Objective[]
}

const ExamStart = () => {
  const url = '/competitions/leagues/objectives/'
  const { getExam, examForm } = ExamStore()
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
  const [exam, setExam] = useState<UserExam>()
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
  const pathName = usePathname()

  const nextSection = async (size: number) => {
    getObjectives(
      `${url}?paperId=${examForm._id}&ordering=${sort}&page=${currentPage}&page_size=${size}`
    )

    const response = await customRequest({
      url: `/user-competitions/exams/?bioUserId=${user?.bioUserId}&paperId=${id}&page=${currentPage}&page_size=${size}`,
    })
    const res = response?.data as unknown as Test
    if (res.exam) {
      setExam(res.exam)
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
          setExam(res.exam)
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

  // const initializeUserTest = async () => {
  //   const started = await AsyncStorage.getItem('started')
  //   const startTime = started ? JSON.parse(started) : undefined

  //   if (userInfoForm && user) {
  //     const form = new FormData()
  //     form.append('username', userInfoForm.username)
  //     form.append('userId', userInfoForm._id)
  //     form.append('picture', userInfoForm.picture)
  //     form.append('displayName', userInfoForm.displayName)
  //     form.append('started', startTime)
  //     form.append('paperId', String(id))

  //     try {
  //       setLoading(true)
  //       await customRequest(
  //         {
  //           url: `/user-competitions/init?userId=${user?.userId}&paperId=${id}`,
  //           method: 'POST',
  //           data: form,
  //         },
  //         true
  //       )
  //     } catch (error) {
  //       console.log(error)
  //     } finally {
  //       setLoading(false)
  //     }
  //   } else {
  //     setMessage(
  //       'Sorry, test cannot be submitted as you have not made any attempt.',
  //       false
  //     )
  //   }
  // }

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

  // useEffect(() => {
  //   const find = async () => {
  //     if (id && user) {
  //       getItem(`/competitions/exams/${id}?userId=${user.userId}`)
  //     }

  //     const response = await customRequest({ url: `/users/${user?.username}` })
  //     if (response.data) {
  //       setUser(response.data)
  //     }
  //   }

  //   find()
  // }, [id, user?.username, pathName])

  useEffect(() => {
    if (examForm.questionsPerPage > 0 && user) {
      setPageSize(examForm.questionsPerPage)
      setDuration(examForm.duration * 60)
      setTimeLeft(examForm.duration * 60)
      nextSection(examForm.questionsPerPage)
      // setFromForm(false)
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
      {bioUserState?.examAttempts === 0 && !isActive ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-secondary dark:bg-dark-secondary px-3 py-10"
        >
          <View
            className={`items-center pb-1 mb-5 relative border-b border-b-border dark:border-b-dark-border`}
          >
            <Text className="text-secondary dark:text-dark-secondary text-center text-xl mb-2">
              Important Notice Before You Begin
            </Text>
            <Text className="text-primary leading-[20px] text-center dark:text-dark-primaryLight">
              Please read the online-test policy carefully before you begin this
              exercise, if you are comfortable you can click the play button at
              the bottom left to start. Else, click the exit button at your
              bottom right to exit this page.
            </Text>
          </View>
          <View className="bg-primary dark:bg-dark-primary rounded-[10px] p-3">
            <Text className="text-primary text-justify text-lg dark:text-dark-primary">
              In our effort to create a simple and academic platform where exam
              canditiates can test/practice with available past questions, we
              record every exercise performed by users, whether casual or
              formal. We do this simply to improve user experience, therefore we
              hope you are prepared for this test before you start. Once you
              begin and decides to end by any means, your progress will be
              scored as though you have completed the exercise.{' '}
              <Text className="text-custom">
                Above all, feel free to prepare for as many exams as available
                on this platform, thanks.
              </Text>
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-primary dark:bg-dark-primary p-3"
        >
          {bioUserState && (
            <View
              className={`items-center pb-1 relative border-b border-b-border dark:border-b-dark-border ${
                exam && exam?.attempts > 0 ? 'mb-10' : 'mb-5'
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

              {exam && exam?.attempts > 0 && (
                <View className="flex-row justify-between w-full absolute left-0 bottom-[-30px]">
                  <Text className="text-primary dark:text-dark-primary">
                    {exam?.attempts} Attempts
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
          )}

          {exam && isLastResults && isResultDisplayed && (
            <ExamResult exam={exam} setDisplayResult={setDisplayResult} />
          )}

          {objectiveResults.length === 0 ? (
            <View className="p-5 flex-1 items-center justify-center">
              <ActivityIndicator className="" size={24} color="#DA3986" />
            </View>
          ) : (
            <>
              {isLastResults
                ? lastResults.map((question, index) => (
                    <View
                      key={index}
                      className={`${
                        question.isClicked
                          ? 'border-border dark:border-dark-border'
                          : 'border-transparent'
                      } rounded-md flex-1 mb-3 border`}
                    >
                      <View className={`flex-row flex-1 rounded-[5px] p-[2px]`}>
                        {page_size && (
                          <Text className="text-primary dark:text-dark-primary mr-2">
                            {(Number(currentPage) - 1) * page_size + index + 1}
                          </Text>
                        )}
                        <View className="flex-1">
                          <ScrollView horizontal>
                            <RenderHtml
                              contentWidth={width}
                              source={{ html: question.question }}
                              baseStyle={{
                                color: isDark ? '#EFEFEF' : '#3A3A3A',
                                fontSize: 17,
                                fontWeight: '400',
                                lineHeight: 23,
                                flexGrow: 1,
                              }}
                              tagsStyles={{
                                p: {
                                  marginBottom: 8,
                                  color: isDark ? '#EFEFEF' : '#3A3A3A',
                                  fontSize: 17,
                                  lineHeight: 23,
                                },
                                img: {
                                  width: width * 0.8,
                                },
                                table: {
                                  borderWidth: 1,
                                  borderColor: '#999',
                                  width: '100%',
                                  minWidth: 500, // ✅ Minimum width
                                  marginVertical: 10,
                                },
                                th: {
                                  backgroundColor: '#EEE',
                                  padding: 6,
                                  borderWidth: 1,
                                  borderColor: '#999',
                                  fontWeight: 'bold',
                                  textAlign: 'center',
                                },
                                td: {
                                  padding: 6,
                                  borderWidth: 1,
                                  borderColor: '#999',
                                  textAlign: 'center',
                                },
                              }}
                            />
                          </ScrollView>

                          {question.options.map((item, int) => (
                            <View
                              key={int}
                              className={`flex-row flex-1 py-2 pr-2`}
                            >
                              <Text
                                className={`${
                                  isLastResults && item.isSelected
                                    ? 'text-green-600'
                                    : item.isClicked
                                    ? 'text-custom'
                                    : 'text-primary dark:text-dark-primary'
                                } mr-1 `}
                              >
                                {optionsLabel[int]})
                              </Text>
                              <Text
                                className={`${
                                  isLastResults && item.isSelected
                                    ? 'text-green-600'
                                    : item.isClicked
                                    ? 'text-custom'
                                    : 'text-primary flex-1 dark:text-dark-primary'
                                } text-[16px]`}
                              >
                                {item.value}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))
                : questions.map((question, index) => (
                    <View
                      key={index}
                      className={`${
                        question.isClicked
                          ? 'border-border dark:border-dark-border'
                          : 'border-transparent'
                      } rounded-md questions mb-3 border`}
                    >
                      <View
                        className={`flex-row flex-1 rounded-[5px] p-[2px] ${
                          question.isClicked ? 'clicked' : ''
                        }`}
                      >
                        {page_size && (
                          <Text className="text-primary dark:text-dark-primary mr-2">
                            {(Number(currentPage) - 1) * page_size + index + 1}
                          </Text>
                        )}
                        <View className="flex-1">
                          <RenderHtml
                            contentWidth={width}
                            source={{
                              html: question.question,
                            }}
                            baseStyle={{
                              color: isDark ? '#EFEFEF' : '#3A3A3A',
                              fontSize: 17,
                              fontWeight: '400',
                              lineHeight: 23,
                              flexGrow: 1,
                            }}
                            tagsStyles={{
                              p: {
                                marginBottom: 8,
                                color: isDark ? '#EFEFEF' : '#3A3A3A',
                                fontSize: 17,
                                lineHeight: 23,
                              },
                              img: {
                                width: width,
                                height: 'auto',
                                maxHeight: 180,
                              },
                              tr: {
                                display: 'flex',
                              },

                              table: {
                                borderWidth: 1,
                                borderColor: '#999',
                                width: '100%',
                                minWidth: 400, // ✅ Minimum width
                                marginVertical: 10,
                              },
                              th: {
                                backgroundColor: '#EEE',
                                padding: 6,
                                borderWidth: 1,
                                borderColor: '#999',
                                fontWeight: 'bold',
                                textAlign: 'center',
                              },
                              td: {
                                padding: 6,
                                borderWidth: 1,
                                borderColor: '#999',
                                textAlign: 'center',
                              },
                            }}
                            ignoredDomTags={['colgroup', 'col']}
                          />
                          {question.options.map((item, int) => (
                            <TouchableOpacity
                              onPress={() => selectAnswer(item, question._id)}
                              key={int}
                              className={`flex-row flex-1 py-2 pr-2`}
                            >
                              <Text
                                className={`${
                                  isLastResults && item.isSelected
                                    ? 'text-success'
                                    : item.isClicked
                                    ? 'text-custom'
                                    : 'text-primary dark:text-dark-primary'
                                } mr-1 `}
                              >
                                {optionsLabel[int]})
                              </Text>
                              <Text
                                className={`${
                                  isLastResults && item.isSelected
                                    ? 'text-success'
                                    : item.isClicked
                                    ? 'text-custom'
                                    : 'text-primary dark:text-dark-primary'
                                } flex-1 text-[16px]`}
                              >
                                {item.value}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}

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
