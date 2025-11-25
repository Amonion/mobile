import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
} from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import CommentPostBox from './CommentPostBox'
import { Comment } from '@/store/post/Comment'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

const SNAP_TOP = SCREEN_HEIGHT * 0.1
const SNAP_MID_HIGH = SCREEN_HEIGHT * 0.3
const SNAP_MIDDLE = SCREEN_HEIGHT * 0.5
const SNAP_BOTTOM = SCREEN_HEIGHT

const AnimatedView = Animated.createAnimatedComponent(View)

export interface CommentPostSheetRef {
  open: (initialComments?: Comment[]) => void
  close: () => void
}

interface Props {
  onSubmitComment?: (text: string) => Promise<void> | void
  initialComments?: Comment[]
  onOpen?: () => void // ← Add these
  onClose?: () => void
}

export const CommentPostSheet = forwardRef<CommentPostSheetRef, Props>(
  ({ onSubmitComment, initialComments = [], onOpen, onClose }, ref) => {
    const translateY = useSharedValue(SNAP_BOTTOM)
    const visibleHeight = useDerivedValue(
      () => SCREEN_HEIGHT - translateY.value
    )
    const isVisible = useSharedValue(0)
    const previousSnap = useRef(SNAP_MIDDLE)
    useImperativeHandle(ref, () => ({
      open: () => openSheet(),
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

    // const openSheet = (to = SNAP_MID_HIGH) => {
    //   isVisible.value = 1
    //   translateY.value = withSpring(to, { damping: 20, stiffness: 120 })
    // }

    // const closeSheet = () => {
    //   translateY.value = withSpring(SNAP_BOTTOM, {
    //     damping: 20,
    //     stiffness: 120,
    //   })
    //   setTimeout(() => {
    //     isVisible.value = 0
    //   }, 300)
    // }

    const openSheet = (to = SNAP_MID_HIGH) => {
      isVisible.value = 1
      translateY.value = withSpring(to, { damping: 20, stiffness: 120 })
      onOpen?.() // ← Notify parent
    }

    const closeSheet = () => {
      translateY.value = withSpring(SNAP_BOTTOM, {
        damping: 20,
        stiffness: 120,
      })
      onClose?.() // ← Notify parent
      setTimeout(() => {
        isVisible.value = 0
      }, 300)
    }

    // const closeSheet = () => {
    //   translateY.value = withSpring(SNAP_BOTTOM, {
    //     damping: 20,
    //     stiffness: 120,
    //   })
    //   commentPostSheetVisibility.value = withTiming(0, { duration: 300 })
    //   setTimeout(() => runOnJS(() => (isVisible.value = 0))(), 300)
    // }

    // const panGesture = Gesture.Pan()
    //   .onChange((e) => {
    //     translateY.value = Math.max(0, translateY.value + e.changeY)
    //   })
    //   .onEnd((e) => {
    //     const velocity = e.velocityY
    //     const shouldClose = velocity > 1200 || translateY.value > SNAP_MIDDLE

    //     if (shouldClose) {
    //       translateY.value = withSpring(SNAP_BOTTOM, {
    //         damping: 20,
    //         stiffness: 120,
    //       })
    //       runOnJS(onClose || (() => {}))()
    //       setTimeout(() => {
    //         isVisible.value = 0
    //       }, 300)
    //     } else {
    //       const target =
    //         translateY.value < SNAP_MID_HIGH + 100 ? SNAP_TOP : SNAP_MID_HIGH
    //       translateY.value = withSpring(target, {
    //         damping: 20,
    //         stiffness: 120,
    //       })
    //     }
    //   })

    const panGesture = Gesture.Pan()
      .onChange((e) => {
        translateY.value = Math.max(0, translateY.value + e.changeY)
      })
      .onEnd((e) => {
        const endY = translateY.value
        const velocity = e.velocityY
        const shouldClose = velocity > 1200 || translateY.value > SNAP_MIDDLE

        if (shouldClose) {
          translateY.value = withSpring(SNAP_BOTTOM, {
            damping: 20,
            stiffness: 120,
          })
          runOnJS(onClose || (() => {}))()
          setTimeout(() => {
            isVisible.value = 0
          }, 300)
        } else {
          let snapPoint = SNAP_MID_HIGH

          if (endY <= SNAP_TOP + 80) {
            snapPoint = SNAP_TOP
          } else {
            snapPoint = SNAP_MID_HIGH
          }

          if (velocity > 1200) {
            snapPoint = SNAP_BOTTOM
          }

          translateY.value = withSpring(snapPoint, {
            damping: 20,
            stiffness: 120,
          })
        }
      })

    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
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

        <AnimatedView
          className={`bg-primary dark:bg-dark-primary elevation-20 z-50 absolute left-0 top-0 right-0`}
          style={[
            {
              height: SCREEN_HEIGHT,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
            sheetStyle,
          ]}
        >
          <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
            <GestureDetector gesture={panGesture}>
              <View className="h-[50px] px-3 justify-center items-center">
                <View className="w-[48px] bg-primaryLight dark:bg-dark-primaryLight rounded-full h-[6px]" />
              </View>
            </GestureDetector>

            <View className="flex-1 px-3">
              <Text className="text-secondary text-xl dark:text-dark-secondary mb-2">
                Comments
              </Text>
              <CommentPostBox
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

CommentPostSheet.displayName = 'CommentPostSheet'

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 10,
  },
})
