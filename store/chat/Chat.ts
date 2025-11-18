import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { customRequest } from '@/lib/api'

export interface PreviewFile {
  index: number
  file?: File | Blob
  blob?: Blob
  url?: string
  previewUrl?: string
  name: string
  type: string
  size: number
  status: string
  pages?: number
  duration?: number
}

interface FetchChatResponse {
  count: number
  unread: number
  message: string
  page_size: number
  results: ChatContent[]
  chat: ChatContent
}

interface FetchUserResponse {
  count: number
  message: string
  page_size: number
  data: ChatUserForm
}

interface ChatState {
  unseenChatIds: number[]
  unseenCheckIds: number[]
  chats: ChatContent[]
  activeChat: ChatContent
  connection: string
  username: string
  count: number
  current: number
  favChatContentResults: ChatContent[]
  favChatResults: Chat[]
  isAllChecked: boolean
  isFriends: boolean
  loading: boolean
  moveUp: boolean
  newCount: number
  page_size: number
  repliedChat: RepliedChatContent | null
  searchResult: ChatContent[]
  selectedFavItems: ChatContent[]
  selectedItems: ChatContent[]
  senderUsername: string
  successs?: string | null
  unread: number
  chatUserForm: ChatUserForm
  setActiveChat: (chat: ChatContent) => void
  getSavedChats: (url: string) => Promise<void>
  getChats: (
    url: string,
    setMessage?: (message: string, isError: boolean) => void
  ) => Promise<void>
  getFavChats: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  addChats: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  addFavChats: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getChatUser: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  addSearchedChats: (url: string, createdAt: Date) => Promise<void>
  addFavSearchedChats: (url: number, createdAt: Date) => Promise<void>
  setProcessedResults: (data: ChatContent[]) => void
  processedAndAddResults: (data: ChatContent[]) => void
  processMoreResults: (data: ChatContent[]) => void
  setProcessedFavResults: (data: Chat[]) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: ChatContent[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (data: socketResponse) => Promise<void>
  postChat: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateChatWithFile: (
    url: string,
    updatedItem: FormData | Record<string, unknown>
  ) => Promise<void>

  updateChatsToRead: (ids: number[], connection: string) => void
  updatePendingChat: (chats: ChatContent) => void
  selectChats: (id: string) => void
  setConnection: (connection: string) => void
  addNewChat: (saved: ChatContent) => void
  selectFavChats: (id: number) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchChats: (url: string) => void
  pendingReadIds: React.MutableRefObject<Set<string>>
  resetPendingReadIds: () => void
}

export interface ChatUserForm {
  username: string
  displayName: string
  picture: string
  _id: string
  isFriends?: boolean
}

export const ChatUserFormEmpty = {
  username: '',
  displayName: '',
  picture: '',
  _id: '',
}

export const ChatContentEmpty = {
  connection: '',
  content: '',
  senderUsername: '',
  media: [],
  day: '',
  receiverUsername: '',
  status: '',
  timeNumber: 0,
}

export const ChatStore = create<ChatState>((set) => ({
  unseenCheckIds: [],
  unseenChatIds: [],
  chats: [],
  activeChat: ChatContentEmpty,
  connection: '',
  username: '',
  count: 0,
  current: 0,
  chatUserForm: ChatUserFormEmpty,
  favChatContentResults: [],
  favChatResults: [],
  isAllChecked: false,
  isFriends: false,
  loading: false,
  moveUp: false,
  newCount: 0,
  page_size: 0,
  pendingReadIds: { current: new Set<string>() },
  repliedChat: null,
  searchResult: [],
  selectedFavItems: [],
  selectedItems: [],
  senderUsername: '',
  unread: 0,

  resetPendingReadIds: () => {
    set((state) => {
      state.pendingReadIds.current.clear()
      return { pendingReadIds: state.pendingReadIds }
    })
  },

  processMoreResults: (results) => {
    set({
      loading: false,
      chats: results,
    })
  },

  setActiveChat: (chat) => {
    set({
      activeChat: chat,
    })
  },

  setProcessedResults: (newResults) => {
    set((prev) => {
      // Create a map of newResults by timeNumber for quick lookup
      const newResultsMap = new Map(
        newResults.map((chat) => [chat.timeNumber, chat])
      )

      // Update existing chats with new status if timeNumber matches, otherwise keep or add
      const combined = prev.chats.map((chat) => {
        const newChat = newResultsMap.get(chat.timeNumber)
        if (newChat) {
          return { ...chat, status: newChat.status }
        }
        return chat
      })

      // Add new chats from newResults that don't exist in prev.chats
      const unique = [
        ...combined,
        ...newResults.filter(
          (chat) => !prev.chats.some((c) => c.timeNumber === chat.timeNumber)
        ),
      ]

      // Sort by timeNumber
      unique.sort((a, b) => a.timeNumber - b.timeNumber)

      return {
        loading: false,
        chats: unique,
      }
    })
  },

  // setProcessedResults: (newResults) => {
  //   set((prev) => {
  //     const newResultsMap = new Map(
  //       newResults.map((chat) => [chat.timeNumber, chat])
  //     )

  //     // Update existing chats if they appear in newResults
  //     const updatedChats = prev.chats.map((chat) => {
  //       const newChat = newResultsMap.get(chat.timeNumber)
  //       if (newChat) {
  //         return { ...chat, ...newChat } // merge all updates
  //       }
  //       return chat
  //     })

  //     // Add new chats that don’t already exist
  //     const merged = [
  //       ...updatedChats,
  //       ...newResults.filter(
  //         (chat) => !prev.chats.some((c) => c.timeNumber === chat.timeNumber)
  //       ),
  //     ]

  //     // ✅ Sort oldest → newest
  //     merged.sort((a, b) => {
  //       const dateA = a.createdAt
  //         ? new Date(a.createdAt).getTime()
  //         : Number(a.timeNumber)
  //       const dateB = b.createdAt
  //         ? new Date(b.createdAt).getTime()
  //         : Number(b.timeNumber)
  //       return dateA - dateB // ascending → oldest first
  //     })

  //     return {
  //       loading: false,
  //       chats: merged,
  //     }
  //   })
  // },

  processedAndAddResults: (newResults) => {
    set((prev) => {
      const newResultsMap = new Map(
        newResults.map((chat) => [chat.timeNumber, chat])
      )

      const combined = prev.chats.map((chat) => {
        const newChat = newResultsMap.get(chat.timeNumber)
        if (newChat) {
          return { ...chat, status: newChat.status }
        }
        return chat
      })

      const newChatsOnly = newResults.filter(
        (chat) => !prev.chats.some((c) => c.timeNumber === chat.timeNumber)
      )

      if (newChatsOnly.length > 0) {
        for (let i = 0; i < newChatsOnly.length; i++) {
          const el = newChatsOnly[i]
          // saveOrUpdateMessageInDB(el)
        }
      }

      const unique = [...combined, ...newChatsOnly]

      unique.sort((a, b) => {
        const dateA = a.createdAt
          ? new Date(a.createdAt).getTime()
          : a.timeNumber
        const dateB = b.createdAt
          ? new Date(b.createdAt).getTime()
          : b.timeNumber
        return dateA - dateB
      })

      return {
        loading: false,
        chats: unique,
      }
    })
  },

  setProcessedFavResults: (results) => {
    set({
      loading: false,
      favChatResults: results,
    })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setConnection: (connection: string) => {
    set({ connection: connection })
  },

  getChatUser: async (url) => {
    try {
      const response = await customRequest({ url })

      const data = response?.data
      if (data) {
        set({
          chatUserForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      if (error) return
    }
  },

  getChats: async (url) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        ChatStore.getState().processedAndAddResults(data.results)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getSavedChats: async (connection) => {
    try {
      set({ loading: true })
      // const chats = await getMessagesByConnection(connection)
      // if (chats) {
      //   ChatStore.getState().setProcessedResults(chats)
      // }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getFavChats: async (url: string) => {
    try {
      const response = await customRequest({ url })

      const data = response?.data
      if (data) {
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addChats: async (url: string) => {
    const current = ChatStore.getState().current
    if (ChatStore.getState().newCount === ChatStore.getState().count) {
      return
    }

    try {
      const response = await customRequest({ url: `${url}&page=${current}` })

      const data = response?.data
      if (data) {
        set((state) => {
          return {
            count: data.count,
            current: state.current + 1,
          }
        })
        ChatStore.getState().processMoreResults(data.results)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addNewChat: async (saved: ChatContent) => {
    ChatStore.setState((prev) => {
      const newChat = saved
      const chats = [...prev.chats]
      const updateChats = [...chats, newChat]

      // saveOrUpdateMessageInDB(saved)
      return {
        senderUsername: updateChats[updateChats.length - 1].senderUsername,
        chats: updateChats,
      }
    })
  },

  updatePendingChat: async (newChat) => {
    // updatePendingMessageStatus(
    //   newChat.connection,
    //   Number(newChat.timeNumber),
    //   newChat.status
    // )

    ChatStore.setState((prev) => {
      const updatedResults = prev.chats.map((chat) =>
        chat.timeNumber === newChat.timeNumber ? newChat : chat
      )
      return { chats: updatedResults }
    })
  },

  updateChatsToRead: async (ids, connection) => {
    ChatStore.setState((prev) => {
      const updatedResults = prev.chats.map((chat) => {
        if (ids.includes(chat.timeNumber)) {
          // updatePendingMessageStatus(connection, chat.timeNumber, 'read')
          return { ...chat, status: 'read' }
        } else {
          return chat
        }
      })
      // const newIds = prev.unseenChatIds.filter((id) => !ids.includes(id))
      return { chats: updatedResults }
    })
  },

  addFavChats: async (url: string) => {
    const current = ChatStore.getState().current
    if (ChatStore.getState().newCount === ChatStore.getState().count) {
      return
    }

    try {
      const response = await customRequest({ url: `${url}&page=${current}` })

      const data = response?.data
      if (data) {
        set((state) => {
          return {
            count: data.count,
            current: state.current + 1,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addSearchedChats: async (id: string, createdAt: Date) => {
    try {
      const response = await customRequest({
        url: `/user-messages/add-searched/?chatId=${id}&oldest=${new Date(
          createdAt
        ).getTime()}`,
      })

      const data = response?.data
      if (data) {
        set((state) => {
          return {
            count: data.count,
            current: state.current + 1,
            searchResult: [],
            moveUp: true,
          }
        })
        ChatStore.getState().selectChats(String(data.results[0]._id))
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addFavSearchedChats: async (id, createdAt) => {
    try {
      const response = await customRequest({
        url: `/user-messages/add-searched/?chatId=${id}&oldest=${new Date(
          createdAt
        ).getTime()}`,
      })

      const data = response?.data
      if (data) {
        set((state) => {
          return {
            count: data.count,
            current: state.current + 1,
            searchResult: [],
            moveUp: true,
          }
        })
        ChatStore.getState().selectFavChats(data.results[0].timeNumber)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      chats: state.chats.map((item: ChatContent) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchChats: _debounce(async (url: string) => {
    try {
      const response = await customRequest({ url })

      if (response) {
        const { results } = response?.data
        set({ searchResult: results })
      }
    } catch (error: unknown) {
      console.log(error)
      set({ loading: false })
    }
  }, 1000),

  massDelete: async (url: string, selectedItems: ChatContent[]) => {
    set({
      loading: true,
    })

    const response = await customRequest({
      url,
      method: 'POST',
      showMessage: true,
      data: selectedItems,
    })
    const data = response?.data
    if (data) {
    } else {
      set({
        loading: false,
      })
    }
  },

  deleteItem: async (data: socketResponse) => {
    if (data) {
    }
  },

  postChat: async (url, updatedItem, setMessage) => {
    try {
      const response = await customRequest({
        url,
        method: 'POST',
        showMessage: true,
        data: updatedItem,
      })
      const data = response?.data
      if (data) {
        console.log(data)
      }
    } catch (error) {
      console.log(error)
    }
  },

  updateChatWithFile: async (url, updatedItem) => {
    try {
      const response = await customRequest({
        url,
        method: 'PATCH',
        showMessage: true,
        data: updatedItem,
      })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            chats: prev.chats.map((item) =>
              item.timeNumber === data.chat.timeNumber ? data.chat : item
            ),
          }
        })
        // saveOrUpdateMessageInDB(data.chat)
      }
    } catch (error) {
      console.log(error)
    }
  },

  toggleActive: (index: number) => {
    console.log(index)
  },

  toggleChecked: (index: number) => {
    console.log(index)
  },

  selectChats: (_id: string) => {
    if (_id) {
    }
  },

  selectFavChats: (timeNumber) => {
    set((state) => {
      const chatExists = state.favChatResults.some((group) =>
        group.chats.some((chat) => chat.timeNumber === timeNumber)
      )

      if (!chatExists) {
        const oldestCreatedAt = (() => {
          let oldest: Date | null = null

          ChatStore.getState().favChatResults.forEach((group) => {
            group.chats.forEach((chat) => {
              const chatDate = new Date(chat.timeNumber)
              if (!oldest || chatDate < oldest) {
                oldest = chatDate
              }
            })
          })

          return oldest
        })()

        if (oldestCreatedAt) {
          ChatStore.getState().addFavSearchedChats(timeNumber, oldestCreatedAt)
        }
        return {}
      }

      const updatedResults = state.favChatResults.map((group) => ({
        ...group,
        chats: group.chats.map((chat) => {
          const isChecked =
            chat.timeNumber === timeNumber ? !chat.isChecked : chat.isChecked
          return {
            ...chat,
            isChecked,
            isAlert:
              state.selectedFavItems.length < 2 && !isChecked ? true : false,
          }
        }),
      }))

      const allChats = updatedResults.flatMap((group) => group.chats)
      const updatedSelectedItems = allChats.filter((chat) => chat.isChecked)

      const newUpdatedResults = updatedResults.map((group) => ({
        ...group,
        chats: group.chats.map((chat) => ({
          ...chat,
          isAlert: updatedSelectedItems.length === 0 ? false : true,
        })),
      }))

      const isAllChecked =
        allChats.length > 0 && updatedSelectedItems.length === allChats.length

      return {
        searchResult: [],
        favChatResults: newUpdatedResults,
        selectedFavItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {},
}))

export interface Chat {
  day: string
  chats: ChatContent[]
}

export const Chat = {
  day: '',
  chats: [],
}

export interface ChatContent {
  connection: string
  content: string
  senderUsername: string
  media: PreviewFile[]
  day: string
  receiverUsername: string
  status: string
  timeNumber: number
  deletedUsername?: string
  repliedChat?: RepliedChatContent | null
  isPinned?: boolean
  unread?: number
  unreadCount?: number
  unreadReceiver?: number
  unreadUser?: number
  createdAt?: Date
  senderTime?: Date
  receiverTime?: Date
  isSavedUsernames?: string[]
  _id?: string
  isChecked?: boolean
  isActive?: boolean
  isAlert?: boolean
}

export interface RepliedChatContent {
  content: string
  senderUsername: string
  media: PreviewFile[]
  receiverUsername: string
  senderTime?: Date
  receiverTime?: Date
  _id?: string
}

export interface socketResponse {
  key: string
  id: string
  day: string
  chat: ChatContent
  chats: ChatContent[]
}
