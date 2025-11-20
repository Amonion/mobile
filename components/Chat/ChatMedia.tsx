'use client'
import { getExtension } from '@/lib/helpers'
import AudioMessage from './Audio'
import ChatMediaDisplay from './ChatMediaDisplay'
import { ChatContent } from '@/store/chat/Chat'
import { AuthStore } from '@/store/AuthStore'
import { useLocalSearchParams } from 'expo-router'
import { TouchableOpacity, Image, Linking, View, Text } from 'react-native'
import { Download } from 'lucide-react-native'

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
          {e.media[0].type === 'document' ? (
            <View className="flex items-start mb-2">
              <Image
                source={{ uri: getExtension(String(e.media[0].url)) }}
                style={{
                  height: 40,
                  width: 40, // You can adjust or use 'auto' with aspectRatio
                  resizeMode: 'contain',
                  marginRight: 12,
                }}
              />
              <View
                style={{ flex: 1, flexDirection: 'column', marginRight: 8 }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 4,
                    justifyContent: 'space-between',
                  }}
                >
                  {e.media[0].name && (
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        color: 'var(--text-secondary)',
                        marginRight: 8,
                      }}
                    >
                      {e.media[0].name}
                    </Text>
                  )}
                </View>

                <Text style={{ fontSize: 12, textTransform: 'uppercase' }}>
                  {String(e.media[0].url)
                    .substring(String(e.media[0].url).lastIndexOf('.'))
                    .slice(1)}
                  {' · '}
                  {(e.media[0].size / (1024 * 1024)).toFixed(2)} MB{' '}
                  {e.media[0].pages &&
                    e.media[0].pages > 0 &&
                    `· ${e.media[0].pages} ${
                      e.media[0].pages !== 1 ? 'Pages' : 'Page'
                    }`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (e.media[0]?.url) {
                    Linking.openURL(e.media[0].url)
                  }
                }}
                style={{
                  marginLeft: 'auto',
                  minWidth: 32,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor:
                    username === e.senderUsername
                      ? 'white'
                      : 'var(--text-primary)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Download
                  size={16}
                  color={
                    username === e.senderUsername
                      ? 'white'
                      : 'var(--text-primary)'
                  }
                />
              </TouchableOpacity>
            </View>
          ) : e.media[0].type === 'audio' ? (
            <AudioMessage
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
