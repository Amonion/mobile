// import React from 'react'
// import {
//   View,
//   Text,
//   Dimensions,
//   TouchableOpacity,
//   Image,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   BackHandler,
// } from 'react-native'
// import { Gesture, GestureDetector } from 'react-native-gesture-handler'
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   interpolate,
//   Extrapolate,
//   Easing,
//   useAnimatedScrollHandler,
// } from 'react-native-reanimated'
// import { Feather } from '@expo/vector-icons'
// import CommentPostSheetInput from '@/components/Posts/CommentPostSheetInput'
// import { useFocusEffect } from '@react-navigation/native'

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

// const HIDE_OFFSET = 90
// const SNAP_CLOSED = SCREEN_HEIGHT + HIDE_OFFSET
// const SNAP_OPEN = SCREEN_HEIGHT * 0.35

// const MEDIA_DATA = [
//   { id: '1', src: require('@/assets/images/graduate.png') },
//   { id: '2', src: require('@/assets/images/graduate.png') },
//   { id: '3', src: require('@/assets/images/graduate.png') },
// ]

// export default function FullMediaScreen() {
//   const translateY = useSharedValue(SNAP_CLOSED)

//   /** COMMENT SHEET CONTROLS */
//   const openComments = () => {
//     translateY.value = withTiming(SNAP_OPEN, {
//       duration: 250,
//       easing: Easing.out(Easing.ease),
//     })
//   }

//   const closeComments = () => {
//     translateY.value = withTiming(SNAP_CLOSED, {
//       duration: 250,
//       easing: Easing.out(Easing.ease),
//     })
//   }

//   /** DRAG TO CLOSE */
//   const panGesture = Gesture.Pan()
//     .onUpdate((e) => {
//       translateY.value = Math.max(SNAP_OPEN, SNAP_OPEN + e.translationY)
//     })
//     .onEnd((e) => {
//       const goingDown = e.velocityY > 300
//       translateY.value = withTiming(goingDown ? SNAP_CLOSED : SNAP_OPEN, {
//         duration: 250,
//         easing: Easing.out(Easing.ease),
//       })
//     })

//   /** MEDIA ANIMATION */
//   const mediaStyle = useAnimatedStyle(() => {
//     const offset = interpolate(
//       translateY.value,
//       [SNAP_CLOSED, SNAP_OPEN],
//       [0, -SCREEN_HEIGHT * 0.32],
//       Extrapolate.CLAMP
//     )

//     const scale = interpolate(
//       translateY.value,
//       [SNAP_CLOSED, SNAP_OPEN],
//       [1, 0.65],
//       Extrapolate.CLAMP
//     )

//     return { transform: [{ translateY: offset }, { scale }] }
//   })

//   /** COMMENT SHEET ANIMATION */
//   const sheetStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }],
//   }))

//   /** BACKDROP DIM */
//   const backdropStyle = useAnimatedStyle(() => {
//     const opacity = interpolate(
//       translateY.value,
//       [SNAP_CLOSED, SNAP_OPEN],
//       [0, 0.5],
//       Extrapolate.CLAMP
//     )

//     return {
//       opacity,
//       display: opacity === 0 ? 'none' : 'flex',
//     }
//   })

//   /** SHOW COMMENT INPUT BAR ONLY WHEN SHEET IS OPEN */
//   const inputBarStyle = useAnimatedStyle(() => {
//     const visible = interpolate(
//       translateY.value,
//       [SNAP_CLOSED, SNAP_OPEN],
//       [0, 1],
//       Extrapolate.CLAMP
//     )

//     return {
//       opacity: visible,
//       transform: [
//         {
//           translateY: interpolate(visible, [0, 1], [50, 0], Extrapolate.CLAMP),
//         },
//       ],
//     }
//   })

//   /** HIDE COMMENT ICON WHEN SHEET IS OPEN */
//   const commentButtonStyle = useAnimatedStyle(() => {
//     const visible = interpolate(
//       translateY.value,
//       [SNAP_CLOSED, SNAP_OPEN],
//       [1, 0], // 1 = fully visible, 0 = hidden
//       Extrapolate.CLAMP
//     )

//     return {
//       opacity: visible,
//       transform: [
//         {
//           translateY: interpolate(
//             visible,
//             [0, 1],
//             [20, 0], // slide down slightly when hiding
//             Extrapolate.CLAMP
//           ),
//         },
//       ],
//     }
//   })

//   /** ANDROID BACK BUTTON CLOSES SHEET */
//   useFocusEffect(
//     React.useCallback(() => {
//       const onBackPress = () => {
//         if (translateY.value < SNAP_CLOSED) {
//           closeComments()
//           return true
//         }
//         return false
//       }

//       const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress)
//       return () => sub.remove()
//     }, [])
//   )

//   /** RENDER SINGLE MEDIA ITEM */
//   const renderMedia = ({ item }: any) => (
//     <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
//       <Animated.View style={[styles.mediaContainer, mediaStyle]}>
//         <Image source={item.src} style={styles.media} />
//         <Animated.View style={[styles.actions, commentButtonStyle]}>
//           <TouchableOpacity onPress={openComments}>
//             <Feather name="message-circle" size={32} color="white" />
//           </TouchableOpacity>
//         </Animated.View>
//       </Animated.View>
//     </View>
//   )

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <View style={{ flex: 1, backgroundColor: 'black' }}>
//         {/* SWIPABLE MEDIA LIST */}
//         <FlatList
//           data={MEDIA_DATA}
//           renderItem={renderMedia}
//           keyExtractor={(i) => i.id}
//           horizontal
//           pagingEnabled
//           showsHorizontalScrollIndicator={false}
//         />

//         {/* DIM BACKDROP */}
//         <Animated.View style={[styles.backdrop, backdropStyle]}>
//           <TouchableOpacity style={{ flex: 1 }} onPress={closeComments} />
//         </Animated.View>

//         {/* COMMENT SHEET */}
//         <Animated.View style={[styles.sheet, sheetStyle]}>
//           <GestureDetector gesture={panGesture}>
//             <View style={styles.dragHandleContainer}>
//               <View style={styles.dragHandle} />
//             </View>
//           </GestureDetector>

//           <Text style={styles.header}>Comments</Text>

//           <FlatList
//             data={Array.from({ length: 30 }).map((_, i) => ({
//               id: i,
//               text: `Comment number ${i + 1}`,
//             }))}
//             keyExtractor={(item) => item.id.toString()}
//             renderItem={({ item }) => (
//               <View style={styles.commentRow}>
//                 <Text style={{ color: 'white', fontSize: 16 }}>
//                   {item.text}
//                 </Text>
//               </View>
//             )}
//           />
//         </Animated.View>

//         {/* INPUT BAR */}
//         <Animated.View
//           className="bg-primary dark:bg-dark-primary pb-2 px-3"
//           style={[
//             {
//               position: 'absolute',
//               bottom: 0,
//               left: 0,
//               right: 0,
//               zIndex: 50,
//             },
//             inputBarStyle,
//           ]}
//           pointerEvents={translateY.value === SNAP_CLOSED ? 'none' : 'auto'}
//         >
//           <CommentPostSheetInput />
//         </Animated.View>
//       </View>
//     </KeyboardAvoidingView>
//   )
// }

// const styles = StyleSheet.create({
//   mediaContainer: {
//     height: '100%',
//     width: '100%',
//     position: 'absolute',
//   },
//   media: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'contain',
//     backgroundColor: 'black',
//   },
//   actions: {
//     position: 'absolute',
//     right: 20,
//     bottom: 120,
//   },
//   backdrop: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'black',
//   },
//   sheet: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: SCREEN_HEIGHT,
//     backgroundColor: '#1A1A1A',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingTop: 10,
//   },
//   dragHandleContainer: {
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   dragHandle: {
//     width: 45,
//     height: 6,
//     backgroundColor: '#333',
//     borderRadius: 3,
//   },
//   header: {
//     color: 'white',
//     fontSize: 18,
//     paddingHorizontal: 20,
//     marginBottom: 10,
//   },
//   commentRow: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#333',
//   },
// })
import React from 'react'
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
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
import CommentPostSheetInput from '@/components/Posts/CommentPostSheetInput'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { runOnJS } from 'react-native-worklets'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')
const SNAP_OPEN = SCREEN_HEIGHT * 0.5
const SNAP_CLOSED = SCREEN_HEIGHT

const MEDIA_DATA = [
  { id: '1', src: require('@/assets/images/graduate.png') },
  { id: '2', src: require('@/assets/images/graduate.png') },
  { id: '3', src: require('@/assets/images/graduate.png') },
]

export default function FullMediaScreen() {
  const translateY = useSharedValue(SNAP_CLOSED)
  const insets = useSafeAreaInsets()
  const [sheetOpen, setSheetOpen] = React.useState(false)
  /** OPEN/CLOSE SHEET */
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
      () => {
        runOnJS(setSheetOpen)(false)
      }
    )
  }

  /** DRAG TO CLOSE */
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

  /** MEDIA ANIMATION */
  const mediaStyle = useAnimatedStyle(() => {
    // progress: 0 = sheet closed, 1 = sheet open
    const progress = interpolate(
      translateY.value,
      [SNAP_CLOSED, SNAP_OPEN],
      [0, 1],
      Extrapolate.CLAMP
    )

    // Media height shrinks from full screen to remaining above sheet
    const height = SCREEN_HEIGHT - progress * SNAP_OPEN

    return {
      height,
      width: SCREEN_WIDTH,
      paddingTop: insets.top,
    }
  })

  /** COMMENT SHEET ANIMATION */
  /** COMMENT SHEET ANIMATION */
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    // hide completely when closed
    opacity: translateY.value === SNAP_CLOSED ? 0 : 1,
  }))

  /** BACKDROP DIM */
  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SNAP_CLOSED, SNAP_OPEN],
      [0, 0.5],
      Extrapolate.CLAMP
    )
    return { opacity, display: opacity === 0 ? 'none' : 'flex' }
  })

  /** COMMENT ICON ANIMATION */
  const commentButtonStyle = useAnimatedStyle(() => {
    const visible = interpolate(
      translateY.value,
      [SNAP_OPEN, SNAP_CLOSED],
      [0, 1],
      Extrapolate.CLAMP
    )
    return {
      opacity: visible,
      transform: [
        {
          translateY: interpolate(visible, [0, 1], [20, 0], Extrapolate.CLAMP),
        },
      ],
    }
  })

  /** INPUT BAR */
  const inputBarStyle = useAnimatedStyle(() => {
    const visible = interpolate(
      translateY.value,
      [SNAP_CLOSED, SNAP_OPEN],
      [0, 1],
      Extrapolate.CLAMP
    )
    return {
      opacity: visible,
      transform: [
        {
          translateY: interpolate(visible, [0, 1], [50, 0], Extrapolate.CLAMP),
        },
      ],
    }
  })

  const inputBarAnimatedStyle = useAnimatedStyle(() => {
    const visible = interpolate(
      translateY.value,
      [SNAP_CLOSED, SNAP_OPEN],
      [0, 1],
      Extrapolate.CLAMP
    )
    return {
      opacity: visible,
      transform: [
        {
          translateY: interpolate(visible, [0, 1], [50, 0], Extrapolate.CLAMP),
        },
      ],
    }
  })

  /** ANDROID BACK BUTTON */
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

  /** RENDER MEDIA ITEM */
  const renderMedia = ({ item }: any) => (
    <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
      <Animated.View style={[styles.mediaContainer, mediaStyle]}>
        <Image source={item.src} style={styles.media} />
        <Animated.View style={[styles.actions, commentButtonStyle]}>
          <TouchableOpacity onPress={openComments}>
            <Feather name="message-circle" size={32} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  )

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        {/* SWIPABLE MEDIA */}
        <FlatList
          data={MEDIA_DATA}
          renderItem={renderMedia}
          keyExtractor={(i) => i.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        />

        {/* BACKDROP */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={closeComments} />
        </Animated.View>

        <Animated.View
          className={`bg-primary dark:bg-dark-primary`}
          style={[styles.sheet, sheetStyle]}
        >
          <GestureDetector gesture={panGesture}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
          </GestureDetector>

          <Text style={styles.header}>Comments</Text>

          <FlatList
            data={Array.from({ length: 30 }).map((_, i) => ({
              id: i,
              text: `Comment number ${i + 1}`,
            }))}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <Text style={{ color: 'white', fontSize: 16 }}>
                  {item.text}
                </Text>
              </View>
            )}
          />
        </Animated.View>
        {sheetOpen && (
          <Animated.View
            className={`bg-primary dark:bg-dark-primary`}
            style={[
              {
                position: 'absolute',
                bottom: 0,
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
    backgroundColor: 'black',
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
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
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
