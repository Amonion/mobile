import React, { useEffect } from 'react'
import { View, Modal, Pressable, Text, Dimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CommentPostSheetInput from '../Posts/CommentPostSheetInput'
import ProfileCommentBox from './ProfileCommentBox'

interface ProfileCommentSheetProps {
  visible: boolean
  setVisible: (state: boolean) => void
  height?: number
}

const ProfileCommentSheet: React.FC<ProfileCommentSheetProps> = ({
  visible,
  setVisible,
  height = 450,
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
        runOnJS(() => setVisible(false))() // close if swiped down far enough
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
      onRequestClose={() => setVisible(false)}
      statusBarTranslucent
      hardwareAccelerated
    >
      <GestureDetector gesture={gesture}>
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
            onPress={() => setVisible(false)}
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
            <Text className="text-white">Comments</Text>
            <ProfileCommentBox />
            <View className="absolute bottom-0 left-0 right-0 z-50 bg-primary dark:bg-dark-primary pb-2  px-3">
              <CommentPostSheetInput />
            </View>
          </Animated.View>
        </View>
      </GestureDetector>
    </Modal>
  )
}

export default ProfileCommentSheet
