import React, { useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  useColorScheme,
  Pressable,
} from 'react-native'
import { Plus } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import MomentItem from './MomentItem'
import { MomentEmpty, MomentStore } from '@/store/post/Moment'
import { AuthStore } from '@/store/AuthStore'

const Moments = () => {
  const moments = MomentStore((state) => state.moments)
  const activeMomentIndex = MomentStore((state) => state.activeMomentIndex)
  const openMomentModal = MomentStore((state) => state.openMomentModal)

  const { user } = AuthStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const router = useRouter()
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)

  useEffect(() => {
    MomentStore.setState({ activeMoment: MomentEmpty })
  }, [])

  const moveToFullMoment = (index: number) => {
    openMomentModal(index)
    router.push('/full-moment')
  }

  const handleTouchStart = useCallback((e: any) => {
    touchStartY.current = e.nativeEvent.pageY
  }, [])

  const handleTouchEnd = useCallback(
    (e: any) => {
      touchEndY.current = e.nativeEvent.pageY
      const swipeDistance = touchStartY.current - touchEndY.current

      if (swipeDistance > 50 && activeMomentIndex + 1 < moments.length) {
        openMomentModal(activeMomentIndex + 1)
      } else if (swipeDistance < -50 && activeMomentIndex > 0) {
        openMomentModal(activeMomentIndex - 1)
      }
    },
    [activeMomentIndex, moments.length]
  )

  const renderAddMoment = () => (
    <Pressable
      onPress={() => router.push('/create-moment')}
      className="mr-3 items-center w-[100px]"
    >
      <View className="relative w-full h-[150px] rounded-[10px] overflow-hidden bg-primary dark:bg-dark-primary">
        <Image
          source={{ uri: String(user?.picture) }}
          className="w-full h-[100px]"
          resizeMode="cover"
        />
        <View className="absolute bottom-[35px] left-[50%] -translate-x-[12px] w-[30px] h-[30px] bg-white rounded-full items-center justify-center">
          <Plus size={18} color={isDark ? '#111' : '#DA3986'} />
        </View>
        <Text className="text-white mt-auto mb-4 text-center">Share</Text>
      </View>
    </Pressable>
  )

  return (
    <View className="py-4">
      <Text className="text-xl text-secondary dark:text-dark-secondary px-3 mb-2">
        Beautiful Moments
      </Text>

      <FlatList
        data={moments}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <MomentItem
            moment={item}
            index={index}
            moveToFullMoment={moveToFullMoment}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 10,
          alignItems: 'center',
        }}
        ListHeaderComponent={renderAddMoment()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
    </View>
  )
}

export default React.memo(Moments)
