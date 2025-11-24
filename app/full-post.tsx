import React from 'react'
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  Easing,
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

// ✔ Comment sheet sits completely below screen
const HIDE_OFFSET = 90
const SNAP_CLOSED = SCREEN_HEIGHT + HIDE_OFFSET
const SNAP_OPEN = SCREEN_HEIGHT * 0.35 // push media up

export default function FullMediaScreen() {
  const translateY = useSharedValue(SNAP_CLOSED)

  const openComments = () => {
    translateY.value = withTiming(SNAP_OPEN, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    })
  }

  const closeComments = () => {
    translateY.value = withTiming(SNAP_CLOSED, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    })
  }

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(SNAP_OPEN, SNAP_OPEN + e.translationY)
    })
    .onEnd((e) => {
      const goingDown = e.velocityY > 300
      translateY.value = withTiming(goingDown ? SNAP_CLOSED : SNAP_OPEN, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      })
    })

  /** MEDIA ANIMATION */
  const mediaStyle = useAnimatedStyle(() => {
    const offset = interpolate(
      translateY.value,
      [SNAP_CLOSED, SNAP_OPEN],
      [0, -SCREEN_HEIGHT * 0.35],
      Extrapolate.CLAMP
    )

    const scale = interpolate(
      translateY.value,
      [SNAP_CLOSED, SNAP_OPEN],
      [1, 0.65],
      Extrapolate.CLAMP
    )

    return {
      transform: [{ translateY: offset }, { scale }],
    }
  })

  /** COMMENT SHEET ANIMATION */
  const sheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  })

  /** BACKDROP */
  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SNAP_CLOSED, SNAP_OPEN],
      [0, 0.5],
      Extrapolate.CLAMP
    )

    return {
      opacity,
      display: opacity === 0 ? 'none' : 'flex',
    }
  })

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {/* MEDIA CONTENT */}
      <Animated.View style={[styles.mediaContainer, mediaStyle]}>
        <Image
          source={require('@/assets/images/graduate.png')}
          style={styles.media}
        />

        <View style={styles.actions}>
          <TouchableOpacity onPress={openComments}>
            <Feather name="message-circle" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* BACKDROP */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={closeComments} />
      </Animated.View>

      {/* COMMENT SHEET */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
        </GestureDetector>

        <Text style={styles.header}>Comments</Text>

        <FlatList
          data={Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            text: `Comment number ${i + 1}`,
          }))}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.commentRow}>
              <Text style={{ color: 'white', fontSize: 16 }}>{item.text}</Text>
            </View>
          )}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  mediaContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  media: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: 'black',
  },

  actions: {
    position: 'absolute',
    right: 20,
    bottom: 120,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },

  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },

  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 45,
    height: 6,
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
