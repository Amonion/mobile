import FriendStore, { Friend } from '@/src/zustand/chat/Friend'
import { AuthStore } from '@/src/zustand/user/AuthStore'
// import UsersList from '../Chat/UsersList'
import Image from 'next/image'
import { formatRelativeDate } from '@/lib/helpers'
import { usePathname, useRouter } from 'next/navigation'
import { ChatStore } from '@/src/zustand/chat/Chat'
import { useEffect, useState } from 'react'

interface EachFriendProps {
  friend: Friend
}

export default function EachFriend({ friend }: EachFriendProps) {
  const friendState = FriendStore((state) =>
    state.friendsResults.find((f) => f.connection === friend.connection)
  )
  const currentFriend = friendState ?? friend
  const { user } = AuthStore()
  const { friendForm } = FriendStore()
  const { getSavedChats, connection } = ChatStore()
  const [unread, setUnread] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const isSender = friend.senderUsername === user?.username

  const selectFriend = () => {
    if (friendForm.connection !== friend.connection) {
      ChatStore.setState({
        chats: [],
        username: isSender ? friend.receiverUsername : friend.senderUsername,
        chatUserForm: {
          username: isSender ? friend.receiverUsername : friend.senderUsername,
          picture: isSender ? friend.receiverPicture : friend.senderPicture,
          displayName: isSender
            ? friend.receiverDisplayName
            : friend.senderDisplayName,
          _id: '',
          isFriends: friend.isFriends,
        },
      })
      getSavedChats(friend.connection)

      FriendStore.setState(() => ({
        friendForm: currentFriend,
      }))
    }

    if (pathname !== '/chat') {
      router.push(`/chat`)
    }
  }

  useEffect(() => {
    if (currentFriend.unreadMessages && user) {
      for (let i = 0; i < currentFriend.unreadMessages.length; i++) {
        const el = currentFriend.unreadMessages[i]
        if (el.username === user?.username) {
          setUnread(el.unread)
        }
      }
    }
  }, [currentFriend, user])

  return (
    <li
      onClick={() => selectFriend()}
      className={`${
        connection &&
        currentFriend.connection === connection &&
        pathname === '/chat'
          ? 'bg-[var(--primary)]'
          : ''
      } hover:bg-[var(--primary)] px-1 py-2 rounded-[10px] mb-2 flex w-full items-start cursor-pointer`}
    >
      <div className="rounded-full w-10 h-10 relative overflow-hidden">
        <Image
          src={
            isSender
              ? currentFriend.receiverPicture
              : currentFriend.senderPicture
          }
          alt="Media"
          fill
          className="object-cover w-full h-full"
        />
      </div>

      <div className="flex-1 pl-2">
        <div className="flex w-full items-center mb-1">
          <div className="font-semibold line-clamp-1 text-[var(--text-secondary)] mr-auto">
            {isSender
              ? currentFriend.receiverDisplayName
              : currentFriend.senderDisplayName}
          </div>
          <div className="text-[12px] ml-2 block">
            {formatRelativeDate(String(currentFriend.updatedAt))}
          </div>
        </div>

        <div className="flex relative items-center w-full">
          {isSender && (
            <div className="mr-1 text-[12px]">
              {currentFriend.status === 'pending' ? (
                <i className="bi bi-clock-history"></i>
              ) : currentFriend.status === 'sent' ? (
                <i className="bi bi-check2"></i>
              ) : currentFriend.status === 'delivered' ? (
                <i className="bi bi-check2-all"></i>
              ) : currentFriend.status === 'read' ? (
                <i className="bi bi-check2-all text-[var(--custom)]"></i>
              ) : (
                <i className="bi bi-clock-history"></i>
              )}
            </div>
          )}
          {unread > 0 && (
            <div
              className={`${
                unread >= 100
                  ? 'w-[20px] h-[20px] text-[10px]'
                  : 'w-[15px] h-[15px] text-[12px]'
              } flex items-center  text-white absolute right-0 bottom-1 z-30 justify-center rounded-full bg-[var(--custom)]`}
            >
              {unread >= 100 ? '99+' : unread}
            </div>
          )}
          {currentFriend.media && currentFriend.media.length > 0 && (
            <div className="mr-1">
              {currentFriend.media[0].type.includes('image') ? (
                <i className="bi bi-image"></i>
              ) : (
                currentFriend.media[0].type.includes('video') && (
                  <i className="bi bi-camera-video"></i>
                )
              )}
            </div>
          )}
          <div
            className="text-sm flex-1 line-clamp-1 overflow-ellipsis"
            dangerouslySetInnerHTML={{ __html: currentFriend.content }}
          />
        </div>
      </div>
    </li>
  )
}
