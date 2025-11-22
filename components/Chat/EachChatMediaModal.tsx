import React, { useEffect } from 'react'
import { TouchableOpacity, Image, Dimensions } from 'react-native'
import { PlayCircle, X } from 'lucide-react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { PreviewFile } from '@/store/chat/Chat'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type EachChatMediaModalProps = {
  media: PreviewFile
  setOpenModal: (open: boolean) => void
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const EachChatMediaModal: React.FC<EachChatMediaModalProps> = ({
  media,
  setOpenModal,
}) => {
  const insets = useSafeAreaInsets()

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
      // onPress={() => setOpenModal(false)}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpenModal(false)}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        style={{
          position: 'absolute',
          top: insets.top + 10,
          right: 20,
          zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: 25,
          padding: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 10,
        }}
      >
        <X size={32} color="white" strokeWidth={3} />
      </TouchableOpacity>
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
