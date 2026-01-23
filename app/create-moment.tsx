import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as VideoThumbnails from 'expo-video-thumbnails'
import axios from 'axios'
import SocketService from '@/store/socket'
import { useRouter } from 'expo-router'
import { getFileType } from '@/lib/helpers'
import * as FileSystem from 'expo-file-system/legacy'
import { Picker } from 'emoji-mart-native'
import ColorPicker from 'react-native-wheel-color-picker'
import { Buffer } from 'buffer'
import { ArrowLeft, Bell, Trash } from 'lucide-react-native'
import { Audio, AVPlaybackStatusSuccess } from 'expo-av'
import { Moment, MomentMediaEmpty, MomentStore } from '@/store/post/Moment'
import { AuthStore } from '@/store/AuthStore'
import { MessageStore } from '@/store/notification/Message'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
interface MomentResponse {
  data: Moment
  message: string
}

export default function CreateMoment() {
  const socket = SocketService.getSocket()
  const { user } = AuthStore()
  const {
    isEditing,
    editingIndex,
    momentMedia,
    moments,
    setIsEditing,
    setShowMoment,
  } = MomentStore()
  const [momentMedias, setMomentMedias] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isColorPicker, setIsColorPicker] = useState(false)
  const [canAdd, setCanAdd] = useState(false)
  const [canPost, setCanPost] = useState(false)
  const [editingMoment, setEditingMoment] = useState(false)
  const [editingMomentId, setEditingMomentId] = useState('')
  const colors = ['#da3986', '#1877F2', '#00BFA6', '#FF6F00', '#F44336']
  const { setMessage, baseURL } = MessageStore()
  const router = useRouter()
  const [textColor, setTextColor] = useState('')
  const [percents, setPercents] = useState(0)
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const moment = MomentStore.getState().moments.find(
      (item) => item.username === user?.username
    )
    if (moment) {
      setMomentMedias(moment.media)
      setEditingMoment(true)
      setEditingMomentId(moment._id)
    }
  }, [moments.length])

  useEffect(() => {
    if (textColor) {
      MomentStore.setState((prev) => {
        return {
          momentMedia: { ...prev.momentMedia, textColor: textColor },
        }
      })
    }
  }, [textColor])

  useEffect(() => {
    if (momentMedia.content || momentMedia.src || momentMedia.preview) {
      setCanAdd(true)
      setCanPost(false)
    } else if (
      momentMedias.length > 0 &&
      !momentMedia.content &&
      !momentMedia.src &&
      !momentMedia.preview
    ) {
      setCanAdd(false)
      setCanPost(true)
    }
  }, [momentMedia, momentMedias])

  useEffect(() => {
    if (!socket) return

    socket.on(`moment_${user?.username}`, (data: MomentResponse) => {
      setLoading(false)
      MomentStore.setState((prev) => ({
        moments: [data.data, ...prev.moments],
      }))
      router.push('/home')
      setMessage(data.message, true)
      setShowMoment(false)
      setEditingMoment(false)
    })

    socket.on(
      `update_moment_${user?.username}`,
      async (data: MomentResponse) => {
        setLoading(false)
        // await updateMomentInLocalStorage(data.data)
        MomentStore.setState((prev) => {
          return {
            isPlaying: true,
            moments: prev.moments.map((item) =>
              item.username === data.data.username ? data.data : item
            ),
          }
        })
        router.push('/home')
        setMessage(data.message, true)
        setShowMoment(false)
        setEditingMoment(false)
      }
    )

    return () => {
      setLoading(false)
      socket.off(`moment_${user?.username}`)
      socket.off(`update_moment_${user?.username}`)
      clearMoment()
    }
  }, [socket])

  const clearMoment = () => {
    for (let i = 0; i < momentMedias.length; i++) {
      const el = momentMedias[i]
      if (el.src) {
        // handleRemoveFile(i, el.src)
      }
    }
    setShowMoment(false)
    MomentStore.setState({
      momentMedia: MomentMediaEmpty,
    })
  }

  const addEmoji = (emoji: any) => {
    MomentStore.setState((prev) => ({
      momentMedia: {
        ...prev.momentMedia,
        content: prev.momentMedia.content + emoji.emoji,
      },
    }))
  }

  const editMoment = (index: number) => {
    const m = momentMedias[index]
    MomentStore.setState((prev) => {
      return {
        isEditing: true,
        editingIndex: index,
        momentMedia: {
          ...prev.momentMedia,
          src: m.src,
          preview: m.preview,
          type: m.type,
          content: m.content.trim(),
          backgroundColor: m.backgroundColor,
          textColor: m.textColor,
          createdAt: new Date(),
        },
      }
    })
  }

  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      })
      if (result.canceled) return
      const asset = result.assets[0]
      const type = getFileType(asset)
      await uploadFile(asset, type)
    } catch (err) {
      Alert.alert('Error', 'Failed to pick media.')
      console.error(err)
    }
  }

  // const uploadFile = async (
  //   asset: ImagePicker.ImagePickerAsset,
  //   type: string
  // ) => {
  //   try {
  //     setLoading(true)

  //     let localThumbUrl = ''
  //     let videoDuration = 0

  //     if (type.includes('video')) {
  //       try {
  //         // ✅ Generate thumbnail
  //         const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(
  //           asset.uri,
  //           { time: 1000 }
  //         )
  //         localThumbUrl = thumbUri

  //         // ✅ Get video duration using Audio API
  //         const { sound, status } = await Audio.Sound.createAsync(
  //           { uri: asset.uri },
  //           { shouldPlay: false }
  //         )

  //         const playbackStatus = status as AVPlaybackStatusSuccess
  //         if (playbackStatus.isLoaded && playbackStatus.durationMillis) {
  //           videoDuration = playbackStatus.durationMillis / 1000 // seconds
  //         }

  //         await sound.unloadAsync()
  //       } catch (error) {
  //         console.warn('🎥 Failed to generate video metadata:', error)
  //       }
  //     }

  //     MomentStore.setState((prev) => ({
  //       momentMedia: {
  //         ...prev.momentMedia,
  //         type,
  //         src: '',
  //         preview: type.includes('video') ? localThumbUrl : asset.uri,
  //         isViewed: false,
  //         ...(type.includes('video') && { duration: videoDuration }),
  //       },
  //     }))

  //     const fileName =
  //       asset.fileName ?? asset.uri.split('/').pop() ?? `upload-${Date.now()}`
  //     const mimeType =
  //       asset.mimeType ?? (type.includes('video') ? 'video/mp4' : 'image/jpeg')

  //     const { data: filePresign } = await axios.post(
  //       `https://server1.kencoins.com/api/v1/s3-presigned-url`,
  //       {
  //         fileName,
  //         fileType: mimeType,
  //       }
  //     )

  //     const { uploadUrl: fileUploadUrl } = filePresign

  //     const fileUri = type.includes('video') ? localThumbUrl : asset.uri

  //     const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
  //       encoding: 'base64',
  //     })

  //     const fileBuffer = Buffer.from(fileBase64, 'base64')
  //     await axios.put(fileUploadUrl, fileBuffer, {
  //       headers: { 'Content-Type': mimeType },
  //       onUploadProgress: (progressEvent) => {
  //         if (progressEvent.total) {
  //           const percent = Math.round(
  //             (progressEvent.loaded / progressEvent.total) * 100 * 0.5
  //           )
  //           setPercents(percent)
  //         }
  //       },
  //     })

  //     const publicFileUrl = fileUploadUrl.split('?')[0]
  //     let publicThumbUrl = localThumbUrl

  //     if (type.includes('video') && localThumbUrl) {
  //       const thumbFileName = fileName.replace(/\.[^/.]+$/, '') + '-thumb.jpg'

  //       const { data: thumbPresign } = await axios.post(
  //         `https://server1.kencoins.com/api/v1/s3-presigned-url`,
  //         {
  //           fileName: thumbFileName,
  //           fileType: 'image/jpeg',
  //         }
  //       )
  //       const { uploadUrl: thumbUploadUrl } = thumbPresign

  //       const thumbBase64 = await FileSystem.readAsStringAsync(localThumbUrl, {
  //         encoding: 'base64',
  //       })

  //       const thumbBuffer = Buffer.from(thumbBase64, 'base64')

  //       await axios.put(thumbUploadUrl, thumbBuffer, {
  //         headers: { 'Content-Type': 'image/jpeg' },
  //       })

  //       publicThumbUrl = thumbUploadUrl.split('?')[0]
  //     }

  //     MomentStore.setState((prev) => ({
  //       momentMedia: {
  //         ...prev.momentMedia,
  //         src: publicFileUrl,

  //         // Keep old preview unless it's an image upload
  //         preview: type.includes('image')
  //           ? publicFileUrl
  //           : prev.momentMedia.preview,

  //         ...(type.includes('video') && { duration: videoDuration }),
  //       },
  //     }))

  //     setPercents(0)
  //     return publicFileUrl
  //   } catch (error) {
  //     console.error('❌ Upload failed:', error)
  //     Alert.alert('Upload failed', 'Something went wrong while uploading.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const uploadFile = async (
    asset: ImagePicker.ImagePickerAsset,
    type: string
  ) => {
    try {
      setLoading(true)

      let localThumbUrl = ''
      let videoDuration = 0

      if (type.includes('video')) {
        try {
          // Generate thumbnail
          const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(
            asset.uri,
            { time: 1000 }
          )
          localThumbUrl = thumbUri

          // Get video duration
          const { sound, status } = await Audio.Sound.createAsync(
            { uri: asset.uri },
            { shouldPlay: false }
          )

          const playbackStatus = status as AVPlaybackStatusSuccess
          if (playbackStatus.isLoaded && playbackStatus.durationMillis) {
            videoDuration = playbackStatus.durationMillis / 1000
          }

          await sound.unloadAsync()
        } catch (err) {
          console.warn('🎥 Failed to get video metadata:', err)
        }
      }
      MomentStore.setState((prev) => ({
        momentMedia: {
          ...prev.momentMedia,
          type,
          src: '',
          preview: type.includes('video') ? localThumbUrl : asset.uri,
          isViewed: false,
          ...(type.includes('video') && { duration: videoDuration }),
        },
      }))

      const fileName =
        asset.fileName ?? asset.uri.split('/').pop() ?? `upload-${Date.now()}`

      const mimeType =
        asset.mimeType ?? (type.includes('video') ? 'video/mp4' : 'image/jpeg')
      const { data: filePresign } = await axios.post(
        `https://server1.kencoins.com/api/v1/s3-presigned-url`,
        {
          fileName,
          fileType: mimeType,
        }
      )

      const { uploadUrl: fileUploadUrl } = filePresign

      const fileUri = asset.uri

      const uploadResult = await FileSystem.uploadAsync(
        fileUploadUrl,
        fileUri,
        {
          httpMethod: 'PUT',
          headers: { 'Content-Type': mimeType },
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        }
      )

      if (uploadResult.status !== 200) {
        throw new Error('Failed to upload main file to S3')
      }

      const publicFileUrl = fileUploadUrl.split('?')[0]

      let publicThumbUrl = localThumbUrl

      if (type.includes('video') && localThumbUrl) {
        const thumbFileName = fileName.replace(/\.[^/.]+$/, '') + '-thumb.jpg'

        const { data: thumbPresign } = await axios.post(
          `https://server1.kencoins.com/api/v1/s3-presigned-url`,
          {
            fileName: thumbFileName,
            fileType: 'image/jpeg',
          }
        )

        const { uploadUrl: thumbUploadUrl } = thumbPresign

        const thumbUploadResult = await FileSystem.uploadAsync(
          thumbUploadUrl,
          localThumbUrl,
          {
            httpMethod: 'PUT',
            headers: {
              'Content-Type': 'image/jpeg',
            },
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          }
        )

        if (thumbUploadResult.status === 200) {
          publicThumbUrl = thumbUploadUrl.split('?')[0]
        }
      }

      console.log('The duration is: ', videoDuration)

      MomentStore.setState((prev) => ({
        momentMedia: {
          ...prev.momentMedia,
          src: publicFileUrl,

          preview: type.includes('image')
            ? publicFileUrl
            : prev.momentMedia.preview,

          ...(type.includes('video') && { duration: videoDuration }),
        },
      }))

      setPercents(0)
      return publicFileUrl
    } catch (error) {
      console.error('❌ Upload failed:', error)
      Alert.alert('Upload failed', 'Something went wrong while uploading.')
    } finally {
      setLoading(false)
    }
  }

  const uploadMoment = async () => {
    if (!socket || !user) return
    setLoading(true)

    try {
      const formData = {
        to: editingMoment ? 'updateMoment' : 'moment',
        id: editingMomentId,
        displayName: user.displayName,
        username: user.username,
        picture: user.picture,
        media: momentMedias,
      }

      socket.emit('message', formData)
      setLoading(false)
      setShowMoment(false)
      setMessage('Moment posted successfully!', true)
    } catch (err) {
      console.error('Upload failed', err)
      setLoading(false)
    }
  }

  const getMediaDuration = (): number => {
    if (momentMedia.type.includes('video')) {
      const videoLength = momentMedia.duration ?? 5
      return Math.max(videoLength, 5)
    }

    const textLength = momentMedia.content?.length || 0

    if (textLength <= 0) return 5
    if (textLength <= 100) return 6
    if (textLength <= 200) return 8
    return 12
  }

  const addMoment = () => {
    if (!canAdd) {
      setMessage(
        'Please write or upload content of your moment to share',
        false
      )
      return
    }

    if (isEditing) {
      const duration = getMediaDuration()
      setMomentMedias((prev) => {
        return prev.map((item, index) =>
          editingIndex === index
            ? { ...momentMedia, duration, createdAt: new Date() }
            : item
        )
      })
      setIsEditing(false, '', 0)
    } else {
      const duration = getMediaDuration()
      setMomentMedias((prev) => {
        return [...prev, { ...momentMedia, duration, createdAt: new Date() }]
      })
    }

    MomentStore.setState((prev) => {
      return {
        momentMedia: {
          ...prev.momentMedia,
          src: '',
          type: '',
          content: '',
          preview: '',
          createdAt: null,
        },
      }
    })
  }

  const removeMoment = (index: number) => {
    setMomentMedias((prev) => {
      return prev.filter((_, int) => int !== index)
    })
  }

  const selectColor = (color: string) => {
    MomentStore.setState((prev) => ({
      momentMedia: { ...prev.momentMedia, backgroundColor: color },
    }))
    setIsColorPicker(false)
  }

  return (
    <View
      className="bg-secondary dark:bg-dark-secondary"
      style={styles.container}
    >
      <ScrollView>
        <View
          className="flex justify-center items-center"
          style={{
            backgroundColor: momentMedia.backgroundColor,
            height: 300,
            width: '100%',
            position: 'relative',
          }}
        >
          {momentMedia.preview && (
            <Image
              source={{ uri: momentMedia.preview }}
              className="w-full h-full z-0 absolute left-0 right-0"
            />
          )}

          <View
            style={{ marginTop: insets.top + 10 }}
            className="flex px-3 flex-row z-20 top-0 w-full justify-between absolute"
          >
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              onPress={() => router.back()}
              className="rounded-[50px] p-3 flex justify-center items-center bg-black/50"
            >
              <ArrowLeft color={'#fff'} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              onPress={() => router.back()}
              className="rounded-[50px] p-3 flex justify-center items-center bg-black/50"
            >
              <Bell color={'#fff'} size={20} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 h-full w-full items-center justify-center">
            <TextInput
              className="text-[18px] p-3 z-20"
              placeholder="Write a moment..."
              placeholderTextColor="#ccc"
              style={{
                color: momentMedia.textColor,
                textAlignVertical: 'top',
              }}
              multiline
              value={momentMedia.content}
              autoFocus
              onChangeText={(text) =>
                MomentStore.setState((prev) => ({
                  momentMedia: { ...prev.momentMedia, content: text },
                }))
              }
            />
          </View>

          {percents > 0 && (
            <View className="absolute px-3 bottom-3 w-full left-0">
              <View className="w-full overflow-hidden h-[5px] rounded-[10px] bg-white">
                <View
                  style={{ width: `${percents}%` }}
                  className="bg-success h-[5px] rounded-[10px]"
                />
              </View>
            </View>
          )}
        </View>

        {showTextColorPicker && (
          <ColorPicker
            color={textColor}
            onColorChangeComplete={setTextColor}
            thumbSize={30}
            sliderSize={30}
            noSnap
            row={false}
          />
        )}

        {showEmojiPicker && (
          <View style={{ height: 300 }}>
            <Picker
              onSelect={addEmoji}
              theme="dark"
              columns={8}
              showPreview={false}
              showSkinTones={false}
            />
          </View>
        )}

        {isColorPicker && (
          <View style={styles.colorRow}>
            {colors.map((color, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => selectColor(color)}
                style={[styles.colorCircle, { backgroundColor: color }]}
              />
            ))}
          </View>
        )}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ color: '#888' }}>Processing...</Text>
          </View>
        ) : (
          <View style={styles.toolbar}>
            <TouchableOpacity onPress={pickMedia}>
              <Text style={styles.icon}>📁</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Text style={styles.icon}>😊</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsColorPicker(!isColorPicker)}>
              <Text style={styles.icon}>🎨</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowTextColorPicker(!showTextColorPicker)}
            >
              <Text style={styles.icon}>🖋️</Text>
            </TouchableOpacity>

            {canAdd && (
              <TouchableOpacity
                className="bg-primary dark:bg-dark-primary border border-border dark:border-dark-border"
                style={styles.addBtn}
                onPress={addMoment}
              >
                <Text className="text-primary dark:text-dark-primary">Add</Text>
              </TouchableOpacity>
            )}
            {canPost && (
              <TouchableOpacity
                className="bg-custom"
                style={styles.postBtn}
                onPress={uploadMoment}
              >
                <Text style={{ color: 'white' }}>Post</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* <View className="flex-1">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
          >
            {momentMedias.map((item, idx) => (
              <View
                key={idx}
                className="w-[120px] rounded-[10px] overflow-hidden h-[150px]"
                style={[{ backgroundColor: item.backgroundColor || '#444' }]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => editMoment(idx)}
                  className="w-[120px] rounded-[10px] overflow-hidden h-full flex flex-row justify-center items-center relative"
                  style={[{ backgroundColor: item.backgroundColor || '#444' }]}
                >
                  {item.preview && (
                    <Image
                      source={{ uri: item.preview }}
                      className="w-full h-full absolute z-10 left-0 top-0"
                      resizeMode="cover"
                    />
                  )}

                  <Text
                    className={` text-white flex-1 z-20 text-center line-clamp-3 overflow-ellipsis`}
                  >
                    {item.content}
                  </Text>

                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation()
                      removeMoment(idx)
                    }}
                    className="absolute z-20 bottom-3 right-3 p-1"
                  >
                    <Trash color="#fff" size={20} />
                  </Pressable>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View> */}

        <View className="flex-1 py-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
          >
            {momentMedias.map((item, idx) => (
              <View
                key={idx}
                style={{
                  width: 120,
                  height: 150,
                  borderRadius: 10,
                  overflow: 'hidden',
                  backgroundColor: item.backgroundColor || '#444',
                  marginRight: 12,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => editMoment(idx)}
                  style={{
                    width: 120,
                    height: '100%',
                    borderRadius: 10,
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: item.backgroundColor || '#444',
                  }}
                >
                  {item.preview && (
                    <Image
                      source={{ uri: item.preview }}
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 10,
                      }}
                      resizeMode="cover"
                    />
                  )}

                  <Text
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    style={{
                      color: '#fff',
                      textAlign: 'center',
                      zIndex: 20,
                      paddingHorizontal: 4,
                    }}
                  >
                    {item.content}
                  </Text>

                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation()
                      removeMoment(idx)
                    }}
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      zIndex: 20,
                      padding: 4,
                    }}
                  >
                    <Trash color="#fff" size={20} />
                  </Pressable>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  preview: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: { width: '100%', height: '100%' },
  textInput: {
    width: '100%',
    textAlign: 'center',
    zIndex: 20,
    fontSize: 18,
    padding: 10,
  },
  toolbar: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  icon: { fontSize: 24, color: 'white' },
  addBtn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  postBtn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  loading: {
    marginVertical: 20,
    alignItems: 'center',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 15,
  },
})
