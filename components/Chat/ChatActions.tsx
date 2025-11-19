'use client'
import { useGeneralContext } from '@/context/GeneralContext'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import {
  ChatContent,
  ChatContentEmpty,
  ChatStore,
} from '@/src/zustand/chat/Chat'
import { deleteMessageFromDB } from '@/lib/indexDB'

type ChatContentProps = {
  e: ChatContent
}

const ChatActions = ({ e }: ChatContentProps) => {
  const { selectChats, setActiveChat, connection } = ChatStore()
  const { user } = AuthStore()
  const { socket } = useGeneralContext()

  const setIsActive = (id: string) => {
    ChatStore.setState((prev) => {
      const updatedChats = prev.chats.map((c) =>
        c._id === id ? { ...c, isActive: true } : c
      )
      return { chats: updatedChats }
    })
  }

  const startSetRepliedChat = (e: ChatContent | null) => {
    ChatStore.setState({
      repliedChat: e,
    })
    if (e) {
      setIsActive(String(e._id))
    }
  }

  const deleteChat = async () => {
    const status = await deleteMessageFromDB(e.timeNumber)
    if (status) {
      ChatStore.setState((prev) => {
        return {
          chats: prev.chats.filter((item) => item.timeNumber !== e.timeNumber),
        }
      })
    }
    if (socket && user) {
      const form = {
        to: 'deleteChat',
        id: e.timeNumber,
        connection: connection,
        isSender: user.username === e.senderUsername,
        username: user.username,
        receiverUsername: e.receiverUsername,
      }

      socket.emit('message', form)
    }

    setActiveChat(ChatContentEmpty)
  }

  const startSelectItem = (id: string) => {
    selectChats(id)
    setIsActive(id)
  }

  return (
    <div
      className={`flex flex-col bottom-[60px] right-1  text-[var(--text-primary)] z-50 absolute  rounded-[5px] border border-[var(--border)] bg-[var(--primary)]`}
    >
      {e.content.trim().length > 0 && (
        <div
          onClick={() => {
            const cleanedText = e.content.replace(/<[^>]*>/g, '')
            navigator.clipboard.writeText(cleanedText)
            setActiveChat(ChatContentEmpty)
          }}
          className="chat_list_item"
        >
          <i className="bi bi-clipboard mr-2 text-xl"></i>
          Copy Message
        </div>
      )}
      <div onClick={() => startSetRepliedChat(e)} className="chat_list_item">
        <i className="bi bi-reply mr-2 text-xl"></i>
        Reply Message
      </div>
      <div
        onClick={() => startSelectItem(String(e._id))}
        className="chat_list_item"
      >
        <i className="bi bi-check2-square mr-2 text-xl"></i>
        Select Message
      </div>
      <div onClick={() => deleteChat()} className="chat_list_item">
        <i className="bi bi-trash mr-2 text-xl"></i>
        Delete Message
      </div>
      <div
        onClick={() => setActiveChat(ChatContentEmpty)}
        className="chat_list_item"
      >
        <i className="bi bi-x-circle mr-2"></i>
        Close
      </div>
    </div>
  )
}

export default ChatActions
