import React, { useRef, useState } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
} from 'react-native-reanimated'
import { Video, ResizeMode } from 'expo-av'
import { Feather } from '@expo/vector-icons'
import Slider from '@react-native-community/slider'
import { PostStore } from '@/store/post/Post'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'

interface Props {
  item: any
  index: number
  sheetOpen: boolean
  currentIndex: SharedValue<number>
  commentButtonStyle: any
  openComments: () => void
}

export default function MediaItem({
  item,
  commentButtonStyle,
  sheetOpen,
  currentIndex,
  openComments,
}: Props) {
  const isImage = item.type.includes('image')
  const videoRef = useRef<Video>(null)
  const [status, setStatus] = useState<any>(null)
  const { mediaResults } = PostStore()
  const insets = useSafeAreaInsets()

  const logIndex = (value: number) => {
    const i = mediaResults.findIndex((e) => e.src === item.src)
    if (!isImage && videoRef.current && i === value) {
      videoRef.current.playAsync()
    } else {
      videoRef.current?.pauseAsync()
    }
  }

  useAnimatedReaction(
    () => currentIndex.value,
    (newValue, oldValue) => {
      if (newValue !== oldValue) {
        runOnJS(logIndex)(newValue)
      }
    }
  )

  const togglePlay = () => {
    if (!status) return
    status.isPlaying
      ? videoRef.current?.pauseAsync()
      : videoRef.current?.playAsync()
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        className="absolute z-40 right-3 top-2 rounded-full w-10 h-10 flex justify-center items-center bg-black/50"
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        onPress={() => router.back()}
      >
        <X size={30} color="white" />
      </TouchableOpacity>
      {isImage ? (
        <Image
          source={{ uri: item.src }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: sheetOpen ? 'contain' : 'cover',
          }}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <Video
            ref={videoRef}
            source={{ uri: item.src }}
            style={{ width: '100%', height: '100%' }}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            onPlaybackStatusUpdate={(s) => setStatus(s)}
          />

          <TouchableOpacity
            onPress={togglePlay}
            style={{
              position: 'absolute',
              top: '45%',
              left: '45%',
              zIndex: 20,
            }}
          >
            <Feather
              name={status?.isPlaying ? 'pause' : 'play'}
              size={48}
              color="white"
            />
          </TouchableOpacity>

          {status && status.durationMillis > 0 && (
            <Slider
              value={status.positionMillis}
              minimumValue={0}
              maximumValue={status.durationMillis}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#777"
              thumbTintColor="#fff"
              onSlidingComplete={(v) => videoRef.current?.setPositionAsync(v)}
              style={{
                position: 'absolute',
                bottom: 30,
                left: 20,
                right: 20,
              }}
            />
          )}
        </View>
      )}

      <Animated.View
        style={[
          { position: 'absolute', zIndex: 30, right: 20, bottom: 20 },
          commentButtonStyle,
        ]}
      >
        <TouchableOpacity
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          onPress={openComments}
        >
          <Feather name="message-circle" size={32} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}
