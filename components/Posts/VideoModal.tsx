import React, { useEffect } from 'react'
import { View, TouchableOpacity } from 'react-native'

import { useVideoPlayer, VideoView } from 'expo-video'
type VideoModalProps = {
  source: string
  isVisible: boolean
}

const VideoModal: React.FC<VideoModalProps> = ({ source, isVisible }) => {
  const player = useVideoPlayer(source, (player) => {
    player.loop = true
  })

  useEffect(() => {
    if (isVisible) {
      player.play()
    } else {
      player.pause()
    }
  }, [isVisible])

  return (
    <View className="relative w-full h-full justify-center items-center flex-1">
      <TouchableOpacity
        className="z-40 flex-1 bg-transparent absolute left-[50%] translate-x-[-50%] h-10 w-10 items-center justify-center"
        onPress={() => {
          if (player.playing) {
            player.pause()
          } else {
            player.play()
          }
        }}
      />
      <VideoView
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </View>
  )
}

export default VideoModal
