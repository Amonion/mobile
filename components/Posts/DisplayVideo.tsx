import React from 'react'
import { View, TouchableOpacity, Dimensions, Image, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
const { width } = Dimensions.get('window')

type DisplayVideoProps = {
  source: string
  mediaWidth: number
  mediaHeight: number
  isPorn?: boolean
  size?: number
  type?: string
  onPress?: () => void
}

const DisplayVideo: React.FC<DisplayVideoProps> = ({
  source,
  mediaWidth,
  mediaHeight,
  isPorn,
  size,
  type,
  onPress,
}) => {
  const aspectRatio = mediaWidth / mediaHeight
  const screenWidth = width - 20

  let newWidth = mediaWidth
    ? (mediaWidth * 300) / (mediaWidth + mediaHeight)
    : 300
  let newHeight = mediaHeight
    ? (mediaHeight * 300) / (mediaWidth + mediaHeight)
    : 300

  if (size === 1) {
    if (aspectRatio > 1) {
      newWidth = screenWidth
      newHeight = screenWidth / aspectRatio
    } else if (aspectRatio < 1) {
      newWidth = 300 * aspectRatio
      newHeight = 300
    }
  }

  return (
    <>
      <View className="relative w-full bg-secondary dark:bg-dark-secondary justify-center items-center">
        {isPorn && (
          <View className="absolute top-0 left-0 w-full h-full backdrop-blur-3xl dark:bg-dark-secondary bg-secondary z-50 flex items-center justify-center">
            <View className="absolute top-0 left-0 w-full h-full backdrop-blur-3xl dark:bg-dark-secondary bg-secondary z-50 flex items-center justify-center">
              <Text className="text-white text-lg font-bold">
                Blurred for Safety
              </Text>
            </View>
          </View>
        )}

        {type?.includes(`video`) && (
          <TouchableOpacity
            className="z-20 flex-1 bg-transparent absolute left-[50%] translate-x-[-50%] h-full w-full items-center justify-center"
            onPress={onPress}
          >
            <View className="w-12 h-12  border-custom justify-center items-center bg-black/50 rounded-full">
              <Feather className="ml-1" name="play" size={24} color="#DA3986" />
            </View>
          </TouchableOpacity>
        )}
        {size === 1 ? (
          <>
            <Image
              source={{ uri: source }}
              className="w-full object-cover"
              resizeMode="cover"
              style={{
                width: newWidth,
                height: newHeight,
              }}
            />
          </>
        ) : (
          <>
            <Image
              source={{ uri: source }}
              className="w-full object-cover h-full flex-1"
              resizeMode="cover"
            />
          </>
        )}
      </View>
    </>
  )
}

export default DisplayVideo
