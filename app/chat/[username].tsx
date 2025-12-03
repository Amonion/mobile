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
  Text,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  FlatList,
} from 'react-native'
import { Plus, Send } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ChatBody from '@/components/Chat/ChatBody'
import { Directory, File, Paths } from 'expo-file-system'
import PreloadChatMedia from '@/components/Chat/PreloadChatMedia'
import ChatOptions from '@/components/Chat/ChatOptions'
import * as VideoThumbnails from 'expo-video-thumbnails'
import * as FileSystem from 'expo-file-system'

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
  const [fileType, setFileType] = useState('')
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
    if (files.length > 0) {
      if (files[0].type.includes('audio')) {
        setFileType('Audio')
        postAudio()
      } else if (
        files[0].type.includes('image') ||
        files[0].type.includes('video')
      ) {
        setFileType('Media')
      } else {
        setFileType('Document')
      }
    }
  }, [files])

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

  const pickImagesVideos = async () => {
    const getExtension = (asset: ImagePicker.ImagePickerAsset): string => {
      const uri = asset.uri?.toLowerCase() ?? ''

      const match = uri.match(/\.(\w+)(\?|$)/)
      if (match) return match[1]

      if (asset.type === 'video') {
        if (asset.type?.includes('quicktime')) return 'mov'
        return 'mp4'
      }
      if (asset.type === 'image') return 'jpg'

      return 'bin'
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
      })

      if (result.canceled) return

      const assets = result.assets || []
      if (assets.length === 0) return

      const chatMediaDir = new Directory(Paths.cache, 'chat_media')
      if (!chatMediaDir.exists) chatMediaDir.create({ intermediates: true })

      const newFiles: PreviewFile[] = await Promise.all(
        assets.map(async (asset, i) => {
          const ext = getExtension(asset)

          const name = `media_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}.${ext}`

          const dest = new File(chatMediaDir, name)
          if (dest.exists) await dest.delete()

          await new File(asset.uri).copy(dest)

          const type: PreviewFile['type'] =
            asset.type === 'video' ? 'video' : 'image'

          let previewUrl: string = dest.uri
          let poster: string | undefined

          if (type === 'video') {
            try {
              const { uri: thumbnail } =
                await VideoThumbnails.getThumbnailAsync(asset.uri, {
                  time: 1000,
                })
              previewUrl = thumbnail
              poster = thumbnail
            } catch (err) {
              console.warn('Thumbnail failed', err)
            }
          }

          return {
            index: i,
            uri: dest.uri,
            previewUrl,
            poster,
            name,
            type,
            originalName: asset.fileName || name,
            size: asset.fileSize ?? 0,

            // 🔥 FIXED: remove null → convert null to undefined
            duration: asset.duration ?? undefined,

            status: 'pending',
          }
        })
      )
      setOptions(false)
      setFiles((prev) => {
        const base = prev.length
        return [...prev, ...newFiles.map((f, i) => ({ ...f, index: base + i }))]
      })
    } catch (err) {
      console.error('Error selecting media:', err)
    }
  }

  // const pickDocuments = async () => {
  //   const result = await DocumentPicker.getDocumentAsync({
  //     type: [
  //       'application/pdf',
  //       'application/msword',
  //       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //       'application/vnd.ms-powerpoint',
  //       'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  //       'application/vnd.ms-excel',
  //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //       'text/plain',
  //       'audio/*',
  //     ],
  //     multiple: true,
  //   })

  //   if (result.assets) {
  //     // onSelect(result.assets);
  //   }
  // }

  const pickDocuments = async () => {
    const getExtension = (
      asset: DocumentPicker.DocumentPickerAsset
    ): string => {
      if (asset.name && asset.name.includes('.')) {
        return asset.name.split('.').pop()!.toLowerCase()
      }

      if (asset.mimeType?.includes('/')) {
        const guess = asset.mimeType.split('/').pop()
        return guess || 'bin'
      }

      return 'bin'
    }

    try {
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
        copyToCacheDirectory: true,
      })

      if (result.canceled || !result.assets || result.assets.length === 0)
        return

      const chatMediaDir = new Directory(Paths.cache, 'chat_media')
      if (!chatMediaDir.exists) chatMediaDir.create({ intermediates: true })

      const newFiles: PreviewFile[] = await Promise.all(
        result.assets.map(async (asset, i) => {
          const ext = getExtension(asset)

          const name = `file_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}.${ext}`

          const dest = new File(chatMediaDir, name)
          if (dest.exists) await dest.delete()

          // copy selected doc → local cache folder
          await new File(asset.uri).copy(dest)

          // Determine type
          let type: PreviewFile['type'] = 'file'
          if (asset.mimeType?.startsWith('audio')) type = 'audio'

          return {
            index: i,
            uri: dest.uri,
            previewUrl: dest.uri,
            name,
            type,
            originalName: asset.name || name,
            size: asset.size ?? 0,
            duration: undefined,
            poster: undefined,
            status: 'pending',
          }
        })
      )

      setOptions(false)

      setFiles((prev) => {
        const base = prev.length
        return [...prev, ...newFiles.map((f, i) => ({ ...f, index: base + i }))]
      })
    } catch (err) {
      console.error('Document picker error:', err)
    }
  }

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        multiple: true,
        copyToCacheDirectory: true,
      })

      if (result.canceled || !result.assets) return

      const audioFiles = result.assets.map((asset) => {
        const uri = asset.uri
        const name = asset.name || 'audio'
        const mime = asset.mimeType || 'audio/mpeg'
        const size = asset.size ?? 0

        const extMatch = name.match(/\.(\w+)$/)
        const ext = extMatch ? extMatch[1] : 'mp3'

        return {
          uri,
          name,
          type: mime,
          extension: ext,
          size,
          status: 'pending' as const,
        }
      })
      setOptions(false)
      setFiles((prev) => {
        const base = prev.length
        return [
          ...prev,
          ...audioFiles.map((f, i) => ({ ...f, index: base + i })),
        ]
      })
      return audioFiles
    } catch (err) {
      console.error('Audio picker error:', err)
    }
  }

  // const pickAudio = async () => {
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({
  //       type: ['audio/*'],
  //       multiple: true,
  //       copyToCacheDirectory: true,
  //     })

  //     if (result.canceled || !result.assets) return

  //     // Create chat_media folder if missing
  //     const chatMediaDir = new Directory(Paths.cache, 'chat_media')
  //     if (!chatMediaDir.exists) {
  //       chatMediaDir.create({ intermediates: true })
  //     }

  //     const audioFiles = await Promise.all(
  //       result.assets.map(async (asset, i) => {
  //         const originalUri = asset.uri
  //         const size = asset.size ?? 0
  //         const name = asset.name || `audio_${Date.now()}.mp3`

  //         const extMatch = name.match(/\.(\w+)$/)
  //         const ext = extMatch ? extMatch[1] : 'mp3'

  //         const finalName = `audio_${Date.now()}_${Math.random()
  //           .toString(36)
  //           .slice(2)}.${ext}`

  //         const dest = new File(chatMediaDir, finalName)
  //         if (dest.exists) await dest.delete()

  //         // Copy file using react-native-file-access
  //         new File(originalUri).copy(dest)

  //         return {
  //           index: i,
  //           uri: dest.uri,
  //           previewUrl: dest.uri,
  //           name: finalName,
  //           type: 'audio',
  //           size,
  //           duration: 0,
  //           status: 'pending' as const,
  //         }
  //       })
  //     )

  //     setFiles((prev) => [...prev, ...audioFiles])

  //     return audioFiles
  //   } catch (err) {
  //     console.error('Audio picker error:', err)
  //   }
  // }
  const postAudio = async () => {
    for (let i = 0; i < files.length; i++) {
      const el = files[i]
      uploadChat('', [el], 'Audio')
    }
  }

  const postMessage = async () => {
    if (text.trim().length === 0 && files.length === 0) {
      setMessage(`No message to send to `, false)
      return
    }

    uploadChat(text, files, 'Media')
  }

  const uploadChat = async (
    msg: string,
    mediaFiles: PreviewFile[],
    type: string
  ) => {
    if (socket) {
      const timeNumber = new Date().getTime()

      const form = {
        to: 'chat',
        action: 'post',
        content: msg,
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
        media: mediaFiles,
      }

      const friendChat = {
        content: msg,
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
        media: mediaFiles,
        isFriends: friendForm.isFriends,
        isOnline: false,
      }

      const saved = {
        connection: connection,
        content: msg,
        repliedChat: form.repliedChat,
        senderUsername: String(user?.username),
        media: mediaFiles,
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
      if (mediaFiles.length > 0) {
        postChat('/chats', form, setMessage)
      } else {
        socket.emit('message', form)
      }
      if (type === 'Media') {
        setText('')
      }
      setFiles([])
      setFileType('')
      setOptions(false)
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
          {fileType === 'Media' && files.length > 0 && (
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
              className="flex-row w-full items-end bg-primary dark:bg-dark-primary z-40"
            >
              <ChatOptions
                isOptions={isOptions}
                setOptions={setOptions}
                pickImagesVideos={pickImagesVideos}
                pickDocuments={pickDocuments}
                pickAudio={pickAudio}
              />

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

export default Chats
