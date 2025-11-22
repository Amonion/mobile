'use client'
import React, { useEffect, useState } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native'
import { Video, ImageIcon } from 'lucide-react-native'
import Svg, { Circle } from 'react-native-svg'
import { handlePendingFileUpload, mapMimeToPickerType } from '@/lib/helpers'
import { ChatStore, PreviewFile } from '@/store/chat/Chat'
import { MessageStore } from '@/store/notification/Message'

const size = 48
const strokeWidth = 4
const radius = (size - strokeWidth) / 2
const circumference = 2 * Math.PI * radius

type EachMediaProps = {
  item: PreviewFile
  media: PreviewFile[]
  index: number
  totalCount: number
  chatId: number
  onPress: () => void
  isSender: boolean
}

const EachMedia: React.FC<EachMediaProps> = ({
  item,
  media,
  index,
  totalCount,
  chatId,
  onPress,
  isSender,
}) => {
  const { baseURL } = MessageStore()
  const { updateChatWithFile } = ChatStore()
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (item.status !== 'pending' || !item.uri || !isSender) return

    const upload = async () => {
      setIsUploading(true)
      try {
        const uploaded = await handlePendingFileUpload(
          {
            uri: String(item.uri),
            name: item.name || 'file',
            type: mapMimeToPickerType(item.type),
            size: item.size || 0,
            pages: item.pages || 0,
            duration: item.duration || 0,
          },
          baseURL,
          (percent: number) => setProgress(percent),
          item.pages ?? 0,
          item.duration ?? 0
        )

        const updatedMedia = media.map((mediaItem, i) =>
          i === index
            ? {
                ...mediaItem,
                status: 'uploaded' as const,
                url: uploaded.source,
                source: uploaded.source,
                previewUrl: uploaded.source,
                // Keep uri for future reference (optional)
                uri: mediaItem.uri,
              }
            : mediaItem
        )

        updateChatWithFile('/chats', {
          timeNumber: chatId,
          media: updatedMedia,
        })
      } catch (err) {
        console.error('Upload failed:', err)
        const updatedMedia = media.map((mediaItem, i) =>
          i === index ? { ...mediaItem, status: 'failed' as const } : mediaItem
        )
        updateChatWithFile('/chats', {
          timeNumber: chatId,
          media: updatedMedia,
        })
      } finally {
        setIsUploading(false)
      }
    }

    upload()
  }, [item.status, item.uri, isSender, chatId])

  const isImageHeight = () => {
    if (totalCount === 1) return 200
    if (totalCount === 2) return 200
    if (totalCount === 3 && index !== 1) return 100
    if (totalCount === 3 && index === 1) return 200
    return 150
  }
  const isImageWidth = () => {
    if (totalCount === 1) return 200
    if (totalCount === 2) return 200
    if (totalCount === 3 && index !== 1) return 100
    if (totalCount === 3 && index === 1) return 200
    return 150
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="relative overflow-hidden rounded-lg bg-secondary dark:bg-dark-secondary"
      style={{
        width: isImageWidth(),
      }}
    >
      {!isSender && item.status === 'pending' && (
        <View className="absolute inset-0 z-10 items-center justify-center bg-black/40">
          <ActivityIndicator size="small" color="#fff" />
          <Text className="mt-2 text-xs text-white">Uploading...</Text>
        </View>
      )}

      {isSender &&
        (isUploading || progress > 0) &&
        item.status !== 'uploaded' && (
          <View className="absolute inset-0 z-20 items-center justify-center bg-black/50">
            <Svg
              width={size}
              height={size}
              style={{ transform: [{ rotate: '-90deg' }] }}
            >
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#374151"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#4B7FFF"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress / 100)}
                strokeLinecap="round"
              />
            </Svg>
            <Text className="absolute text-white text-xs font-medium">
              {progress}%
            </Text>
          </View>
        )}

      {item.type.includes('image') ? (
        <Image
          source={{ uri: item.previewUrl || item.url || item.uri }}
          style={{
            width: '100%',
            height: isImageHeight(),
            resizeMode: totalCount === 1 ? 'contain' : 'cover',
          }}
        />
      ) : item.type.includes('video') ? (
        <View className="h-full w-full items-center justify-center bg-black/20">
          <Video size={40} color="white" />
        </View>
      ) : null}

      <View className="absolute top-2 left-2 z-10 rounded-full bg-black/60 p-1.5">
        {item.type.includes('image') ? (
          <ImageIcon size={14} color="white" />
        ) : (
          <Video size={14} color="white" />
        )}
      </View>
    </TouchableOpacity>
  )
}

export default EachMedia
