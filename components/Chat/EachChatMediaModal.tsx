import React, { useEffect } from 'react'
import { TouchableOpacity, Image, Dimensions } from 'react-native'
import { PlayCircle } from 'lucide-react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { PreviewFile } from '@/store/chat/Chat'

type EachChatMediaModalProps = {
  media: PreviewFile
  setOpenModal: (open: boolean) => void
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const EachChatMediaModal: React.FC<EachChatMediaModalProps> = ({
  media,
  setOpenModal,
}) => {
  const player = useVideoPlayer(String(media.url), (status: any) => {
    if (status?.state === 'ended') {
      setOpenModal(false)
    }
  })

  useEffect(() => {
    if (player) {
      player.play()
    }
  }, [player])

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={() => setOpenModal(false)}
    >
      {media.type.includes('video') && (
        <>
          <PlayCircle
            size={50}
            color="#4B7FFF"
            style={{ position: 'absolute', zIndex: 10 }}
          />
          <VideoView
            player={player}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: [{ translateY: -Dimensions.get('window').height / 2 }],
            }}
            contentFit="contain"
          />
        </>
      )}
      {media.type.includes('image') && (
        <Image
          source={{ uri: media.url }}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT * 0.9,
            resizeMode: 'contain',
            borderRadius: 8,
          }}
        />
      )}
    </TouchableOpacity>
  )
}

export default EachChatMediaModal
