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
// } from 'react-native-reanimated'
// import { Feather } from '@expo/vector-icons'
// import CommentPostSheetInput from '@/components/Posts/CommentPostSheetInput'
// import { useFocusEffect } from '@react-navigation/native'
// import { useSafeAreaInsets } from 'react-native-safe-area-context'
// import { runOnJS } from 'react-native-worklets'
// import { PostStore } from '@/store/post/Post'
// import { ResizeMode, Video } from 'expo-av'

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')
// const SNAP_OPEN = SCREEN_HEIGHT / 2
// const SNAP_CLOSED = SCREEN_HEIGHT

// export default function FullMediaScreen() {
//   const translateY = useSharedValue(SNAP_CLOSED)
//   const insets = useSafeAreaInsets()
//   const [sheetOpen, setSheetOpen] = React.useState(false)
//   const { mediaResults } = PostStore()

//   const openComments = () => {
//     setSheetOpen(true)
//     translateY.value = withTiming(SNAP_OPEN, {
//       duration: 300,
//       easing: Easing.out(Easing.ease),
//     })
//   }

//   const closeComments = () => {
//     translateY.value = withTiming(
//       SNAP_CLOSED,
//       { duration: 300, easing: Easing.out(Easing.ease) },
//       () => {
//         runOnJS(setSheetOpen)(false)
//       }
//     )
//   }

//   const panGesture = Gesture.Pan()
//     .onUpdate((e) => {
//       translateY.value = Math.max(SNAP_OPEN, translateY.value + e.translationY)
//     })
//     .onEnd((e) => {
//       const goingDown = e.velocityY > 300
//       translateY.value = withTiming(goingDown ? SNAP_CLOSED : SNAP_OPEN, {
//         duration: 250,
//         easing: Easing.out(Easing.ease),
//       })
//     })

//   const mediaStyle = useAnimatedStyle(() => {
//     const progress = interpolate(
//       translateY.value,
//       [SNAP_CLOSED, SNAP_OPEN],
//       [0, 1],
//       Extrapolate.CLAMP
//     )

//     const height = SCREEN_HEIGHT - progress * SNAP_OPEN

//     return {
//       height,
//       width: SCREEN_WIDTH,
//       paddingTop: insets.top,
//     }
//   })

//   const sheetStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }],
//     opacity: translateY.value === SNAP_CLOSED ? 0 : 1,
//   }))

//   const backdropStyle = useAnimatedStyle(() => {
//     const opacity = interpolate(
//       translateY.value,
//       [SNAP_CLOSED, SNAP_OPEN],
//       [0, 0.5],
//       Extrapolate.CLAMP
//     )
//     return { opacity, display: opacity === 0 ? 'none' : 'flex' }
//   })

//   const commentButtonStyle = useAnimatedStyle(() => {
//     const visible = interpolate(
//       translateY.value,
//       [SNAP_OPEN, SNAP_CLOSED],
//       [0, 1],
//       Extrapolate.CLAMP
//     )
//     return {
//       opacity: visible,
//       transform: [
//         {
//           translateY: interpolate(visible, [0, 1], [20, 0], Extrapolate.CLAMP),
//         },
//       ],
//     }
//   })

//   const inputBarAnimatedStyle = useAnimatedStyle(() => {
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

//   const renderMedia = ({ item }: any) => {
//     const isImage = item.type.includes('image')
//     return (
//       <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
//         <Animated.View style={[styles.mediaContainer, mediaStyle]}>
//           {isImage ? (
//             <Image source={{ uri: item.src }} style={styles.media} />
//           ) : (
//             <Video
//               source={{ uri: item.src }}
//               style={styles.media}
//               resizeMode={ResizeMode.CONTAIN}
//               isLooping
//             />
//           )}

//           <Animated.View style={[styles.actions, commentButtonStyle]}>
//             <TouchableOpacity onPress={openComments}>
//               <Feather name="message-circle" size={32} color="white" />
//             </TouchableOpacity>
//           </Animated.View>
//         </Animated.View>
//       </View>
//     )
//   }

//   const commentListHeight = SNAP_OPEN - insets.bottom - 60

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <View style={{ flex: 1, backgroundColor: 'black' }}>
//         {/* Media */}
//         <FlatList
//           data={mediaResults}
//           renderItem={renderMedia}
//           keyExtractor={(i) => i.src}
//           horizontal
//           pagingEnabled
//           showsHorizontalScrollIndicator={false}
//         />

//         <Animated.View style={[styles.backdrop, backdropStyle]}>
//           <TouchableOpacity style={{ flex: 1 }} onPress={closeComments} />
//         </Animated.View>

//         <Animated.View
//           className={`bg-primary dark:bg-dark-primary`}
//           style={[styles.sheet, sheetStyle]}
//         >
//           <GestureDetector gesture={panGesture}>
//             <View style={styles.dragHandleContainer}>
//               <View style={styles.dragHandle} />
//             </View>
//           </GestureDetector>

//           <Text style={styles.header}>Comments</Text>
//           <View style={{ height: commentListHeight }} className="">
//             <FlatList
//               data={Array.from({ length: 30 }).map((_, i) => ({
//                 id: i,
//                 text: `Comment number ${i + 1}`,
//               }))}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={({ item }) => (
//                 <View style={styles.commentRow}>
//                   <Text style={{ color: 'white', fontSize: 16 }}>
//                     {item.text}
//                   </Text>
//                 </View>
//               )}
//             />
//           </View>
//         </Animated.View>

//         {/* Input bar */}
//         {sheetOpen && (
//           <Animated.View
//             className={'bg-primary dark:bg-dark-primary'}
//             style={[
//               {
//                 position: 'absolute',
//                 bottom: 0,
//                 left: 0,
//                 right: 0,
//                 zIndex: 50,
//               },
//               inputBarAnimatedStyle,
//             ]}
//           >
//             <CommentPostSheetInput />
//           </Animated.View>
//         )}
//       </View>
//     </KeyboardAvoidingView>
//   )
// }

// const styles = StyleSheet.create({
//   mediaContainer: {
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
//     bottom: 20,
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
import { PostStore } from '@/store/post/Post'
import FullPostMediaItem from '@/components/Posts/FullPostMediaItem'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')
const SNAP_OPEN = SCREEN_HEIGHT / 2
const SNAP_CLOSED = SCREEN_HEIGHT

export default function FullMediaScreen() {
  const translateY = useSharedValue(SNAP_CLOSED)
  const insets = useSafeAreaInsets()
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const { mediaResults } = PostStore()

  /** OPEN COMMENTS */
  const openComments = () => {
    setSheetOpen(true)
    translateY.value = withTiming(SNAP_OPEN, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    })
  }

  /** CLOSE COMMENTS */
  const closeComments = () => {
    translateY.value = withTiming(
      SNAP_CLOSED,
      { duration: 300, easing: Easing.out(Easing.ease) },
      () => runOnJS(setSheetOpen)(false)
    )
  }

  /** DRAG GESTURE */
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

  /** SHEET ANIMATION */
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: translateY.value === SNAP_CLOSED ? 0 : 1,
  }))

  /** BACKDROP */
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [SNAP_CLOSED, SNAP_OPEN], [0, 0.5]),
    display:
      interpolate(translateY.value, [SNAP_CLOSED, SNAP_OPEN], [0, 1]) === 0
        ? 'none'
        : 'flex',
  }))

  /** SHOW/HIDE COMMENT BUTTON */
  const commentButtonStyle = useAnimatedStyle(() => {
    const v = interpolate(translateY.value, [SNAP_OPEN, SNAP_CLOSED], [0, 1])
    return {
      opacity: v,
      transform: [{ translateY: interpolate(v, [0, 1], [20, 0]) }],
    }
  })

  /** INPUT BAR */
  const inputBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [SNAP_CLOSED, SNAP_OPEN], [0, 1]),
  }))

  /** BACK BUTTON HANDLER */
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
        {/* MEDIA LIST */}
        <FlatList
          data={mediaResults}
          keyExtractor={(i) => i.src}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
              <Animated.View style={[styles.mediaContainer, mediaStyle]}>
                <FullPostMediaItem
                  item={item}
                  index={index}
                  commentButtonStyle={commentButtonStyle}
                  openComments={openComments}
                />
              </Animated.View>
            </View>
          )}
        />

        {/* BACKDROP */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={closeComments} />
        </Animated.View>

        {/* COMMENT SHEET */}
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
          <View style={{ height: commentListHeight }}>
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
          </View>
        </Animated.View>

        {/* INPUT BAR */}
        {sheetOpen && (
          <Animated.View
            className="bg-primary dark:bg-dark-primary"
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
