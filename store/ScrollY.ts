// store/ScrollY.ts
import { create } from 'zustand'
import { Animated } from 'react-native'

interface ScrollState {
  scrollY: Animated.Value
}

export const useScrollStore = create<ScrollState>(() => ({
  scrollY: new Animated.Value(0),
}))
