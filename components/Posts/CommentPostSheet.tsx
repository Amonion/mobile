import React, { forwardRef, useImperativeHandle } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

// const SNAP_TOP = SCREEN_HEIGHT * 0.1
// const SNAP_MID_HIGH = SCREEN_HEIGHT * 0.3
// const SNAP_MIDDLE = SCREEN_HEIGHT * 0.5
// const SNAP_BOTTOM = SCREEN_HEIGHT

const SNAP_OPEN = SCREEN_HEIGHT * 0.15
const SNAP_CLOSED = SCREEN_HEIGHT

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
    const translateY = useSharedValue(SNAP_CLOSED)
    const visibleHeight = useDerivedValue(
      () => SCREEN_HEIGHT - translateY.value
    )
    const isVisible = useSharedValue(0)
    useImperativeHandle(ref, () => ({
      open: () => openSheet(),
      close: () => closeSheet(),
    }))

    const openSheet = () => {
      isVisible.value = 1
      translateY.value = withSpring(SNAP_OPEN, {
        damping: 20,
        stiffness: 120,
      })
      onOpen?.()
    }

    const closeSheet = () => {
      translateY.value = withSpring(SNAP_CLOSED, {
        damping: 20,
        stiffness: 120,
      })
      onClose?.()
      setTimeout(() => {
        isVisible.value = 0
      }, 300)
    }

    const panGesture = Gesture.Pan()
      .onChange((e) => {
        translateY.value = Math.max(0, translateY.value + e.changeY)
      })
      .onEnd((e) => {
        const shouldClose =
          e.velocityY > 1000 || translateY.value > SNAP_OPEN + 150

        if (shouldClose) {
          translateY.value = withSpring(SNAP_CLOSED, {
            damping: 20,
            stiffness: 120,
          })
          runOnJS(onClose || (() => {}))()
          setTimeout(() => {
            isVisible.value = 0
          }, 300)
        } else {
          translateY.value = withSpring(SNAP_OPEN, {
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
        [SNAP_OPEN, SNAP_CLOSED],
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
          className={`bg-primary dark:bg-dark-primary elevation-20 z-30 absolute left-0 top-0 right-0`}
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
