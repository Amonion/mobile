import React, { useState } from 'react'
import {
  View,
  Image,
  Modal,
  Pressable,
  FlatList,
  Dimensions,
  TouchableOpacity,
  useColorScheme,
  Text,
} from 'react-native'

import { Feather, Ionicons } from '@expo/vector-icons'
import DisplayVideo from './DisplayVideo'
import VideoModal from './VideoModal'

const { width } = Dimensions.get('window')

type MediaSource = {
  preview: string
  source: string
  type: string
  width: number
  height: number
  isPorn?: boolean
  //   type: 'image' | 'video'
}

type MediaDisplayProps = {
  sources: MediaSource[]
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ sources }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState<null | number>(null)
  const colorScheme = useColorScheme()
  const [imageDimensions, setImageDimensions] = useState<{
    [key: number]: { width: number; height: number }
  }>({})
  const [loadingIndices, setLoadingIndices] = useState<number[]>([])
  const [failedIndices, setFailedIndices] = useState<number[]>([])
  const isDark = colorScheme === 'dark' ? true : false
  const [visibleIndex, setVisibleIndex] = useState(activeIndex)
  const onViewRef = React.useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index)
    }
  })

  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 })

  const openModal = (index: number) => {
    setModalVisible(true)
    setActiveIndex(index)
  }

  const fetchMediaSize = (index: number, media: MediaSource) => {
    setLoadingIndices((prev) => [...prev, index])
    Image.getSize(
      media.source,
      (imgWidth, imgHeight) => {
        setImageDimensions((prev) => ({
          ...prev,
          [index]: { width: imgWidth, height: imgHeight },
        }))
        setLoadingIndices((prev) => prev.filter((i) => i !== index))
      },
      (error) => {
        if (index === 1000) {
          console.log(error)
        }
        setLoadingIndices((prev) => prev.filter((i) => i !== index))
        setFailedIndices((prev) => [...prev, index]) // prevent re-fetching
      }
    )
  }

  const renderMedia = (media: MediaSource, index: number) => {
    if (media.type.includes('video')) {
      if (sources.length === 1) {
        return (
          <TouchableOpacity
            key={media.preview}
            className=""
            onPress={() => openModal(index)}
          >
            {media.preview && (
              <DisplayVideo
                source={media.preview}
                mediaWidth={media.width}
                mediaHeight={media.height}
                size={1}
                type="video"
                onPress={() => openModal(index)}
              />
            )}
          </TouchableOpacity>
        )
      } else if (sources.length > 1) {
        return (
          <TouchableOpacity
            key={media.preview}
            className="relative"
            onPress={() => openModal(index)}
          >
            {media.preview && (
              <Image
                source={{ uri: media.preview }}
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
            <View className="w-12 h-12 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] border-custom justify-center items-center bg-black/50 rounded-full">
              <Feather className="ml-1" name="play" size={24} color="#DA3986" />
            </View>
            {sources.length > 4 && index === 3 && (
              <View className="absolute items-center justify-center z-50 bg-custom/50 top-1 right-1 w-12 h-12 rounded-full">
                <Text className="text-white"> +{sources.length - 4} </Text>
              </View>
            )}
          </TouchableOpacity>
        )
      }
    }

    if (
      !imageDimensions[index] &&
      !loadingIndices.includes(index) &&
      !failedIndices.includes(index)
    ) {
      fetchMediaSize(index, media)
    }

    if (sources.length === 1 && index === 0) {
      return (
        <TouchableOpacity
          key={index}
          activeOpacity={media.isPorn ? 1 : 0}
          className=""
          onPress={() => {
            if (!media.isPorn) {
              openModal(index)
            }
          }}
        >
          {media.source && (
            <DisplayVideo
              source={media.source}
              mediaWidth={media.width}
              mediaHeight={media.height}
              isPorn={media.isPorn}
              size={1}
              type="image"
              onPress={() => openModal(index)}
            />
          )}
        </TouchableOpacity>
      )
    } else if (sources.length === 2) {
      return (
        <TouchableOpacity
          key={index}
          className="flex-1 relative"
          activeOpacity={media.isPorn ? 1 : 0}
          onPress={() => {
            if (!media.isPorn) {
              openModal(index)
            }
          }}
        >
          {media.source && (
            <Image
              source={{ uri: media.source }}
              className="w-full h-full"
              resizeMode="cover"
            />
          )}
          {media.isPorn && (
            <View className="absolute top-0 left-0 w-full h-full backdrop-blur-3xl dark:bg-dark-secondary bg-secondary z-50 flex items-center justify-center">
              <View className="absolute top-0 left-0 w-full h-full backdrop-blur-3xl dark:bg-dark-secondary bg-secondary z-50 flex items-center justify-center">
                <Text className="text-white text-lg font-bold">
                  Blurred for Safety
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      )
    } else if (sources.length === 3 && index === 0) {
      return (
        <TouchableOpacity
          key={index}
          className="flex-1"
          activeOpacity={media.isPorn ? 1 : 0}
          onPress={() => {
            if (!media.isPorn) {
              openModal(index)
            }
          }}
        >
          {media.source && (
            <Image
              source={{ uri: media.source }}
              className="w-full h-full"
              resizeMode="cover"
            />
          )}
          {media.isPorn && (
            <View className="absolute top-0 left-0 w-full h-full backdrop-blur-3xl dark:bg-dark-secondary bg-secondary z-50 flex items-center justify-center">
              <View className="absolute top-0 left-0 w-full h-full backdrop-blur-3xl dark:bg-dark-secondary bg-secondary z-50 flex items-center justify-center">
                <Text className="text-primary dark:text-dark-primary text-lg font-bold">
                  Blurred for Safety
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      )
    } else if (sources.length === 3 && index > 0) {
      return (
        <TouchableOpacity
          key={index}
          className="flex-1 h-full"
          activeOpacity={media.isPorn ? 1 : 0}
          onPress={() => {
            if (!media.isPorn) {
              openModal(index)
            }
          }}
        >
          {media.source && (
            <Image
              source={{ uri: media.source }}
              className="w-full h-full"
              resizeMode="cover"
            />
          )}
          {media.isPorn && (
            <View className="absolute top-0 left-0 w-full h-full backdrop-blur-3xl dark:bg-dark-secondary bg-secondary z-50 flex items-center justify-center">
              <View className="absolute top-0 left-0 w-full h-full backdrop-blur-3xl dark:bg-dark-secondary bg-secondary z-50 flex items-center justify-center">
                <Text className="text-primary dark:text-dark-primary text-lg font-bold">
                  Blurred for Safety
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      )
    } else if (sources.length > 3) {
      return (
        <TouchableOpacity
          key={index}
          className="flex-1 relative"
          activeOpacity={media.isPorn ? 1 : 0}
          onPress={() => {
            if (!media.isPorn) {
              openModal(index)
            }
          }}
        >
          {media.source && (
            <Image
              source={{ uri: media.source }}
              className="w-full h-full"
              resizeMode="cover"
            />
          )}
          {sources.length > 4 && index === 3 && (
            <View className="absolute justify-center items-center bottom-3 right-3 w-12 h-12 rounded-full bg-custom/50">
              <Text className="text-white text-xl">+{sources.length - 4}</Text>
            </View>
          )}
          {media.isPorn && (
            <View className="absolute top-0 left-0 w-full h-full backdrop-blur-3xl dark:bg-dark-secondary bg-secondary z-50 flex items-center justify-center">
              <View className="absolute top-0 left-0 w-full h-full backdrop-blur-3xl dark:bg-dark-secondary bg-secondary z-50 flex items-center justify-center">
                <Text className="text-primary dark:text-dark-primary text-lg font-bold">
                  Blurred for Safety
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      )
    }

    return (
      <TouchableOpacity key={index} className="">
        <Text
          className="text-custom"
          style={{ textAlign: 'center', padding: 20 }}
        >
          Failed to load image
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <>
      <View className="gap-1 mb-2 bg-secondary dark:bg-dark-secondary overflow-hidden rounded-[10px]">
        {sources.length === 1 ? (
          renderMedia(sources[0], 0)
        ) : sources.length === 2 ? (
          <View className="flex-row justify-between gap-1 h-[250px] w-full">
            <View className="w-1/2">{renderMedia(sources[0], 0)}</View>
            <View className="flex-1 w-1/2">{renderMedia(sources[1], 1)}</View>
          </View>
        ) : sources.length === 3 ? (
          <View className="flex-row justify-between gap-1">
            <View className="w-1/2 h-[250px]">
              {renderMedia(sources[0], 0)}
            </View>
            <View className="w-1/2 h-[250px] gap-1">
              <View className="flex-1 h-1/2">{renderMedia(sources[1], 1)}</View>
              <View className="flex-1 h-1/2">{renderMedia(sources[2], 2)}</View>
            </View>
          </View>
        ) : (
          <View className="grid flex-row grid-cols-4 gap-1 h-[300px] w-full">
            <View className="w-1/2 h-full gap-1">
              <View className="flex-1 h-1/2">{renderMedia(sources[0], 0)}</View>
              <View className="flex-1 h-1/2">{renderMedia(sources[2], 2)}</View>
            </View>
            <View className="w-1/2 h-full gap-1">
              <View className="flex-1 h-1/2">{renderMedia(sources[1], 1)}</View>
              <View className="flex-1 h-1/2">{renderMedia(sources[3], 3)}</View>
            </View>
          </View>
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 bg-black justify-center items-center">
          <Pressable
            onPress={() => {
              setActiveIndex(null)
              setModalVisible(false)
            }}
            className="absolute h-10 w-10 bg-custom rounded-full justify-center items-center top-2 right-3 z-50"
          >
            <Ionicons name="close" size={18} color={isDark ? '#fff' : '#fff'} />
          </Pressable>

          <FlatList
            data={sources}
            horizontal
            pagingEnabled
            initialScrollIndex={Number(activeIndex)}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={viewConfigRef.current}
            renderItem={({ item, index }) => (
              <View className="w-screen h-full justify-center items-center">
                {item.type.includes('video') ? (
                  <VideoModal
                    source={item.source}
                    isVisible={visibleIndex === index}
                  />
                ) : (
                  <Image
                    source={{ uri: item.source }}
                    className="w-full h-[100vh] object-contain"
                    resizeMode="contain"
                  />
                )}
              </View>
            )}
          />
        </View>
      </Modal>
    </>
  )
}

export default MediaDisplay
