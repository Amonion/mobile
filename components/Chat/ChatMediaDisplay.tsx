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

  const mediaCount = e.media.length

  const containerStyle = [styles.container, mediaCount >= 3 && { height: 200 }]

  return (
    <>
      <View
        className="bg-secondary dark:bg-dark-secondary"
        style={containerStyle}
      >
        {e.media.map((item, index) => (
          <EachMedia
            key={item.uri || item.url || index}
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
        ))}
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
