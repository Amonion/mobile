import { useEffect, useState } from 'react'
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
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import Feather from '@expo/vector-icons/Feather'
import { Plus, Send, Smile } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ChatBody from '@/components/Chat/ChatBody'

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
    postChat,
    getSavedChats,
    updateChatsToRead,
    getChats,
    setConnection,
    addNewChat,
  } = ChatStore()
  const { user } = AuthStore()
  const [text, setText] = useState('')
  const { setMessage } = MessageStore()
  const [isOptions, setOptions] = useState(false)
  const pathname = usePathname()
  const [files, setFiles] = useState<PreviewFile[]>([])
  const colorScheme = useColorScheme()
  const { username } = useLocalSearchParams()
  const isDark = colorScheme === 'dark'
  const color = isDark ? '#BABABA' : '#6E6E6E'
  const insets = useSafeAreaInsets()

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
    if (username && user) {
      const key = setConnectionKey(String(username), String(user?.username))
      setConnection(key)
      getSavedChats(key)
      getChats(
        `/chats/?connection=${key}&page_size=40&page=1&ordering=-createdAt&deletedUsername[ne]=${user.username}&username=${user.username}`,
        setMessage
      )
    }
  }, [username, user, pathname])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (unseenChatIds.length > 0) {
        updateChatStatus()
        updateChatsToRead(unseenChatIds, connection)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [unseenChatIds.length])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (unseenCheckIds.length > 0) {
        checkChatStatus()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [unseenCheckIds.length])

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

  const setConnectionKey = (id1: string, id2: string) => {
    const participants = [id1, id2].sort()
    return participants.join('')
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

  const serializeFiles = async (files: File[]) => {
    const serialized = await Promise.all(
      files.map(async (file, index) => {
        const buffer = await file.arrayBuffer()
        const blob = new Blob([buffer], { type: file.type })
        const previewUrl = URL.createObjectURL(blob)

        return {
          index,
          file,
          name: file.name,
          type: file.type,
          size: file.size,
          status: 'pending', // will become "uploaded" later
          blob,
          previewUrl, // for local preview
          url: '', // ✅ empty now, to be filled with bucket URL later
        } as PreviewFile
      })
    )

    return serialized
  }

  const pickImagesVideos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    })

    if (!result.canceled) {
      // onSelect(result.assets);
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

  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    setOptions(false)

    const filesArray = Array.from(selectedFiles)

    const newFiles: PreviewFile[] = await Promise.all(
      filesArray.map(async (file, index) => {
        const url = URL.createObjectURL(file)

        const type = file.type.startsWith('video')
          ? 'video'
          : file.type.startsWith('image')
          ? 'image'
          : file.type.startsWith('audio')
          ? 'audio'
          : 'other'

        const name = file.name.replace(/\.[^/.]+$/, '')
        const size = +(file.size / (1024 * 1024)).toFixed(2)
        const status = 'pending'
        let pages = 0

        if (file.type === 'application/pdf') {
          try {
            pages = await getPdfPageCount(file)
          } catch (error) {
            console.error('Error getting PDF pages:', error)
          }
        }

        return {
          index,
          file,
          url,
          previewUrl: url,
          name,
          type,
          status,
          size,
          pages,
        } as PreviewFile
      })
    )

    // preserve existing indices, append new ones correctly
    setFiles((prev) => {
      const baseIndex = prev.length
      const indexedFiles = newFiles.map((f, i) => ({
        ...f,
        index: baseIndex + i,
      }))
      return [...prev, ...indexedFiles]
    })
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
        isFriends: friendForm.isFriends,
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
        media: await serializeFiles(
          files.map((f) => f.file).filter((f): f is File => f instanceof File)
        ),
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
        media: await serializeFiles(
          files.map((f) => f.file).filter((f): f is File => f instanceof File)
        ),
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
      if (files.length > 0) {
        postChat('/chats', form, setMessage)
      } else {
        socket.emit('message', form)
      }
      setFiles([])
      setText('')

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
            <View
              style={[
                styles.container,
                files.length === 1 ? { width: 300 } : {},
              ]}
            >
              <View
                style={[
                  styles.grid,
                  files.length > 1 ? styles.gridTwo : styles.gridOne,
                ]}
              >
                {files.map((item, index) => (
                  <View key={index} style={styles.mediaWrapper}>
                    {item.type === 'image' ? (
                      <Image
                        source={{ uri: item.previewUrl }}
                        style={styles.media}
                        resizeMode="cover"
                      />
                    ) : item.type === 'video' ? (
                      <Video
                        source={{ uri: String(item.previewUrl) }}
                        style={styles.media}
                        resizeMode={ResizeMode.COVER}
                        isMuted
                        onLoad={(status) => {
                          if (status.isLoaded && status.durationMillis) {
                            files[index].duration = status.durationMillis / 1000
                          }
                        }}
                      />
                    ) : null}

                    <View style={styles.typeIcon}>
                      {item.type === 'image' ? (
                        <Feather name="image" size={12} color="#fff" />
                      ) : item.type === 'video' ? (
                        <Feather name="video" size={12} color="#fff" />
                      ) : (
                        <Feather name="file" size={12} color="#fff" />
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeFile(index)}
                    >
                      <Feather name="x" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View className="flex-1 sm:px-0 px-1 relative">
            <ChatBody />
          </View>
          {/* {activeChat.timeNumber > 0 && <ChatActions e={activeChat} />} */}
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
              style={{ flex: 1, flexGrow: 1, justifyContent: 'flex-end' }}
            >
              <View
                style={{ paddingBottom: insets.bottom }}
                className="flex-row w-full items-end bg-primary p-2 dark:bg-dark-primary"
              >
                {isOptions && (
                  <View
                    style={{
                      position: 'absolute',
                      left: 10,
                      bottom: 60,
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
                  onPress={() => setOptions(!isOptions)}
                  style={{ marginBottom: 10 }}
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

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <TouchableOpacity>
                    <Smile
                      size={20}
                      color="#DA3986"
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>

                  {(files.length > 0 ||
                    text.replace(/<[^>]*>/g, '').trim().length > 0) && (
                    <TouchableOpacity
                      onPress={postMessage}
                      style={{ marginLeft: 8 }}
                    >
                      <Send
                        size={20}
                        color="#DA3986"
                        style={{ transform: [{ rotate: '-45deg' }] }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
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
    alignSelf: 'center',
    zIndex: 40,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'var(--primary)',
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
  mediaWrapper: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    width: 150,
    height: 150,
    margin: 4,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  typeIcon: {
    position: 'absolute',
    top: 6,
    left: 6,
    height: 24,
    width: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: 24,
    width: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default Chats
