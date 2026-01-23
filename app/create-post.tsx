'use client'
import React, { useState, useEffect } from 'react'
import {
  View,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  useWindowDimensions,
} from 'react-native'
import { getFileType, truncateString } from '@/lib/helpers'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker'
import RenderHtml from 'react-native-render-html'
import SocketService from '@/store/socket'
import { useRouter } from 'expo-router'
import { ImageUp, ListChecks, Trash, Upload, X } from 'lucide-react-native'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { IMedia, Media, Poll, Post, PostStore } from '@/store/post/Post'
import { MessageStore } from '@/store/notification/Message'
import { AuthStore } from '@/store/AuthStore'
import Spinner from '@/components/Response/Spinner'
import CreatePostMedia from '@/components/Posts/CreatePostMedia'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface Response {
  data: Post
  message: string
}
type file = {
  type: string
  source: string
  preview: string
}

interface RNFile {
  uri: string
  name: string
  type: string
}

const PostBox: React.FC = () => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { width } = useWindowDimensions()
  const [content, setContent] = useState<string>('')
  const [polls, addPoll] = useState<Poll[]>([])
  const { setMessage, baseURL } = MessageStore()
  const [files, setFiles] = useState<file[]>([])
  const { user } = AuthStore()
  const [isLoading, setLoading] = useState(false)
  const [color, setColor] = useState('')
  const socket = SocketService.getSocket()
  const router = useRouter()
  const [onPoll, setOnPoll] = useState(false)
  const [pollPicture, setPollPicture] = useState<string | null>(null)
  const [pollText, setPollText] = useState('')
  const [isColorPicker, setIsColorPicker] = useState(false)
  const [canAddPoll, setCanAddPoll] = useState(false)
  const [canSendPoll, setCanSendPoll] = useState(false)
  const insets = useSafeAreaInsets()

  const colors = [
    '#da3986',
    '#1877F2',
    '#00BFA6',
    '#FF6F00',
    '#F44336',
    '#d1d5db',
  ]
  // const [keyboardVisible, setKeyboardVisible] = useState(false)

  // useEffect(() => {
  //   const showSub = Keyboard.addListener('keyboardDidShow', () =>
  //     setKeyboardVisible(true)
  //   )
  //   const hideSub = Keyboard.addListener('keyboardDidHide', () =>
  //     setKeyboardVisible(false)
  //   )
  //   return () => {
  //     showSub.remove()
  //     hideSub.remove()
  //   }
  // }, [])

  useEffect(() => {
    if (pollPicture || pollText) {
      setCanAddPoll(true)
      setCanSendPoll(false)
    } else {
      setCanAddPoll(false)
    }

    if (polls.length > 1 && (!pollPicture || !pollText)) {
      setCanSendPoll(true)
    } else {
      setCanSendPoll(false)
    }
  }, [pollPicture, pollText, polls])

  useEffect(() => {
    if (!socket) return

    socket.on(`post_${user?.username}`, (data: Response) => {
      setLoading(false)
      const transformedMedia: IMedia[] = Array.isArray(data.data.media)
        ? data.data.media.map((item: Media) => ({
            postId: data.data._id,
            src: item.source,
            preview: item.preview,
            type: data.data.backgroundColor ? 'poster' : item.type,
            content: data.data.content,
            replies: data.data.replies,
            backgroundColor: data.data.backgroundColor,
          }))
        : []
      PostStore.setState((prev) => ({
        postResults: [{ ...data.data, viewed: true }, ...prev.postResults],
        mediaResults:
          transformedMedia.length > 0
            ? [...transformedMedia, ...prev.mediaResults]
            : [...prev.mediaResults],
      }))
      setLoading(false)
      router.push('/home')
      setMessage(data.message, true)
      // playSound()
    })

    return () => {
      setLoading(false)
      socket.off(`post_${user?.username}`)
    }
  }, [socket])

  const submitPost = async () => {
    if (files.length === 0 && polls.length === 0 && !content) {
      setMessage('Your post is empty and cannot be submitted.', false)
      return
    }
    if (socket) {
      const postData = {
        to: 'post',
        content: content,
        postType: 'main',
        polls: polls,
        userMedia: user?.media,
        sender: {
          picture: user?.picture,
          displayName: user?.displayName,
          username: user?.username,
          _id: user?._id,
          isVerified: user?.isVerified,
        },
        createdAt: new Date().toISOString(),
        media: files,
        country: user?.country,
        backgroundColor: color,
      }

      setLoading(true)
      socket.emit('message', postData)
    } else {
      setMessage(`Sorry, something went wrong, refresh and try again.`, false)
    }
  }

  const handleFileUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      alert('Permission to access media library is required!')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
    })

    if (!result.canceled) {
      const selectedFiles = result.assets

      const initialFiles = selectedFiles.map((asset) => ({
        type: getFileType(asset),
        source: '',
        preview: asset.uri,
        progress: 0,
      }))
      setFiles(initialFiles)

      for (let i = 0; i < selectedFiles.length; i++) {
        const asset = selectedFiles[i]
        const type = getFileType(asset)

        const file = {
          uri: asset.uri,
          name: asset.fileName ?? `file-${Date.now()}`,
          type: type ?? 'image/jpeg',
        }

        await uploadFile(file, i, type)
      }
    }
  }

  const uploadFile = async (file: RNFile, index: number, type: string) => {
    try {
      setLoading(true)

      let previewUri = file.uri
      if (type.startsWith('video')) {
        try {
          const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
            file.uri,
            { time: 1000 }
          )
          previewUri = thumbnailUri
        } catch (err) {
          console.warn('Failed to generate video thumbnail:', err)
        }
      }

      setFiles((prevs) => {
        const updated = [...prevs]
        updated[index] = {
          ...updated[index],
          preview: previewUri,
        }
        return updated
      })

      const { data } = await axios.post(
        `https://server1.kencoins.com/api/v1/s3-presigned-url`,
        {
          fileName: file.name,
          fileType: file.type,
        }
      )

      const { uploadUrl } = data

      const response = await fetch(file.uri)
      const blob = await response.blob()

      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = reject
        reader.readAsArrayBuffer(blob)
      })

      await axios.put(uploadUrl, arrayBuffer, {
        headers: { 'Content-Type': file.type },
      })

      const publicUrl = uploadUrl.split('?')[0]

      setFiles((prevs) => {
        const updated = [...prevs]
        updated[index] = {
          type,
          source: publicUrl,
          preview: previewUri,
        }
        return updated
      })

      setLoading(false)
      return publicUrl
    } catch (error) {
      console.error('Upload failed:', error)
      setLoading(false)
    }
  }

  const handleAddPoll = () => {
    if (pollText.trim().length === 0) {
      setMessage(`Cannot add poll with empty text.`, false)
      return
    }
    const poll: Poll = {
      text: pollText,
      index: polls.length,
      picture: pollPicture ? pollPicture : '',
      percent: 0,
      userId: '',
    }

    addPoll((prev) => [...prev, poll])
    setPollPicture(``)
    setPollText(``)
  }

  const selectColor = (color: string) => {
    if (color === '#d1d5db') {
      setColor('')
    } else {
      setColor(color)
    }
    setIsColorPicker(false)
  }

  const removePollingFile = async (source: string) => {
    try {
      setLoading(true)
      const fileKey = source.split('.com/')[1]
      await axios.post(`https://server1.kencoins.com/api/v1/s3-delete-file`, {
        fileKey,
      })
    } catch (error) {
      console.error('Failed to delete file from S3:', error)
    } finally {
      setLoading(false)
    }
  }

  const removePoll = async (poll: Poll, index: number) => {
    try {
      if (poll.picture) {
        removePollingFile(poll.picture)
      }
      setLoading(true)
      addPoll((prevPoll) => prevPoll.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Failed to delete file from S3:', error)
    } finally {
      setLoading(false)
    }
  }

  const pollFileUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        alert('Permission to access media library is required!')
        return
      }

      setLoading(true)

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
      })

      if (result.canceled) return
      const asset = result.assets[0]
      const type = getFileType(asset)

      const file = {
        uri: asset.uri,
        name: asset.fileName ?? `file-${Date.now()}`,
        type: type ?? 'image/jpeg',
      }

      const { data } = await axios.post(
        `https://server1.kencoins.com/api/v1/s3-presigned-url`,
        {
          fileName: file.name,
          fileType: file.type,
        }
      )

      const { uploadUrl } = data
      const response = await fetch(file.uri)
      const blob = await response.blob()
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = reject
        reader.readAsArrayBuffer(blob)
      })

      await axios.put(uploadUrl, arrayBuffer, {
        headers: { 'Content-Type': file.type },
      })

      const publicUrl = uploadUrl.split('?')[0]
      setPollPicture(() => {
        setLoading(false)
        return publicUrl
      })
      return publicUrl
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFile = async (index: number, source: string) => {
    try {
      setLoading(true)
      const fileKey = source.split('.com/')[1]
      await axios.post(`https://server1.kencoins.com/api/v1/s3-delete-file`, {
        fileKey,
      })
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Failed to delete file from S3:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="bg-secondary flex flex-1 dark:bg-dark-secondary">
      <View className="bg-primary py-2 dark:bg-dark-primary mb-auto">
        <View
          style={{
            marginTop: Platform.OS === 'ios' ? insets.top : insets.top,
          }}
          className="flex-row px-3 items-start"
        >
          <Image
            source={{ uri: String(user?.picture) }}
            className="rounded-full"
            style={{
              width: 55,
              height: 55,
              marginRight: 10,
            }}
          />

          <View>
            <View className="flex-row items-center">
              <Text className="font-semibold mr-2 text-xl text-primary dark:text-dark-primary line-clamp-1 overflow-ellipsis">
                {user?.displayName}
              </Text>
            </View>
            <TouchableOpacity>
              <Text className="text-custom">@{user?.username}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            onPress={() => router.back()}
            className="ml-auto bg-secondary dark:bg-dark-secondary rounded-full w-12 h-12 justify-center items-center"
          >
            <X size={23} color={isDark ? '#848484' : '#A4A2A2'} />
          </TouchableOpacity>
        </View>

        {color && files.length === 0 ? (
          <View
            className="flex justify-center mt-3 px-3 items-center"
            style={{
              backgroundColor: color,
              height: 250,
              width: '100%',
              position: 'relative',
            }}
          >
            <RenderHtml
              contentWidth={width}
              source={{ html: truncateString(content, 220) }}
              baseStyle={{
                color: '#FFF',
                fontSize: 17,
                fontWeight: 400,
                lineHeight: 23,
                textAlign: 'center',
              }}
              tagsStyles={{
                a: {
                  color: '#DA3986',
                  textDecorationLine: 'underline',
                },
              }}
            />
          </View>
        ) : (
          <>
            <View className="px-3 mt-3">
              <RenderHtml
                contentWidth={width}
                source={{ html: truncateString(content, 220) }}
                baseStyle={{
                  color: isDark ? '#EFEFEF' : '#3A3A3A',
                  fontSize: 17,
                  fontWeight: 400,
                  lineHeight: 23,
                }}
                tagsStyles={{
                  a: {
                    color: '#DA3986',
                    textDecorationLine: 'underline',
                  },
                }}
              />
            </View>

            {polls.length > 0 && (
              <View className="px-3 mt-3">
                {polls.map((poll, index) => (
                  <View
                    key={index}
                    style={{ borderRadius: 5 }}
                    className="mb-2 py-2 items-center flex-row bg-secondary dark:bg-dark-secondary w-full px-3"
                  >
                    {poll.picture && (
                      <View className="relative h-[50px] w-[50px] min-w-[50px] overflow-hidden mr-2">
                        <Image
                          source={{ uri: String(poll.picture) }}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 5,
                          }}
                        />
                      </View>
                    )}
                    <Text className="text-primary line-clamp-2 overflow-ellipsis text-lg dark:text-dark-primary mr-auto">
                      {poll.text}
                    </Text>
                    <Trash
                      size={16}
                      color={isDark ? '#EFEFEF' : '#3A3A3A'}
                      onPress={() => removePoll(poll, index)}
                    />
                  </View>
                ))}
              </View>
            )}
            {files.length > 0 && polls.length === 0 && (
              <View className="mt-3">
                <CreatePostMedia
                  sources={files}
                  removeFile={handleRemoveFile}
                />
              </View>
            )}
          </>
        )}
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View
            style={{
              paddingBottom: Platform.OS === 'ios' ? 0 : 0,
            }}
            className="bg-primary dark:bg-dark-primary w-full pt-5 rounded-t-xl  px-[10px]"
          >
            <TextInput
              style={{ height: 100 }}
              className={`rounded-[10px] py-3 text-lg px-3 w-full text-primary dark:text-dark-primary font-rRegular bg-secondary dark:bg-dark-secondary`}
              placeholder="Write your content"
              value={content}
              onChangeText={setContent}
              placeholderTextColor={isDark ? '#A0A0A0' : '#6E6E6E'}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoCapitalize="none"
              importantForAutofill="noExcludeDescendants"
            />

            {onPoll && (
              <View className="w-full mt-3 flex flex-row relative">
                <TouchableOpacity
                  onPress={pollFileUpload}
                  style={{ width: 50, height: 50 }}
                  className="relative dark:bg-dark-secondary overflow-hidden bg-secondary rounded-[5px] flex justify-center items-center cursor-pointer"
                >
                  <Upload color={'#DA3986'} />
                  {pollPicture && (
                    <Image
                      source={{ uri: String(pollPicture) }}
                      className="rounded-full"
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        borderRadius: 5,
                        left: 0,
                        top: 0,
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </TouchableOpacity>

                <TextInput
                  className={`h-[50px] text-lg px-5 ml-3 pr-12 flex-1 text-primary dark:text-dark-primary rounded-[5px] font-rRegular bg-secondary dark:bg-dark-secondary
                          `}
                  placeholder="Write poll option"
                  value={pollText}
                  placeholderTextColor={isDark ? '#A0A0A0' : '#6E6E6E'}
                  onChangeText={(e) => setPollText(e)}
                  autoCapitalize="none"
                  style={{ textAlignVertical: 'center' }}
                />
              </View>
            )}

            {isLoading ? (
              <View className="py-3 flex flex-row justify-center">
                <Spinner size={40} />
              </View>
            ) : (
              <View className="flex-row items-center justify-between py-3">
                {polls.length === 0 && (
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      className="p-3"
                      onPress={() => setIsColorPicker(!isColorPicker)}
                    >
                      <Text className="text-2xl">🎨</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="p-3"
                      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      onPress={handleFileUpload}
                    >
                      <ImageUp
                        size={25}
                        color={isDark ? '#BABABA' : '#6E6E6E'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setOnPoll(!onPoll)}
                      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      className="p-3"
                    >
                      <ListChecks
                        size={25}
                        color={isDark ? '#BABABA' : '#6E6E6E'}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {onPoll ? (
                  <>
                    {canAddPoll ? (
                      <TouchableOpacity
                        onPress={handleAddPoll}
                        className="bg-custom rounded-[5px] mb-1 mr-3 px-5 py-2 ml-4"
                      >
                        <Text className="text-white">Add Poll</Text>
                      </TouchableOpacity>
                    ) : (
                      canSendPoll && (
                        <TouchableOpacity
                          onPress={submitPost}
                          className="bg-custom rounded-[5px] mb-1 mr-3 px-5 py-2 ml-4"
                        >
                          <Text className="text-white">Post Poll</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={submitPost}
                    className="bg-custom rounded-[5px] px-5 mb-1 mr-3 py-2 ml-4"
                  >
                    <Text className="text-white">Post</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {isColorPicker && (
              <View className="flex flex-row absolute">
                {colors.map((color, i) => (
                  <TouchableOpacity
                    key={i}
                    className="rounded-full"
                    onPress={() => selectColor(color)}
                    style={{
                      top: -40,
                      left: 10,
                      backgroundColor: color,
                      marginRight: 10,
                      width: 30,
                      height: 30,
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  )
}

export default PostBox
