import React, { useEffect, useRef, useState } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import Animated from 'react-native-reanimated'
import { Video, ResizeMode } from 'expo-av'
import { Feather } from '@expo/vector-icons'
import Slider from '@react-native-community/slider'

interface Props {
  item: any
  index: number
  commentButtonStyle: any
  openComments: () => void
}

export default function MediaItem({
  item,
  commentButtonStyle,
  openComments,
}: Props) {
  const isImage = item.type.includes('image')
  const videoRef = useRef<Video>(null)
  const [status, setStatus] = useState<any>(null)

  /** Auto-play when mounted */
  useEffect(() => {
    if (!isImage && videoRef.current) {
      videoRef.current.playAsync()
    }
    return () => {
      videoRef.current?.pauseAsync()
    }
  }, [])

  /** Toggle play/pause */
  const togglePlay = () => {
    if (!status) return
    status.isPlaying
      ? videoRef.current?.pauseAsync()
      : videoRef.current?.playAsync()
  }

  return (
    <View style={{ flex: 1 }}>
      {isImage ? (
        <Image
          source={{ uri: item.src }}
          style={{ width: '100%', height: '100%' }}
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

          {/* Play button */}
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

          {/* Timeline */}
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

      {/* Comment button */}
      <Animated.View
        style={[
          { position: 'absolute', right: 20, bottom: 20 },
          commentButtonStyle,
        ]}
      >
        <TouchableOpacity onPress={openComments}>
          <Feather name="message-circle" size={32} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}
