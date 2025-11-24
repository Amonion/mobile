// ScrollHeaderContext.tsx
import React, { createContext, useContext, useState } from 'react'
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ViewStyle,
} from 'react-native'
import { HEADER_HEIGHT } from '@/constants/Sizes'

type ScrollHeaderContextType = {
  scrollY: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
  animatedHeaderStyle: ViewStyle
  isFloating: boolean
}

const ScrollHeaderContext = createContext<ScrollHeaderContextType | undefined>(
  undefined
)

export const ScrollHeaderProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const y = useSharedValue(0)
  const prevY = useSharedValue(0)
  const headerOffset = useSharedValue(0)
  const [isFloating, setIsFloating] = useState(false)

  const threshold = HEADER_HEIGHT // point where it becomes floating

  const scrollY = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = e.nativeEvent.contentOffset.y

    if (currentY > prevY.value && currentY > threshold) {
      headerOffset.value = withTiming(-HEADER_HEIGHT)
    } else if (currentY < prevY.value) {
      headerOffset.value = withTiming(0)
    }

    if (currentY > threshold && !isFloating) {
      setIsFloating(true)
    }

    if (currentY <= 0 && isFloating) {
      setIsFloating(false)
    }

    prevY.value = currentY
    y.value = currentY
  }

  const animatedHeaderStyle = useAnimatedStyle<ViewStyle>(() => ({
    transform: [{ translateY: headerOffset.value }],
  }))

  return (
    <ScrollHeaderContext.Provider
      value={{ scrollY, animatedHeaderStyle, isFloating }}
    >
      {children}
    </ScrollHeaderContext.Provider>
  )
}

export const useScrollHeader = () => {
  const context = useContext(ScrollHeaderContext)
  if (!context) {
    throw new Error(
      'useScrollHeader must be used within a ScrollHeaderProvider'
    )
  }
  return context
}
