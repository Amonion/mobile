import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
} from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  BackHandler,
  Keyboard,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'
import CommentBox from './CommentBox'
import CommentSheetInput from './CommentSheetInput'
import { Comment } from '@/store/post/Comment'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

const SNAP_TOP = SCREEN_HEIGHT * 0.1 // 90% open
const SNAP_MID_HIGH = SCREEN_HEIGHT * 0.3 // 70%
const SNAP_MIDDLE = SCREEN_HEIGHT * 0.5 // 50%
const SNAP_BOTTOM = SCREEN_HEIGHT // closed

const AnimatedView = Animated.createAnimatedComponent(View)

export interface CommentSheetRef {
  open: (initialComments?: Comment[]) => void
  close: () => void
}

interface Props {
  onSubmitComment?: (text: string) => Promise<void> | void
  initialComments?: Comment[]
}

export const CommentSheet = forwardRef<CommentSheetRef, Props>(
  ({ onSubmitComment, initialComments = [] }, ref) => {
    const [showSheet, setShowSheet] = useState(false)
    const translateY = useSharedValue(SNAP_BOTTOM)
    const visibleHeight = useDerivedValue(
      () => SCREEN_HEIGHT - translateY.value
    )
    const isVisible = useSharedValue(0)
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    const color = isDark ? '#BABABA' : '#6E6E6E'
    const previousSnap = useRef(SNAP_MIDDLE)

    useImperativeHandle(ref, () => ({
      open: () => openSheet(), // ✅ default open at 50%
      close: () => closeSheet(),
    }))

    useEffect(() => {
      const onBackPress = () => {
        if (translateY.value < SNAP_BOTTOM) {
          closeSheet()
          return true
        }
        return false
      }
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      )
      return () => subscription.remove()
    }, [])

    useEffect(() => {
      const showSub = Keyboard.addListener('keyboardDidShow', () => {
        previousSnap.current = translateY.value
        translateY.value = withSpring(SNAP_MID_HIGH, {
          damping: 20,
          stiffness: 120,
        })
      })
      const hideSub = Keyboard.addListener('keyboardDidHide', () => {
        translateY.value = withSpring(previousSnap.current, {
          damping: 20,
          stiffness: 120,
        })
      })
      return () => {
        showSub.remove()
        hideSub.remove()
      }
    }, [])

    const openSheet = (to = SNAP_MIDDLE) => {
      isVisible.value = 1
      translateY.value = withSpring(to, { damping: 20, stiffness: 120 })
      setTimeout(() => {
        setShowSheet(true)
      }, 200)
    }

    const closeSheet = () => {
      translateY.value = withSpring(SNAP_BOTTOM, {
        damping: 20,
        stiffness: 120,
      })
      setShowSheet(false)
      setTimeout(() => runOnJS(() => (isVisible.value = 0))(), 300)
    }

    const panGesture = Gesture.Pan()
      .onChange((e) => {
        translateY.value = Math.max(0, translateY.value + e.changeY)
      })
      .onEnd((e) => {
        const endY = translateY.value
        const velocity = e.velocityY

        let snapPoint = SNAP_MIDDLE

        if (endY <= SNAP_TOP + 50) {
          snapPoint = SNAP_TOP // 90%
        } else if (endY <= SNAP_MID_HIGH + 50) {
          snapPoint = SNAP_MID_HIGH // 70%
        } else if (endY <= SNAP_MIDDLE + 80) {
          snapPoint = SNAP_MIDDLE // 50%
        } else if (endY > SNAP_MIDDLE + 100 || velocity > 800) {
          snapPoint = SNAP_BOTTOM // Close
          runOnJS(setShowSheet)(false)
        }

        translateY.value = withSpring(snapPoint, {
          damping: 20,
          stiffness: 120,
        })
      })

    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      borderTopLeftRadius: interpolate(
        translateY.value,
        [0, SNAP_BOTTOM],
        [16, 0],
        Extrapolate.CLAMP
      ),
      borderTopRightRadius: interpolate(
        translateY.value,
        [0, SNAP_BOTTOM],
        [16, 0],
        Extrapolate.CLAMP
      ),
    }))

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        translateY.value,
        [SNAP_MIDDLE, SNAP_BOTTOM],
        [0.5, 0],
        Extrapolate.CLAMP
      ),
      display: isVisible.value ? 'flex' : 'none',
    }))

    return (
      <>
        <AnimatedView style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeSheet}
          />
        </AnimatedView>

        {showSheet && <CommentSheetInput />}

        <AnimatedView
          className={`bg-primary dark:bg-dark-primary elevation-20 z-20 absolute left-0 top-0 right-0`}
          style={[{ height: SCREEN_HEIGHT }, sheetStyle]}
        >
          <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
            <GestureDetector gesture={panGesture}>
              <View className="h-[50px] px-3 justify-center items-center">
                <View className="w-[48px] bg-primaryLight dark:bg-dark-primaryLight rounded-full h-[6px]" />
                <TouchableOpacity
                  onPress={closeSheet}
                  className="absolute right-3 p-[6px] top-2"
                >
                  <X size={20} color={color} />
                </TouchableOpacity>
              </View>
            </GestureDetector>

            <View className="flex-1 px-3">
              <Text className="text-secondary text-xl dark:text-dark-secondary mb-2">
                Comments
              </Text>
              <CommentBox
                translateY={translateY}
                visibleHeight={visibleHeight}
              />
            </View>
          </SafeAreaView>
        </AnimatedView>
      </>
    )
  }
)

CommentSheet.displayName = 'CommentSheet'

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 10,
  },
})
