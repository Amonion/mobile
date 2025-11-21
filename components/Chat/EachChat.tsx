'use client'
import { useRef } from 'react'
import { formatTimeTo12Hour } from '@/lib/helpers'
import ChatMedia from './ChatMedia'
import { ChatContent, ChatStore } from '@/store/chat/Chat'
import { AuthStore } from '@/store/AuthStore'
import {
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
  Text,
} from 'react-native'
import {
  Check,
  CheckCheck,
  Clock,
  Heart,
  MoreVertical,
} from 'lucide-react-native'
import RenderHTML from 'react-native-render-html'
type ChatContentProps = {
  e: ChatContent
  isFirst: boolean
  isGroupStart: boolean
  isGroupEnd: boolean
  index: number
}

const EachChat = ({ e, isFirst, isGroupEnd }: ChatContentProps) => {
  const { selectChats, setActiveChat, selectedItems } = ChatStore()
  const { user } = AuthStore()
  const optionsRef = useRef<View | null>(null)
  const firstCardRef = useRef<View | null>(null)
  const messageRefs = useRef<Record<string, View | null>>({})
  const isSender = e.senderUsername === user?.username
  const { width } = useWindowDimensions()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false

  const primaryColor = isDark ? '#BABABA' : '#6E6E6E'

  const selectItem = (id: string) => {
    if (selectedItems.length > 0) {
      selectChats(id)
    }
  }

  return (
    <TouchableOpacity
      className={`
    ${e.isChecked ? 'selected' : ''}
    ${e.isAlert ? 'cursor-pointer' : 'cursor-default'}
    ${isGroupEnd ? 'mb-3' : 'mb-1'}

    ${isSender ? 'self-end' : 'self-start'}
    flex flex-col
  `}
      ref={(el) => {
        if (el) {
          messageRefs.current[String(e.timeNumber)] = el
          if (isFirst) firstCardRef.current = el
        }
      }}
    >
      <View
        className={`
      max-w-[80%] min-w-[100px]
      rounded-[10px] p-2
      ${
        isSender
          ? 'bg-primary dark:bg-dark-primary self-end'
          : 'bg-custom self-start'
      }
      ${e.media[0]?.type === 'audio' ? 'audio' : ''}
      ${
        e.media[0] &&
        (e.media[0].type === 'picture' || e.media[0].type === 'video')
          ? 'media'
          : ''
      }
    `}
      >
        {/* {e.repliedChat && (
          <TouchableOpacity
            onPress={() => selectChats(String(e.repliedChat?.senderUsername))}
            style={{
              backgroundColor: isSender
                ? 'var(--secondary)'
                : 'var(--custom-dark)',
              flexDirection: 'row',
              borderRadius: 10,
              paddingVertical: 2,
              paddingHorizontal: 5,
              width: '100%',
              marginBottom: 8,
            }}
          >
            <RepliedChat
                          repliedChat={e.repliedChat}
                          chat={e}
                          user={user}
                          username={String(username)}
                          inner={true}
                        />
          </TouchableOpacity>
        )} */}

        {/* <ChatMedia e={e} /> */}

        <View style={{ marginBottom: 4 }}>
          <RenderHTML
            contentWidth={width}
            source={{ html: e.content }}
            baseStyle={{
              color: !isSender ? '#FFF' : primaryColor,
              fontSize: 17,
              fontWeight: 400,
              lineHeight: 23,
              textAlign: 'left',
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            {isSender ? (
              <>
                <Text className="text-sm text-primary dark:text-dark-primary">
                  {formatTimeTo12Hour(String(e.senderTime))}
                </Text>

                <View style={{ flexDirection: 'row', marginLeft: 6 }}>
                  {e.status === 'pending' ? (
                    <Clock color={primaryColor} size={12} />
                  ) : e.status === 'delivered' ? (
                    <CheckCheck color={primaryColor} size={15} />
                  ) : e.status === 'sent' ? (
                    <Check color={primaryColor} size={12} />
                  ) : (
                    e.status === 'read' && (
                      <CheckCheck size={15} color={'#DA3986'} />
                    )
                  )}
                </View>
              </>
            ) : (
              <Text className="text-sm text-white">
                {formatTimeTo12Hour(String(e.receiverTime))}
              </Text>
            )}
          </View>

          <View ref={optionsRef}>
            <TouchableOpacity onPress={() => setActiveChat(e)}>
              <MoreVertical
                color={!isSender ? '#FFF' : isDark ? '#BABABA' : '#6E6E6E'}
                size={16}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* {e.isSavedUsernames?.includes(String(user?.username)) && (
          <>
            {isSender ? (
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: -15,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Heart size={10} color="red" fill="red" />
              </View>
            ) : (
              <View
                style={{
                  position: 'absolute',
                  left: 10,
                  bottom: -15,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Heart size={10} color="red" fill="red" />
              </View>
            )}
          </>
        )} */}
      </View>
    </TouchableOpacity>
  )
}

export default EachChat
