import React, { useEffect } from 'react'
import { View, Modal, Pressable, Dimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface BottomSheetProfileOptionsProps {
  visible: boolean
  onClose: () => void
  children?: React.ReactNode
  height?: number
}

const BottomSheetProfileOptions: React.FC<BottomSheetProfileOptionsProps> = ({
  visible,
  onClose,
  children,
  height = 350,
}) => {
  const insets = useSafeAreaInsets()
  const translateY = useSharedValue(0)

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY
      }
    })
    .onEnd(() => {
      if (translateY.value > 100) {
        runOnJS(onClose)() // close if swiped down far enough
      } else {
        translateY.value = withSpring(0)
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      hardwareAccelerated
    >
      <GestureDetector gesture={gesture}>
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
            onPress={onClose}
          />

          <Animated.View
            style={[
              {
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                minHeight: height,
                paddingBottom: insets.bottom,
              },
              animatedStyle,
            ]}
            className="dark:bg-dark-primary bg-primary px-4 pt-5 pb-8"
          >
            <View className="w-12 h-1.5 bg-gray-400/50 self-center rounded-full mb-4" />
            {children}
          </Animated.View>
        </View>
      </GestureDetector>
    </Modal>
  )
}

export default BottomSheetProfileOptions
