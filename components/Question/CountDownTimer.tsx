import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
  useColorScheme,
} from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Feather from '@expo/vector-icons/Feather'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'

type CountdownTimerProps = {
  durationInSeconds?: number
  isActive: boolean
  isLastResults: boolean
  setDisplayResult: (event: GestureResponderEvent) => void
  isInteracting: boolean
  startCountdown: () => void
  isLoading: boolean
  submit: () => void
  total: number
  answered: number
  timeLeft: number
  totalAttempts: number
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  durationInSeconds = 1,
  isActive,
  isLastResults,
  setDisplayResult,
  isInteracting,
  startCountdown,
  isLoading,
  submit,
  total,
  answered,
  timeLeft,
  totalAttempts,
}) => {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const progress = (timeLeft / durationInSeconds) * circumference
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false

  return (
    <View className="absolute bottom-[0px] w-full z-30 bg-gradient-to-t from-black/50 to-transparent pb-[10px]">
      <View className="flex-row justify-between items-end px-[10px]">
        <View className="flex-1 flex-row justify-between items-end">
          {isActive ? (
            <View className="flex items-center relative">
              <View className=" h-[40px] items-center justify-center rounded-full bg-secondary dark:bg-dark-secondary">
                <Svg width={42} height={42} className="absolute">
                  <Circle
                    cx="21"
                    cy="21"
                    r={radius}
                    stroke={isDark ? '#EFEFEF' : '#3A3A3A'}
                    strokeWidth="5"
                    fill="none"
                  />
                  <Circle
                    cx="21"
                    cy="21"
                    r={radius}
                    stroke="#DA3986"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    transform="rotate(-90 21 21)"
                  />
                </Svg>

                <View className="absolute w-[36px] h-[36px] rounded-full  items-center justify-center">
                  <Text className="text-primary dark:text-dark-primary text-sm">
                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                  </Text>
                </View>

                <View className="absolute w-[70px] top-[-25px] left-[0px]">
                  <Text className=" text-secondary dark:text-dark-secondary text-lg">
                    {answered}/{total}
                  </Text>
                </View>
              </View>
            </View>
          ) : isLastResults ? (
            <TouchableOpacity
              onPress={setDisplayResult}
              className="h-10 w-10 bg-custom rounded-full items-center justify-center"
            >
              <Feather name="list" size={20} color="white" />
            </TouchableOpacity>
          ) : null}

          {isLoading ? (
            <TouchableOpacity className="h-10 w-10 bg-custom rounded-full items-center justify-center">
              <Feather
                name="loader"
                size={20}
                color="white"
                className="animate-spin"
              />
            </TouchableOpacity>
          ) : (
            <View
              className={`${
                !isActive && totalAttempts === 0 ? 'flex-1' : ''
              } flex-row justify-between`}
            >
              <View className="items-center">
                {isActive ? (
                  <TouchableOpacity
                    onPress={submit}
                    className={`h-10 w-10 bg-custom rounded-full items-center justify-center ${
                      isInteracting ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Feather name="send" size={20} color="white" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={startCountdown}
                    className={`h-10 w-10 bg-custom rounded-full items-center justify-center ${
                      isInteracting ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <MaterialIcons
                      name={isActive ? 'stop' : 'play-arrow'}
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                )}
              </View>
              {!isActive && totalAttempts === 0 && (
                <TouchableOpacity
                  onPress={() => router.back()}
                  className={`h-10 w-10 bg-custom rounded-full items-center justify-center ${
                    isInteracting ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <MaterialIcons
                    name="power-settings-new"
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default CountdownTimer
