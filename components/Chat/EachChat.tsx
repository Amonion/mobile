'use client'
import { useEffect, useRef } from 'react'
import { formatTimeTo12Hour } from '@/lib/helpers'
import ChatMedia from './ChatMedia'
import { ChatContent, ChatStore } from '@/store/chat/Chat'
import { AuthStore } from '@/store/AuthStore'

type ChatContentProps = {
  e: ChatContent
  isFirst: boolean
  isGroupStart: boolean
  isGroupEnd: boolean
  index: number
}

const EachChat = ({ e, isFirst, isGroupEnd }: ChatContentProps) => {
  const { selectChats, setActiveChat, chats, selectedItems } = ChatStore()
  const { user } = AuthStore()
  const optionsRef = useRef<HTMLDivElement | null>(null)
  const firstCardRef = useRef<HTMLDivElement | null>(null)
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isSender = e.senderUsername === user?.username

  const selectItem = (id: string) => {
    if (selectedItems.length > 0) {
      selectChats(id)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const chatId = Number(entry.target.getAttribute('data-id'))
            const chat = chats.find(
              (c) =>
                c.timeNumber === chatId &&
                c.receiverUsername === user?.username &&
                c.status !== 'read'
            )
            if (chat) {
              ChatStore.setState((prev) => {
                const updatedIds = new Set([
                  ...prev.unseenChatIds,
                  Number(chat.timeNumber),
                ])
                return {
                  unseenChatIds: Array.from(updatedIds),
                }
              })
            }

            // const userChat = chats.find(
            //   (c) => c.timeNumber === chatId && c.status !== 'read'
            // )
            // if (userChat) {
            //   ChatStore.setState((prev) => {
            //     const updatedIds = new Set([
            //       ...prev.unseenCheckIds,
            //       Number(userChat.timeNumber),
            //     ])
            //     return {
            //       unseenCheckIds: Array.from(updatedIds),
            //     }
            //   })
            // }
          }
        })
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    )

    // Observe all chat elements
    Object.values(messageRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })

    // Clean up observer
    return () => {
      Object.values(messageRefs.current).forEach((el) => {
        if (el) observer.unobserve(el)
      })
    }
  }, [chats, user])

  return (
    <div
      onClick={() => selectItem(String(e._id))}
      className={` ${e.isChecked ? 'selected' : ''} ${
        e.isAlert ? 'cursor-pointer' : 'cursor-default'
      } ${isGroupEnd ? 'mb-3' : 'mb-1'} full_chat_wrapper`}
      ref={(el) => {
        if (el) {
          messageRefs.current[String(e.timeNumber)] = el
          if (isFirst) {
            firstCardRef.current = el
          }
        }
      }}
      data-id={e.timeNumber}
      // ref={isFirst ? firstCardRef : messageRefs}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className={` ${isSender ? 'sender' : 'receiver'} ${
          e.media[0] && e.media[0].type === 'audio' ? 'audio' : ''
        } ${
          e.media[0] &&
          (e.media[0].type === 'picture' || e.media[0].type === 'video')
            ? 'media'
            : ''
        } chat_wrapper cursor-default`}
      >
        {e.repliedChat && e.repliedChat !== null && (
          <div
            onClick={() => selectChats(String(e.repliedChat?.senderUsername))}
            className={`${
              isSender ? 'bg-[var(--secondary)]' : 'bg-[var(--custom-dark)]'
            } flex  rounded-[10px] py-[1px] px-[5px] cursor-pointer w-full mb-2`}
          >
            {/* <RepliedChat
                          repliedChat={e.repliedChat}
                          chat={e}
                          user={user}
                          username={String(username)}
                          inner={true}
                        /> */}
          </div>
        )}
        <ChatMedia e={e} />

        <div className="mb-1">
          <div dangerouslySetInnerHTML={{ __html: e.content }}></div>
        </div>
        <div className="flex leading-[15px] justify-between w-full items-center text-[11px]">
          <div className="flex items-end">
            {isSender ? (
              <>
                {formatTimeTo12Hour(e.senderTime ?? null)}
                <div className="flex ml-3 text-[10px]">
                  {e.status === 'pending' ? (
                    <i className="bi bi-clock-history"></i>
                  ) : e.status === 'delivered' ? (
                    <i className={`bi text-[15px] bi-check2-all`}></i>
                  ) : e.status === 'sent' ? (
                    <i className="bi bi-check2"></i>
                  ) : (
                    e.status === 'read' && (
                      <i
                        className={`bi text-[15px] bi-check2-all text-[var(--custom)]`}
                      ></i>
                    )
                  )}
                </div>
              </>
            ) : (
              formatTimeTo12Hour(e.receiverTime ?? null)
            )}
          </div>

          <div className="relative" ref={optionsRef}>
            <i
              onClick={() => setActiveChat(e)}
              className="bi bi-three-dots-vertical text-sm cursor-pointer"
            ></i>
          </div>
        </div>
        {e.isSavedUsernames?.includes(String(user?.username)) && (
          <>
            {isSender ? (
              <div className="round absolute left-0 bottom-[-15px]">
                <i className="bi bi-heart-fill text-[10px] mt-[2px] leading-none cursor-pointer text-red-600"></i>
              </div>
            ) : (
              <div className="round absolute left-[10px] bottom-[-15px]  ">
                <i className="bi bi-heart-fill text-[10px] mt-[1px] leading-none cursor-pointer text-red-600"></i>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default EachChat
