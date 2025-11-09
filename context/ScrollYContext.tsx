import { HEADER_HEIGHT } from '@/constants/Sizes'
import React, { createContext, useContext, useRef } from 'react'
import { useSharedValue, withTiming } from 'react-native-reanimated'

const ScrollYContext = createContext<{
  scrollY: number
  onScroll: (y: number) => void
  appBarTranslateY: any
} | null>(null)

export const ScrollYProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const scrollY = useSharedValue(0)
  const appBarTranslateY = useSharedValue(0)

  const previousY = useRef(0)
  const appBarHidden = useRef(false)

  const scrollThreshold = 100

  const onScroll = (y: number) => {
    const delta = y - previousY.current

    if (delta > 0 && !appBarHidden.current && y > scrollThreshold) {
      // Scrolling down past threshold, hide app bar
      appBarHidden.current = true
      appBarTranslateY.value = withTiming(-HEADER_HEIGHT)
    } else if (delta < 0 && appBarHidden.current) {
      // Scrolling up (at any position), show app bar
      appBarHidden.current = false
      appBarTranslateY.value = withTiming(0)
    }

    previousY.current = y
    scrollY.value = y
  }

  return (
    <ScrollYContext.Provider
      value={{ scrollY: scrollY.value, onScroll, appBarTranslateY }}
    >
      {children}
    </ScrollYContext.Provider>
  )
}

export const useScrollY = () => {
  const context = useContext(ScrollYContext)
  if (!context)
    throw new Error('useScrollY must be used within ScrollYProvider')
  return context
}
