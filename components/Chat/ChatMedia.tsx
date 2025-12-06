'use client'
import { getExtension } from '@/lib/helpers'
import AudioMessage from './Audio'
import ChatMediaDisplay from './ChatMediaDisplay'
import { ChatContent } from '@/store/chat/Chat'
import { AuthStore } from '@/store/AuthStore'
import { useLocalSearchParams } from 'expo-router'
import { TouchableOpacity, Image, Linking, View, Text } from 'react-native'
import { Download } from 'lucide-react-native'
import ChatDocument from './ChatDocument'

type ChatContentProps = {
  e: ChatContent
}

const ChatMedia = ({ e }: ChatContentProps) => {
  const { user } = AuthStore()
  const { username } = useLocalSearchParams()
  const isSender = e.senderUsername === user?.username

  return (
    <>
      {e.media.length > 0 && (
        <>
          {e.media[0].type.includes('file') ||
          e.media[0].type.includes('document') ? (
            <ChatDocument
              item={e.media[0]}
              media={e.media}
              index={0}
              chatId={e.timeNumber}
              src={String(e.media[0].url)}
              isSender={isSender}
            />
          ) : e.media[0].type.includes('audio') ? (
            <AudioMessage
              item={e.media[0]}
              media={e.media}
              index={0}
              chatId={e.timeNumber}
              src={String(e.media[0].url)}
              isSender={isSender}
              name={e.media[0].name}
            />
          ) : (
            <ChatMediaDisplay e={e} />
          )}
        </>
      )}
    </>
  )
}

export default ChatMedia
