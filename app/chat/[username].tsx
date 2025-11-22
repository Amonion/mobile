import { useEffect, useRef, useState } from 'react'
import { formatDateToDDMMYY, getPdfPageCount } from '@/lib/helpers'
import FriendStore from '@/store/chat/Friend'
import SocketService from '@/store/socket'
import { ChatStore, PreviewFile } from '@/store/chat/Chat'
import { AuthStore } from '@/store/AuthStore'
import { MessageStore } from '@/store/notification/Message'
import { useLocalSearchParams, usePathname } from 'expo-router'
import ChatHead from '@/components/Chat/ChatHead'
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  FlatList,
} from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import Feather from '@expo/vector-icons/Feather'
import { Plus, Send } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ChatBody from '@/components/Chat/ChatBody'
import { Directory, File, Paths } from 'expo-file-system'
import PreloadChatMedia from '@/components/Chat/PreloadChatMedia'
const Chats = () => {
  const { updateFriendsChat, friendForm } = FriendStore()
  const socket = SocketService.getSocket()
  const {
    chats,
    activeChat,
    repliedChat,
    connection,
    chatUserForm,
    unseenChatIds,
    unseenCheckIds,
    isFriends,
    postChat,
    updateChatsToRead,
    addNewChat,
  } = ChatStore()
  const { user } = AuthStore()
  const [text, setText] = useState('')
  const { setMessage } = MessageStore()
  const [isOptions, setOptions] = useState(false)
  const [files, setFiles] = useState<PreviewFile[]>([])
  const colorScheme = useColorScheme()
  const { username } = useLocalSearchParams()
  const isDark = colorScheme === 'dark'
  const color = isDark ? '#BABABA' : '#6E6E6E'
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const pathname = usePathname()

  useEffect(() => {
    return () => {
      ChatStore.setState({
        current: 2,
        newCount: 0,
        connection: '',
      })
    }
  }, [])

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true })
  }, [chats.length])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (unseenChatIds.length > 0 && pathname === `/chat/${username}`) {
        updateChatStatus()
        updateChatsToRead(unseenChatIds, connection)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [unseenChatIds.length, pathname])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (unseenCheckIds.length > 0 && pathname === `/chat/${username}`) {
        checkChatStatus()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [unseenCheckIds.length, pathname])

  const updateChatStatus = () => {
    if (socket) {
      const form = {
        to: 'read',
        ids: unseenChatIds,
        senderUsername: chatUserForm.username,
        receiverUsername: user?.username,
        connection: connection,
      }

      socket.emit('message', form)
      ChatStore.setState({
        unseenChatIds: [],
      })
    }
  }

  const checkChatStatus = () => {
    if (socket) {
      const form = {
        to: 'checkRead',
        ids: unseenCheckIds,
        senderUsername: user?.username,
        connection: connection,
      }

      socket.emit('message', form)
      ChatStore.setState({
        unseenCheckIds: [],
      })
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newList = [...prev]

      const fileToRemove = newList[index]
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl)
      }

      newList.splice(index, 1)
      return newList
    })
  }

  // const pickImagesVideos = async () => {
  //   try {
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.All,
  //       allowsMultipleSelection: true,
  //       quality: 1,
  //     })

  //     if (result.canceled) return

  //     setOptions(false)

  //     const assets = result.assets || []

  //     const newFiles: PreviewFile[] = assets.map((asset, i) => {
  //       const uri = asset.uri

  //       // Extract clean filename
  //       const name =
  //         uri
  //           .split('/')
  //           .pop()
  //           ?.replace(/\.[^/.]+$/, '') || `file_${Date.now()}`

  //       const sizeMB = asset.fileSize
  //         ? +(asset.fileSize / (1024 * 1024)).toFixed(2)
  //         : 0

  //       let type: 'image' | 'video' | 'audio' | 'other' = 'other'
  //       if (asset.type === 'image') type = 'image'
  //       else if (asset.type === 'video') type = 'video'

  //       console.log(asset, asset.type)

  //       return {
  //         index: i,
  //         uri,
  //         name,
  //         type,
  //         size: sizeMB,
  //         status: 'pending',
  //         pages: 0,
  //         previewUrl: type === 'image' ? uri : undefined, // Only images
  //         poster: type === 'video' ? uri : undefined, // Videos get poster only
  //       }
  //     })

  //     // preserve previous files + index increment
  //     setFiles((prev) => {
  //       const baseIndex = prev.length

  //       const indexedFiles = newFiles.map((f, i) => ({
  //         ...f,
  //         index: baseIndex + i,
  //       }))

  //       return [...prev, ...indexedFiles]
  //     })
  //   } catch (err) {
  //     console.error('Error selecting media:', err)
  //   }
  // }

  const pickImagesVideos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      })

      if (result.canceled) return

      const assets = result.assets || []
      if (assets.length === 0) return

      // NEW API: Create Directory object (cache/chat_media/)
      const chatMediaDir = new Directory(Paths.cache, 'chat_media')

      // NEW API: Check if exists (synchronous, no getInfoAsync)
      if (!chatMediaDir.exists) {
        // NEW API: Create directory (synchronous, with intermediates)
        chatMediaDir.create({ intermediates: true })
      }

      const newFiles: PreviewFile[] = await Promise.all(
        assets.map(async (asset, i) => {
          const fileName = `media_${Date.now()}_${i}${
            asset.fileName ? `_${asset.fileName}` : ''
          }`

          // NEW API: Create File object in the directory
          const localFile = new File(chatMediaDir, fileName)
          const localUri = localFile.uri

          // NEW API: Copy file (synchronous, no copyAsync)
          const sourceFile = new File(asset.uri)
          sourceFile.copy(localFile)

          const type: PreviewFile['type'] =
            asset.type === 'image'
              ? 'image'
              : asset.type === 'video'
              ? 'video'
              : 'other'

          return {
            index: i,
            uri: localUri,
            previewUrl: type === 'image' ? localUri : undefined,
            poster: type === 'video' ? localUri : undefined,
            name: fileName.replace(/\.[^/.]+$/, '') || 'file',
            type,
            size: asset.fileSize ?? 0,
            status: 'pending' as const,
          }
        })
      )

      setFiles((prev) => {
        const baseIndex = prev.length
        return [
          ...prev,
          ...newFiles.map((f, i) => ({ ...f, index: baseIndex + i })),
        ]
      })

      setOptions(false)
    } catch (err) {
      console.error('Error selecting media:', err)
    }
  }

  const pickDocuments = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'audio/*',
      ],
      multiple: true,
    })

    if (result.assets) {
      // onSelect(result.assets);
    }
  }

  const postMessage = async () => {
    if (text.trim().length === 0 && files.length === 0) {
      setMessage(`No message to send to `, false)
      return
    }

    if (socket) {
      const timeNumber = new Date().getTime()

      const form = {
        to: 'chat',
        action: 'post',
        content: text,
        day: formatDateToDDMMYY(new Date()),
        connection: connection,
        repliedChat: repliedChat,
        isFriends: isFriends,
        senderDisplayName: String(user?.displayName),
        senderUsername: String(user?.username),
        senderPicture: String(user?.picture),
        receiverUsername: chatUserForm.username,
        receiverPicture: String(chatUserForm.picture),
        receiverDisplayName: chatUserForm.displayName,
        senderTime: new Date().toISOString(),
        time: new Date().getTime(),
        updatedAt: new Date(),
        timeNumber: timeNumber,
        media: files,
      }

      const friendChat = {
        content: text,
        connection: connection,
        senderDisplayName: String(user?.displayName),
        senderUsername: String(user?.username),
        senderPicture: String(user?.picture),
        receiverUsername: chatUserForm.username,
        receiverPicture: String(chatUserForm.picture),
        receiverDisplayName: chatUserForm.displayName,
        status: 'pending',
        senderTime: new Date().toISOString(),
        timeNumber: timeNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: files,
        isFriends: friendForm.isFriends,
        isOnline: false,
      }

      const saved = {
        connection: connection,
        content: form.content,
        repliedChat: form.repliedChat,
        senderUsername: String(user?.username),
        media: files,
        day: form.day,
        receiverUsername: form.receiverUsername,
        status: 'pending',
        senderTime: new Date(),
        createdAt: new Date(),
        timeNumber: timeNumber,
        receiverTime: new Date(),
      }

      if (
        !friendForm.isFriends &&
        chats.length > 0 &&
        user?.username === chats[0].receiverUsername
      ) {
        FriendStore.setState((prev) => {
          return {
            friendForm: { ...prev.friendForm, isFriends: true },
          }
        })
      }
      updateFriendsChat(friendChat)
      addNewChat(saved)
      console.log('The files are: ', files)
      if (files.length > 0) {
        postChat('/chats', form, setMessage)
      } else {
        socket.emit('message', form)
      }
      setFiles([])
      setText('')
      Keyboard.dismiss()
      ChatStore.setState(() => {
        return {
          repliedChat: null,
        }
      })
    } else {
      setMessage(`Sorry, something went wrong, refresh and try again.`, false)
    }
  }

  return (
    <>
      {username ? (
        <View className="flex-1 bg-secondary dark:bg-dark-secondary relative">
          <ChatHead />
          {files.length > 0 && (
            <PreloadChatMedia files={files} removeFile={removeFile} />
          )}

          <View className="flex-1 sm:px-0 px-1 relative">
            <ChatBody />
          </View>

          {/* {activeChat.timeNumber > 0 && <ChatActions e={activeChat} />} */}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            style={{ justifyContent: 'flex-end' }}
          >
            <View
              style={{ paddingBottom: insets.bottom }}
              className="flex-row w-full items-end bg-primary dark:bg-dark-primary"
            >
              {isOptions && (
                <View
                  style={{
                    position: 'absolute',
                    left: 10,
                    bottom: 100,
                    backgroundColor: isDark ? '#1C1E21' : '#FFFFFF',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#333',
                    overflow: 'hidden',
                  }}
                >
                  <TouchableOpacity
                    onPress={pickImagesVideos}
                    style={{
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Feather
                      name="image"
                      size={18}
                      color={isDark ? '#EFEFEF' : '#3A3A3A'}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={{ color: isDark ? '#EFEFEF' : '#3A3A3A' }}>
                      Upload Images & Videos
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={pickDocuments}
                    style={{
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Feather
                      name="music"
                      size={18}
                      color={isDark ? '#EFEFEF' : '#3A3A3A'}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={{ color: isDark ? '#EFEFEF' : '#3A3A3A' }}>
                      Upload Sound
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={pickDocuments}
                    style={{
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Feather
                      name="file"
                      size={18}
                      color={isDark ? '#EFEFEF' : '#3A3A3A'}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={{ color: isDark ? '#EFEFEF' : '#3A3A3A' }}>
                      Upload Documents
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                onPress={() => setOptions(!isOptions)}
                style={{ padding: 10 }}
              >
                <Plus size={26} color="#DA3986" />
              </TouchableOpacity>
              <TextInput
                placeholder="Write a comment..."
                onChangeText={setText}
                value={text}
                className="flex-1 rounded-[25px] bg-secondary dark:bg-dark-secondary px-4 py-3 text-primary dark:text-dark-primary"
                placeholderTextColor={color}
                style={{
                  minHeight: 40,
                  maxHeight: 120,
                  textAlignVertical: 'top',
                }}
                multiline
                numberOfLines={4}
                returnKeyType="send"
                onSubmitEditing={postMessage}
              />

              {files.length === 0 &&
                text.replace(/<[^>]*>/g, '').trim().length === 0 && (
                  <View style={{ padding: 8 }}></View>
                )}
              {(files.length > 0 ||
                text.replace(/<[^>]*>/g, '').trim().length > 0) && (
                <TouchableOpacity
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  onPress={postMessage}
                  style={{ padding: 8 }}
                >
                  <Send size={20} color="#DA3986" />
                </TouchableOpacity>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      ) : (
        <View className="h-full text-custom w-full flex justify-center items-center">
          <Text className="text-center">Empty Person</Text>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 40,
    top: '50%',
    left: '50%',
    transform: [
      { translateX: '-50%' }, // -50%
      { translateY: '-50%' }, // -50%
    ],
    padding: 12,
    borderRadius: 10,
  },
  grid: {
    gap: 8,
  },
  gridOne: {
    flexDirection: 'column',
  },
  gridTwo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
})

export default Chats
