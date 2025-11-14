import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useColorScheme,
  Pressable,
  Dimensions,
} from 'react-native'
import * as NavigationBar from 'expo-navigation-bar'
import { useRouter } from 'expo-router'
import { X } from 'lucide-react-native'
import { Video, ResizeMode } from 'expo-av'
import { MomentStore } from '@/store/post/Moment'
import MomentProgressBar from '@/components/Moments/MomentProgressBar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'

export default function CreateMoment() {
  const router = useRouter()
  const videoRef = useRef<Video>(null)
  const {
    activeMoment,
    moments,
    activeMomentIndex,
    activeMomentMediaIndex,
    activeMomentMedia,
    isPlaying,
    openMomentModal,
    changeActiveMomentMedia,
    setIsPlaying,
  } = MomentStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const backgroundColor = isDark ? '#1C1E21' : '#FFFFFF'
  const insets = useSafeAreaInsets()

  useEffect(() => {
    setIsPlaying(true)
    return () => setIsPlaying(false)
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      const enableImmersive = async () => {
        try {
          await NavigationBar.setVisibilityAsync('hidden')
          await NavigationBar.setBehaviorAsync('overlay-swipe')
          // StatusBar.setHidden(true)
        } catch (e) {
          console.warn('Failed to enter immersive mode:', e)
        }
      }

      const restoreBars = async () => {
        try {
          await NavigationBar.setVisibilityAsync('visible')
          await NavigationBar.setBehaviorAsync('inset-swipe')
          // StatusBar.setHidden(false)
        } catch (e) {
          console.warn('Failed to restore bars:', e)
        }
      }

      enableImmersive()
      return () => restoreBars()
    }, [])
  )

  const handleNext = () => {
    if (activeMomentMediaIndex + 1 < activeMoment.media.length) {
      changeActiveMomentMedia(activeMomentMediaIndex + 1, activeMomentIndex)
    } else if (activeMomentIndex + 1 < moments.length) {
      openMomentModal(activeMomentIndex + 1)
    } else {
      router.back()
    }
  }

  const handlePrev = () => {
    if (activeMomentMediaIndex > 0) {
      changeActiveMomentMedia(activeMomentMediaIndex - 1, activeMomentIndex)
    } else if (activeMomentIndex > 0) {
      openMomentModal(activeMomentIndex - 1)
    } else {
      router.back()
    }
  }

  const handleHoldStart = () => {
    setIsPlaying(false)
    if (videoRef.current) videoRef.current.pauseAsync?.()
  }

  const handleHoldEnd = () => {
    setIsPlaying(true)
    if (videoRef.current) videoRef.current.playAsync?.()
  }

  return (
    <Pressable
      style={{
        backgroundColor: !activeMomentMedia.preview
          ? activeMomentMedia.backgroundColor
          : backgroundColor,
      }}
      className="h-[100vh] flex justify-center items-center relative flex-1"
    >
      <MomentProgressBar />
      <Pressable
        onPress={handlePrev}
        style={{
          position: 'absolute',
          top: 0,
          zIndex: 20,
          left: 0,
          width: '33.3333333%',
          height: '100%',
        }}
      />
      <Pressable
        onPressIn={handleHoldStart}
        onPressOut={handleHoldEnd}
        className="translate-x-[-50%]"
        style={{
          position: 'absolute',
          top: 0,
          zIndex: 20,
          left: '50%',
          width: '33.3333333%',
          height: '100%',
        }}
      />
      <Pressable
        onPress={handleNext}
        style={{
          position: 'absolute',
          top: 0,
          zIndex: 20,
          right: 0,
          width: '33.3333333%',
          height: '100%',
        }}
      />

      {activeMomentMedia.type.includes('image') && (
        <Image
          source={{ uri: activeMomentMedia.src }}
          className="w-full h-full absolute left-0 top-[50%] translate-y-[-50%]"
          resizeMode="contain"
        />
      )}

      {activeMomentMedia.type.includes('video') && (
        <Video
          ref={videoRef}
          source={{ uri: activeMomentMedia.src }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: [{ translateY: -Dimensions.get('window').height / 2 }],
          }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={isPlaying}
          isLooping={false}
          onPlaybackStatusUpdate={(status) => {
            // ✅ Type narrowing
            if ('didJustFinish' in status && status.didJustFinish) {
              handleNext()
            }
          }}
        />
      )}

      <View
        style={{ marginTop: insets.top + 10 }}
        className="flex px-3 flex-row z-20 top-0 w-full justify-between absolute"
      >
        <View className="flex flex-row items-center relative mb-2 gap-2 mr-auto">
          <Image
            source={{ uri: activeMoment.picture }}
            className="w-[50px] h-[50px] rounded-[50px]"
            resizeMode="cover"
          />
          <Text className="font-semibold shadow text-lg text-white">
            {activeMoment.displayName}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          onPress={() => router.back()}
          className="rounded-[50px] w-10 h-10 flex justify-center items-center bg-white/50"
        >
          <X size={20} />
        </TouchableOpacity>
      </View>
      <Text
        className={`${
          activeMomentMedia.src ? 'bg-black/30 p-3' : ''
        } text-center text-xl shadow text-white`}
      >
        {activeMomentMedia.content}
      </Text>
    </Pressable>
  )
}
