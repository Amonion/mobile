import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Moment, MomentStore } from '@/store/post/Moment'

interface MomentItemProps {
  moment: Moment
  index: number
  moveToFullMoment: (index: number) => void
}

const MomentItem: React.FC<MomentItemProps> = ({
  moment,
  index,
  moveToFullMoment,
}) => {
  useEffect(() => {
    const interval = setInterval(() => {
      MomentStore.getState().expireOldMedia()
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const media = moment.media[0]

  return (
    <TouchableOpacity
      key={moment._id}
      onPress={() => moveToFullMoment(index)}
      className="mr-3"
    >
      <View className="relative w-[100px] h-[150px] rounded-[10px] overflow-hidden bg-primary dark:bg-dark-primary">
        {media?.type?.includes('image') ? (
          <Image
            source={{ uri: media.src }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : media?.type?.includes('video') ? (
          <Image
            source={{ uri: media.preview }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : media?.content ? (
          <View
            className="w-full h-full flex justify-center items-center"
            style={{ backgroundColor: media.backgroundColor ?? '#333' }}
          >
            <Text
              numberOfLines={3}
              className="text-white text-xs text-center mx-1 leading-5"
            >
              {media.content}
            </Text>
          </View>
        ) : null}

        <View
          className={`w-[25px] h-[25px] absolute top-2 left-2 rounded-full overflow-hidden border-[2px] ${
            media?.isViewed ? 'border-pink-500' : 'border-gray-300'
          }`}
        >
          <Image
            source={{ uri: moment.picture }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <Text
          style={{ position: 'absolute', bottom: 8, left: 8 }}
          className="text-white line-clamp-1 overflow-ellipsis font-semibold text-center px-1"
          numberOfLines={1}
        >
          {moment.displayName || moment.username}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default MomentItem
