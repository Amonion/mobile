import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  ViewToken,
  Keyboard,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated'
import CommentPostSheetInput from '@/components/Posts/CommentPostSheetInput'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { runOnJS } from 'react-native-worklets'
import { PostStore } from '@/store/post/Post'
import FullPostMediaItem from '@/components/Posts/FullPostMediaItem'
import CommentPostBox from '@/components/Posts/CommentPostBox'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')
const SNAP_OPEN = SCREEN_HEIGHT / 2
const SNAP_CLOSED = SCREEN_HEIGHT

export default function FullMediaScreen() {
  const translateY = useSharedValue(SNAP_CLOSED)
  const insets = useSafeAreaInsets()
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const { mediaResults, currentIndex } = PostStore()
  const mediaIndex = useSharedValue(0)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 80,
  }).current

  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index
        if (index != null) {
          mediaIndex.value = index
        }
      }
    }
  ).current

  const openComments = () => {
    setSheetOpen(true)
    translateY.value = withTiming(SNAP_OPEN, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    })
  }

  const closeComments = () => {
    translateY.value = withTiming(
      SNAP_CLOSED,
      { duration: 300, easing: Easing.out(Easing.ease) },
      () => runOnJS(setSheetOpen)(false)
    )
  }

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(SNAP_OPEN, translateY.value + e.translationY)
    })
    .onEnd((e) => {
      const goingDown = e.velocityY > 300
      translateY.value = withTiming(goingDown ? SNAP_CLOSED : SNAP_OPEN, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      })
    })

  const mediaStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateY.value,
      [SNAP_CLOSED, SNAP_OPEN],
      [0, 1]
    )

    return {
      height: SCREEN_HEIGHT - progress * SNAP_OPEN,
      width: SCREEN_WIDTH,
      paddingTop: insets.top,
    }
  })

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: translateY.value === SNAP_CLOSED ? 0 : 1,
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [SNAP_CLOSED, SNAP_OPEN], [0, 0.5]),
    display:
      interpolate(translateY.value, [SNAP_CLOSED, SNAP_OPEN], [0, 1]) === 0
        ? 'none'
        : 'flex',
  }))

  const commentButtonStyle = useAnimatedStyle(() => {
    const v = interpolate(translateY.value, [SNAP_OPEN, SNAP_CLOSED], [0, 1])
    return {
      opacity: v,
      transform: [{ translateY: interpolate(v, [0, 1], [20, 0]) }],
    }
  })

  const inputBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [SNAP_CLOSED, SNAP_OPEN], [0, 1]),
  }))

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height)
      }
    )

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0)
      }
    )

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (translateY.value < SNAP_CLOSED) {
          closeComments()
          return true
        }
        return false
      }
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress)
      return () => sub.remove()
    }, [])
  )

  const commentListHeight = SNAP_OPEN - insets.bottom - 60

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        {/* <FlatList
          data={mediaResults}
          keyExtractor={(i) => i.src}
          horizontal
          pagingEnabled
          initialScrollIndex={currentIndex}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item, index }) => (
            <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
              <Animated.View style={[styles.mediaContainer, mediaStyle]}>
                <FullPostMediaItem
                  item={item}
                  index={index}
                  sheetOpen={sheetOpen}
                  currentIndex={mediaIndex}
                  commentButtonStyle={commentButtonStyle}
                  openComments={openComments}
                />
              </Animated.View>
            </View>
          )}
        /> */}

        <FlatList
          data={mediaResults}
          keyExtractor={(i) => i.src}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={currentIndex} // desired start index
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH, // width of each item
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item, index }) => (
            <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
              <Animated.View style={[styles.mediaContainer, mediaStyle]}>
                <FullPostMediaItem
                  item={item}
                  index={index}
                  sheetOpen={sheetOpen}
                  currentIndex={mediaIndex}
                  commentButtonStyle={commentButtonStyle}
                  openComments={openComments}
                />
              </Animated.View>
            </View>
          )}
        />

        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              if (keyboardHeight > 0) {
                Keyboard.dismiss()
                return
              }
              closeComments()
            }}
          />
        </Animated.View>

        <Animated.View
          className="bg-primary dark:bg-dark-primary"
          style={[styles.sheet, sheetStyle]}
        >
          <GestureDetector gesture={panGesture}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
          </GestureDetector>

          <Text style={styles.header}>Comments</Text>
          <View className="flex-1 px-3">
            <CommentPostBox height={commentListHeight} />
          </View>
        </Animated.View>

        {sheetOpen && (
          <Animated.View
            className="bg-primary dark:bg-dark-primary"
            style={[
              {
                position: 'absolute',
                bottom:
                  keyboardHeight > 0
                    ? 0
                    : Platform.OS === 'ios'
                    ? insets.bottom
                    : 0,
                left: 0,
                right: 0,
                zIndex: 50,
              },
              inputBarAnimatedStyle,
            ]}
          >
            <CommentPostSheetInput />
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  mediaContainer: {
    width: '100%',
    position: 'absolute',
  },
  media: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  actions: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  sheet: {
    position: 'absolute',
    top: 0,
    height: SCREEN_HEIGHT,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
  },
  header: {
    color: 'white',
    fontSize: 18,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  commentRow: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
})
