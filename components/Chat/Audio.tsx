import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, useColorScheme } from 'react-native'
import { Audio } from 'expo-av'
import { Feather } from '@expo/vector-icons'
// import * as FileSystem from 'expo-file-system'
import { AVPlaybackStatus } from 'expo-av/build/AV'
import {
  getDeviceWidth,
  handlePendingFileUpload,
  truncateString,
} from '@/lib/helpers'
import { MessageStore } from '@/store/notification/Message'
// import * as MediaLibrary from 'expo-media-library'
import { ChatStore, PreviewFile } from '@/store/chat/Chat'
import Svg, { Circle } from 'react-native-svg'
import { CircleQuestionMark } from 'lucide-react-native'

type AudioMessageProps = {
  item: PreviewFile
  media: PreviewFile[]
  index: number
  chatId: number
  src: string
  isSender: boolean
  name?: string
}

const formatTime = (secs: number) => {
  const minutes = Math.floor(secs / 60)
  const seconds = Math.floor(secs % 60)
    .toString()
    .padStart(2, '0')
  return `${minutes}:${seconds}`
}

const size = 35
const strokeWidth = 4
const radius = (size - strokeWidth) / 2
const circumference = 2 * Math.PI * radius

const AudioMessage: React.FC<AudioMessageProps> = ({
  item,
  media,
  index,
  chatId,
  src,
  name,
  isSender,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [durationMillis, setDurationMillis] = useState<number>(0)
  const [positionMillis, setPositionMillis] = useState<number>(0)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const progress = durationMillis ? (positionMillis / durationMillis) * 100 : 0
  const width = getDeviceWidth()
  const { baseURL } = MessageStore()
  const { updateChatWithFile } = ChatStore()
  const [progressPercent, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (src && src !== undefined && src !== 'undefined') {
      loadSound()
    }
    // handleDownload()
    return () => {
      sound?.unloadAsync()
    }
  }, [src])

  useEffect(() => {
    if (item.status !== 'pending' || !item.uri || !isSender) return

    const upload = async () => {
      setIsUploading(true)

      try {
        const uploaded = await handlePendingFileUpload(
          {
            uri: String(item.uri),
            name: item.name || 'file',
            type: item.type === 'video' ? 'video/mp4' : 'image/jpeg',
            previewUrl: item.type === 'video' ? String(item.previewUrl) : '',
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
                source: uploaded.source,
                url: uploaded.source,
                previewUrl: mediaItem.previewUrl,
                poster: uploaded.poster ?? mediaItem.poster,
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

  const loadSound = async () => {
    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: src },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      )
      setSound(sound)
      if (status.isLoaded) {
        setDurationMillis(status.durationMillis ?? 0)
      }
    } catch (e) {
      console.error('Failed to load sound:', e)
    }
  }

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return

    if (status.didJustFinish) {
      setIsPlaying(false)
      sound?.setPositionAsync(0)
    } else {
      setPositionMillis(status.positionMillis ?? 0)
    }
  }

  const togglePlay = async () => {
    if (!sound) return
    if (isPlaying) {
      await sound.pauseAsync()
    } else {
      await sound.playAsync()
    }
    setIsPlaying(!isPlaying)
  }

  // const handleDownload = async () => {
  //   try {
  //     const filename = name?.endsWith('.mp3')
  //       ? name
  //       : (name ?? 'audio') + '.mp3'

  //     const downloadUri = (FileSystem as any).documentDirectory + filename

  //     const downloadResumable = FileSystem.createDownloadResumable(
  //       src,
  //       downloadUri
  //     )

  //     const { uri } = await downloadResumable.downloadAsync()

  //     const { status } = await MediaLibrary.requestPermissionsAsync()
  //     if (status !== 'granted') {
  //       alert('Permission to access media library is required!')
  //       return
  //     }

  //     const asset = await MediaLibrary.createAssetAsync(uri)
  //     await MediaLibrary.createAlbumAsync('Downloads', asset, false)

  //     setMessage('Audio saved to Downloads folder.', true)
  //   } catch (err) {
  //     console.log(err)
  //     setMessage('Failed to download audio.', false)
  //   } finally {
  //   }
  // }

  return (
    <View className="flex flex-col w-full mb-2">
      <View className="flex-row items-end w-full">
        {isUploading ? (
          <View
            style={{ width: 55, height: 55 }}
            className=" items-center relative justify-center mr-2"
          >
            {isSender ? (
              <>
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
                    strokeDashoffset={
                      circumference * (1 - progressPercent / 100)
                    }
                    strokeLinecap="round"
                  />
                </Svg>
                <Text className="absolute text-white text-xs font-medium">
                  {progressPercent}%
                </Text>
              </>
            ) : (
              <CircleQuestionMark
                size={25}
                color={isSender ? (isDark ? '#BABABA' : '#6E6E6E') : '#fff'}
                className="absolute"
              />
            )}
          </View>
        ) : (
          <Pressable
            onPress={togglePlay}
            className={`rounded-full text-dark-primary border justify-center items-center mr-2 ${
              isSender
                ? 'border-border dark:border-dark-border'
                : 'border-white'
            }`}
            style={{
              width: width * 0.1,
              height: width * 0.1,
            }}
          >
            <Feather
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color={isSender ? (isDark ? '#BABABA' : '#6E6E6E') : '#fff'}
              className={`${isPlaying ? 'ml-0' : 'ml-1'}`}
            />
          </Pressable>
        )}

        <View className="flex-1 mr-2">
          <View
            className={`${
              isSender ? 'bg-gray-300' : 'bg-darkCustom'
            } h-[3px] relative rounded-[10px] overflow-hidden`}
          >
            <View
              style={{ width: `${progress}%` }}
              className={`${
                isSender ? 'bg-custom' : 'bg-white'
              } h-[3px] relative rounded-[10px] overflow-hidden`}
            />
          </View>

          <View className="flex-row justify-between mt-1">
            {item.status !== 'pending' ? (
              <Text
                className={`text-xs mr-2 ${
                  !isSender
                    ? 'text-white'
                    : 'text-primary dark:text-dark-primary'
                }`}
              >
                {formatTime(positionMillis / 1000)} /{' '}
                {formatTime(durationMillis / 1000)}
              </Text>
            ) : (
              <Text
                className={`text-xs mr-2 ${
                  !isSender
                    ? 'text-white'
                    : 'text-primary dark:text-dark-primary'
                }`}
              >
                Uploading
              </Text>
            )}
            <Text
              className={`text-xs ${
                !isSender ? 'text-white' : 'text-primary dark:text-dark-primary'
              } line-clamp-1 overflow-ellipsis`}
            >
              {truncateString(String(name), 25)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AudioMessage
