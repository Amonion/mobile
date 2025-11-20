'use client'
import { handlePendingFileUpload, mapMimeToPickerType } from '@/lib/helpers'
import { useEffect, useState } from 'react'
import MediaModal from './ChatMediaModal'
import { ChatContent, ChatStore } from '@/store/chat/Chat'
import { AuthStore } from '@/store/AuthStore'
import { MessageStore } from '@/store/notification/Message'
import { Video, ImageIcon } from 'lucide-react-native'
import {
  View,
  Image,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import Svg, { Circle } from 'react-native-svg'

type ChatContentProps = {
  e: ChatContent
}

const size = 48 // width/height
const strokeWidth = 4
const radius = (size - strokeWidth) / 2
const circumference = 2 * Math.PI * radius

const ChatMediaDisplay = ({ e }: ChatContentProps) => {
  const { user } = AuthStore()
  const { baseURL } = MessageStore()
  const { updateChatWithFile } = ChatStore()
  const [progress, setProgress] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const isSender = e.senderUsername === user?.username

  useEffect(() => {
    const uploadPendingMedia = async () => {
      if (!e.media || e.media.length === 0) return

      const pendingItems = e.media.filter(
        (m) => m.status === 'pending' && m.uri
      )
      if (pendingItems.length === 0) return

      try {
        const updatedMedia = await Promise.all(
          e.media.map(async (item) => {
            if (item.status === 'pending' && item.uri) {
              try {
                const uploaded = await handlePendingFileUpload(
                  {
                    uri: item.uri,
                    name: item.name,
                    type: mapMimeToPickerType(item.type),
                    size: item.size,
                    pages: item.pages,
                    duration: item.duration,
                  },
                  baseURL,
                  (percent: number) => setProgress(percent),
                  item.pages ?? 0,
                  item.duration ?? 0
                )

                return {
                  ...item,
                  status: 'uploaded',
                  url: uploaded.source,
                  source: uploaded.source,
                  previewUrl: uploaded.source,
                }
              } catch (err) {
                console.error(`❌ Error uploading ${item.name}:`, err)
                return item
              }
            }
            return item
          })
        )

        const updatedChat = { ...e, media: updatedMedia }
        updateChatWithFile('/chats', updatedChat)
      } catch (err) {
        console.error('❌ Uploading pending media failed:', err)
      }
    }

    uploadPendingMedia()
  }, [e])

  const mediaCount = e.media.length

  const containerStyle = [styles.container, mediaCount >= 3 && { height: 200 }]

  return (
    <>
      <View style={containerStyle}>
        {e.media.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setActiveIndex(index)
              setOpenModal(true)
            }}
            className="relative cursor-pointer group rounded-lg overflow-hidden flex items-center justify-center"
          >
            {item.status === 'pending' && isSender && progress === 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 128, // h-32
                }}
              >
                <ActivityIndicator size="large" color="#9CA3AF" />
              </View>
            )}

            {isSender && progress > 0 && item.status !== 'uploaded' && (
              <View
                style={{
                  position: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  zIndex: 20,
                  marginBottom: 8,
                }}
              >
                <Svg
                  width={size}
                  height={size}
                  style={{ transform: [{ rotate: '-90deg' }] }}
                >
                  {/* Background circle */}
                  <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#e5e7eb" // light gray
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#4B7FFF" // replace with your custom color
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference * (1 - (progress ?? 0) / 100)
                    }
                    strokeLinecap="round"
                  />
                </Svg>

                {/* Percent text */}
                <View
                  style={{
                    position: 'absolute',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{ color: 'white', fontSize: 12, fontWeight: '500' }}
                  >
                    {progress ? `${progress}%` : '...'}
                  </Text>
                </View>
              </View>
            )}

            {item.status === 'pending' && !isSender ? (
              <View
                style={{
                  width: '100%',
                  height: 128,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ActivityIndicator
                  size="large"
                  color="#9CA3AF"
                  style={{ marginBottom: 8 }}
                />
                <Text style={{ fontSize: 12, color: '#6B7280' }}>
                  Uploading...
                </Text>
              </View>
            ) : item.type.includes('image') ? (
              <Image
                source={{ uri: item.previewUrl || item.url }}
                style={{
                  width: '100%',
                  height:
                    e.media.length === 1
                      ? undefined
                      : e.media.length === 2
                      ? 200
                      : e.media.length === 3 && index !== 1
                      ? 100
                      : e.media.length === 3 && index === 1
                      ? 200
                      : 150, // fallback
                  resizeMode: e.media.length === 1 ? 'contain' : 'cover',
                }}
              />
            ) : null}

            <View
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 9999,
                height: 24,
                width: 24,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {item.type.includes('image') ? (
                <ImageIcon size={12} color="white" />
              ) : item.type.includes('video') ? (
                <Video size={12} color="white" />
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <MediaModal
        setOpenModal={setOpenModal}
        openModal={openModal}
        media={e.media}
        activeIndex={activeIndex}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
    zIndex: 40,

    // If your RN version supports gap:
    // gap: 8,

    // If not, use margin in children instead
  },
})

export default ChatMediaDisplay
