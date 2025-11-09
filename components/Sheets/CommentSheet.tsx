import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
} from 'react'
import {
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  useColorScheme,
  BackHandler,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export interface Comment {
  id: string
  author: string
  text: string
  createdAt?: string
}

export interface CommentSheetRef {
  open: (initialComments?: Comment[]) => void
  close: () => void
}

interface Props {
  onSubmitComment?: (text: string) => Promise<void> | void
  initialComments?: Comment[]
}

const SNAP_TOP = 80
const SNAP_MIDDLE = SCREEN_HEIGHT * 0.5
const SNAP_BOTTOM = SCREEN_HEIGHT

const AnimatedView = Animated.createAnimatedComponent(View)

export const CommentSheet = forwardRef<CommentSheetRef, Props>(
  ({ onSubmitComment, initialComments = [] }, ref) => {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [input, setInput] = useState('')
    const [keyboardHeight, setKeyboardHeight] = useState(0)
    const translateY = useSharedValue(SNAP_BOTTOM)
    const isVisible = useSharedValue(0)
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    const color = isDark ? '#BABABA' : '#6E6E6E'
    const insets = useSafeAreaInsets()

    useImperativeHandle(ref, () => ({
      open: (initial?: Comment[]) => {
        if (initial) setComments(initial)
        openSheet()
      },
      close: () => closeSheet(),
    }))

    useEffect(() => {
      const show = Keyboard.addListener('keyboardDidShow', (e) =>
        setKeyboardHeight(e.endCoordinates?.height || 300)
      )
      const hide = Keyboard.addListener('keyboardDidHide', () =>
        setKeyboardHeight(0)
      )
      return () => {
        show.remove()
        hide.remove()
      }
    }, [])

    useEffect(() => {
      const onBackPress = () => {
        if (translateY.value < SNAP_BOTTOM) {
          // sheet is open
          closeSheet()
          return true // prevent default back action
        }
        return false // allow default back action
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      )

      return () => subscription.remove()
    }, [])

    const openSheet = (to = SNAP_MIDDLE) => {
      isVisible.value = 1
      translateY.value = withSpring(to, { damping: 20, stiffness: 120 })
    }

    const closeSheet = () => {
      translateY.value = withSpring(SNAP_BOTTOM, {
        damping: 20,
        stiffness: 120,
      })
      setTimeout(() => runOnJS(() => (isVisible.value = 0))(), 300)
    }

    // 🟢 Reanimated v3 gesture
    const panGesture = Gesture.Pan()
      .onChange((e) => {
        translateY.value = Math.max(0, translateY.value + e.changeY)
      })
      .onEnd((e) => {
        const endY = translateY.value
        const velocity = e.velocityY

        let snapPoint = SNAP_MIDDLE
        if (endY <= SNAP_TOP + 50) snapPoint = SNAP_TOP
        else if (endY > SNAP_MIDDLE + 100 || velocity > 800)
          snapPoint = SNAP_BOTTOM

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

    const addComment = useCallback(async () => {
      if (!input.trim()) return
      const newComment: Comment = {
        id: Date.now().toString(),
        author: 'You',
        text: input.trim(),
        createdAt: new Date().toISOString(),
      }
      setComments((prev) => [newComment, ...prev])
      setInput('')
      Keyboard.dismiss()
      if (onSubmitComment) {
        await onSubmitComment(newComment.text)
      }
    }, [input, onSubmitComment])

    const renderItem = ({ item }: { item: Comment }) => (
      <View style={styles.commentRow}>
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.author}>{item.author}</Text>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
      </View>
    )

    return (
      <>
        <AnimatedView style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeSheet}
          />
        </AnimatedView>

        <View
          className="absolute left-0 w-full flex flex-row"
          style={{
            bottom: insets.bottom + 8,
          }}
        >
          <TextInput
            placeholder="Write a comment..."
            value={input}
            onChangeText={setInput}
            style={[
              styles.input,
              {
                flex: 1,
                minHeight: 40,
                maxHeight: 120,
                textAlignVertical: 'top',
              },
            ]}
            multiline
            numberOfLines={4}
            returnKeyType="send"
            onSubmitEditing={addComment}
          />
          <TouchableOpacity onPress={addComment} style={styles.sendBtn}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Send</Text>
          </TouchableOpacity>
        </View>

        <GestureDetector gesture={panGesture}>
          <AnimatedView
            className={`bg-primary dark:bg-dark-primary elevation-20 z-20 absolute left-0 top-0 right-0`}
            style={[{ height: SCREEN_HEIGHT }, sheetStyle]}
          >
            <View className="absolute z-30 h-5 w-full bg-red-500 bottom-10"></View>

            <SafeAreaView
              edges={['bottom']}
              style={{ flex: 1, position: 'relative' }}
            >
              <View className="h-[40px] px-3 justify-center items-center">
                <View className="w-[48px] bg-primaryLight dark:bg-dark-primaryLight rounded-full h-[6px]" />
                <TouchableOpacity
                  onPress={closeSheet}
                  className="absolute right-3 p-[6px] top-2"
                >
                  <X size={20} color={color} />
                </TouchableOpacity>
              </View>

              <View className="flex-1 px-3">
                <Text className="text-secondary text-xl dark:text-dark-secondary">
                  Comments
                </Text>
                <FlatList
                  data={comments}
                  keyExtractor={(i) => i.id}
                  renderItem={renderItem}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{
                    paddingBottom: Platform.OS === 'ios' ? 120 : 80,
                  }}
                />
              </View>
            </SafeAreaView>
          </AnimatedView>
        </GestureDetector>
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

  handle: {
    width: 48,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#ccc',
    alignSelf: 'center',
  },

  commentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ddd',
  },
  author: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingBottom: 60,
    flex: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    backgroundColor: '#f5f5f5',
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#0b84ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
})
