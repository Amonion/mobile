import { formatRelativeDate, truncateString } from '@/lib/helpers'
import { Feather } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
  View,
  Text,
  Image,
  useColorScheme,
  useWindowDimensions,
  TouchableOpacity,
  Linking,
} from 'react-native'
import RenderHtml from 'react-native-render-html'
import { Weekend } from '@/store/exam/Weekend'

interface GiveawayCardProps {
  giveaway: Weekend
  onCommentPress?: () => void
  visiblePostId?: string | null
}

const GiveawayCard: React.FC<GiveawayCardProps> = ({
  giveaway,
  onCommentPress,
}) => {
  const { width } = useWindowDimensions()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false

  return (
    <View className="bg-primary dark:bg-dark-primary py-4 mb-[2px]">
      <View className="flex-row px-3 items-start">
        <TouchableOpacity className="mr-3">
          <Image
            source={{ uri: String(giveaway.picture) }}
            className="rounded-full"
            style={{
              width: 55,
              height: 55,
            }}
          />
        </TouchableOpacity>

        <View className="flex-1">
          <View className="flex-row  items-center">
            <TouchableOpacity className="mr-2">
              <Text className="font-semibold flex-1 text-xl text-primary dark:text-dark-primary line-clamp-1 overflow-ellipsis">
                {giveaway.bioUserDisplayName}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Text className="text-custom">@{giveaway.bioUserUsername}</Text>
          </TouchableOpacity>
        </View>
        <View className="ml-auto min-w-[50px] justify-end flex-col items-end mb-auto">
          <View
            style={{ height: 25 }}
            className="items-center flex-row text-primaryLight rounded-full mb-[5px] relative"
          >
            <TouchableOpacity
              hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
              className=""
            >
              <Feather
                name="more-vertical"
                size={23}
                color={isDark ? '#848484' : '#A4A2A2'}
              />
            </TouchableOpacity>

            {/* <GiveawayBottomSheet
              post={giveaway}
              visible={visible}
              setVisible={setVisible}
            /> */}
          </View>
          <Text className="text-primary dark:text-dark-primary">
            {formatRelativeDate(String(giveaway.createdAt))}
          </Text>
        </View>
      </View>

      {giveaway.backgroundColor ? (
        <TouchableOpacity
          className="flex justify-center mt-3 px-3 items-center"
          style={{
            backgroundColor: giveaway.backgroundColor,

            height: 250,
            width: '100%',
            position: 'relative',
          }}
        >
          <RenderHtml
            contentWidth={width}
            source={{ html: truncateString(giveaway.question, 220) }}
            baseStyle={{
              color: '#FFF',
              fontSize: 17,
              fontWeight: 400,
              lineHeight: 23,
              textAlign: 'center',
            }}
            tagsStyles={{
              a: {
                color: '#DA3986',
                textDecorationLine: 'underline',
              },
            }}
          />
        </TouchableOpacity>
      ) : (
        <>
          {giveaway.question && (
            <TouchableOpacity className="text-secondary px-3 mt-3 dark:text-dark-secondary">
              <RenderHtml
                contentWidth={width}
                source={{ html: truncateString(giveaway.question, 220) }}
                baseStyle={{
                  color: isDark ? '#EFEFEF' : '#3A3A3A',
                  fontSize: 17,
                  fontWeight: 400,
                  lineHeight: 23,
                }}
                tagsStyles={{
                  a: {
                    color: '#DA3986',
                    textDecorationLine: 'underline',
                  },
                }}
                renderersProps={{
                  a: {
                    onPress: (event, href) => {
                      Linking.openURL(href).catch((err) =>
                        console.error('Failed to open URL:', err)
                      )
                    },
                  },
                }}
              />
            </TouchableOpacity>
          )}

          {/* {giveaway.media?.length > 0 && (
            <GiveawayPostMedia sources={giveaway.media} />
          )} */}
        </>
      )}

      {/* {giveaway.polls.length > 0 && (
        <GiveawayPollCard
          postId={giveaway._id}
          isSelected={giveaway.isSelected}
          totalVotes={giveaway.totalVotes}
        />
      )}

      <GiveawayStat post={giveaway} onCommentPress={onCommentPress} /> */}
    </View>
  )
}

function areEqual(prevProps: GiveawayCardProps, nextProps: GiveawayCardProps) {
  return (
    prevProps.giveaway._id === nextProps.giveaway._id &&
    prevProps.giveaway.createdAt === nextProps.giveaway.createdAt &&
    prevProps.giveaway.likes === nextProps.giveaway.likes &&
    prevProps.giveaway.liked === nextProps.giveaway.liked &&
    prevProps.giveaway.bookmarks === nextProps.giveaway.bookmarks &&
    prevProps.giveaway.bookmarked === nextProps.giveaway.bookmarked
  )
}

export default React.memo(GiveawayCard, areEqual)
