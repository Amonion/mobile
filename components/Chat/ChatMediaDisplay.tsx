'use client'
import { useState } from 'react'
import MediaModal from './ChatMediaModal'
import { ChatContent } from '@/store/chat/Chat'
import { AuthStore } from '@/store/AuthStore'
import { View, StyleSheet } from 'react-native'
import EachMedia from './EachMedia'

type ChatContentProps = {
  e: ChatContent
}

const ChatMediaDisplay = ({ e }: ChatContentProps) => {
  const { user } = AuthStore()
  const [openModal, setOpenModal] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const isSender = e.senderUsername === user?.username

  return (
    <>
      <View
        className="bg-primary w-full  dark:bg-dark-primary"
        style={[styles.container]}
      >
        {e.media.length === 1 ? (
          <View className="bg-secondary dark:bg-dark-secondary w-full h-[300px]">
            <EachMedia
              key={e.media[0].uri || e.media[0].url || 0}
              item={e.media[0]}
              media={e.media}
              index={0}
              totalCount={e.media.length}
              chatId={e.timeNumber}
              isSender={isSender}
              onPress={() => {
                setActiveIndex(0)
                setOpenModal(true)
              }}
            />
          </View>
        ) : e.media.length === 2 ? (
          <View className="bg-secondary h-[250px] flex-row dark:bg-dark-secondary">
            {e.media.map((item, index) => (
              <View
                key={index}
                className={`h-full w-1/2 ${index === 0 ? 'pr-1' : 'pl-1'}`}
              >
                <EachMedia
                  item={item}
                  media={e.media}
                  index={index}
                  totalCount={e.media.length}
                  chatId={e.timeNumber}
                  isSender={isSender}
                  onPress={() => {
                    setActiveIndex(index)
                    setOpenModal(true)
                  }}
                />
              </View>
            ))}
          </View>
        ) : e.media.length === 3 ? (
          <View className="bg-secondary h-[250px] flex-row dark:bg-dark-secondary">
            <View className="w-1/2 h-full pr-1">
              <EachMedia
                key={e.media[0].uri || e.media[0].url || 0}
                item={e.media[0]}
                media={e.media}
                index={0}
                totalCount={e.media.length}
                chatId={e.timeNumber}
                isSender={isSender}
                onPress={() => {
                  setActiveIndex(0)
                  setOpenModal(true)
                }}
              />
            </View>
            <View className="h-full w-1/2 pl-1">
              {e.media.slice(1).map((item, index) => (
                <View key={index} className={`h-1/2 w-full pb-1`}>
                  <EachMedia
                    item={item}
                    media={e.media}
                    index={index}
                    totalCount={e.media.length}
                    chatId={e.timeNumber}
                    isSender={isSender}
                    onPress={() => {
                      setActiveIndex(index)
                      setOpenModal(true)
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="bg-secondary h-[300px] flex-row dark:bg-dark-secondary">
            <View className="h-1/2 w-full flex-row pb-1">
              {e.media.slice(1).map((item, index) => (
                <View key={index} className={`h-full w-1/2 pb-1`}>
                  <EachMedia
                    item={item}
                    media={e.media}
                    index={index}
                    totalCount={e.media.length}
                    chatId={e.timeNumber}
                    isSender={isSender}
                    onPress={() => {
                      setActiveIndex(index)
                      setOpenModal(true)
                    }}
                  />
                </View>
              ))}
            </View>
            <View className="h-1/2 w-full flex-row">
              {e.media.slice(1).map((item, index) => (
                <View key={index} className={`h-full w-1/2`}>
                  <EachMedia
                    item={item}
                    media={e.media}
                    index={index}
                    totalCount={e.media.length}
                    chatId={e.timeNumber}
                    isSender={isSender}
                    onPress={() => {
                      setActiveIndex(index)
                      setOpenModal(true)
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
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
