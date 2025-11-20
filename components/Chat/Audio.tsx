import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  useColorScheme,
  ActivityIndicator,
} from 'react-native'
import { Audio } from 'expo-av'
import { Feather } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system'
import { AVPlaybackStatus } from 'expo-av/build/AV'
import { getDeviceWidth } from '@/lib/helpers'
import { MessageStore } from '@/store/notification/Message'
import * as MediaLibrary from 'expo-media-library'

type AudioMessageProps = {
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

const AudioMessage: React.FC<AudioMessageProps> = ({ src, name, isSender }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [durationMillis, setDurationMillis] = useState<number>(0)
  const [positionMillis, setPositionMillis] = useState<number>(0)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const progress = durationMillis ? (positionMillis / durationMillis) * 100 : 0
  const width = getDeviceWidth()
  const { setMessage } = MessageStore()

  useEffect(() => {
    loadSound()

    return () => {
      sound?.unloadAsync()
    }
  }, [src])

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

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const filename = name?.endsWith('.mp3')
        ? name
        : (name ?? 'audio') + '.mp3'

      const downloadUri = (FileSystem as any).documentDirectory + filename

      const downloadResumable = FileSystem.createDownloadResumable(
        src,
        downloadUri
      )

      const { uri } = await downloadResumable.downloadAsync()

      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        alert('Permission to access media library is required!')
        return
      }

      const asset = await MediaLibrary.createAssetAsync(uri)
      await MediaLibrary.createAlbumAsync('Downloads', asset, false)

      setMessage('Audio saved to Downloads folder.', true)
    } catch (err) {
      console.log(err)
      setMessage('Failed to download audio.', false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="flex flex-col w-full mb-2">
      <View className="flex-row items-end">
        <Pressable
          onPress={togglePlay}
          className={`rounded-full text-dark-primary border justify-center items-center mr-2 ${
            isSender ? 'border-border dark:border-dark-border' : 'border-white'
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
            <Text className="text-xs mr-2 text-primary dark:text-dark-primary">
              {formatTime(positionMillis / 1000)} /{' '}
              {formatTime(durationMillis / 1000)}
            </Text>
            <Text className="text-xs text-primary dark:text-dark-primary line-clamp-1 overflow-ellipsis">
              {name}
            </Text>
          </View>
        </View>

        <Pressable
          style={{
            width: width * 0.1,
            height: width * 0.1,
          }}
          onPress={handleDownload}
          className={`rounded-full border justify-center items-center bg-primary dark:bg-dark-primary ${
            isSender ? 'border-border dark:border-dark-border' : 'border-white'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator
              className=""
              size={20}
              color={isSender ? (isDark ? '#BABABA' : '#6E6E6E') : '#fff'}
            />
          ) : (
            <Feather
              name="download"
              size={20}
              color={isSender ? (isDark ? '#BABABA' : '#6E6E6E') : '#fff'}
            />
          )}
        </Pressable>
      </View>
    </View>
  )
}

export default AudioMessage
