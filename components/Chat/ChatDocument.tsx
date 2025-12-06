import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { handlePendingFileUpload } from '@/lib/helpers'
import { MessageStore } from '@/store/notification/Message'
import { ChatStore, PreviewFile } from '@/store/chat/Chat'
import DocImage from './ChatFileImage'
import MediaCircularProgress from './MediaCircularProgress'
import { Directory, File, Paths } from 'expo-file-system'
import { Download } from 'lucide-react-native'

type ChatDocumentProps = {
  item: PreviewFile
  media: PreviewFile[]
  index: number
  chatId: number
  src: string
  isSender: boolean
}

const size = 35
const strokeWidth = 4
const radius = (size - strokeWidth) / 2

const ChatDocument: React.FC<ChatDocumentProps> = ({
  item,
  media,
  index,
  chatId,
  src,
  isSender,
}) => {
  const { baseURL } = MessageStore()
  const { updateChatWithFile } = ChatStore()
  const [progressPercent, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const extension = src.substring(src.lastIndexOf('.')).toLowerCase()

  useEffect(() => {
    if (item.status !== 'pending' || !item.uri || !isSender) return

    const upload = async () => {
      setIsUploading(true)

      try {
        const uploaded = await handlePendingFileUpload(
          {
            uri: String(item.uri),
            name: item.name || 'file',
            type: item.type === 'video' ? 'video/mp4' : 'image/jpeg',
            previewUrl: item.type === 'video' ? String(item.previewUrl) : '',
            size: item.size || 0,
            pages: item.pages || 0,
            duration: item.duration || 0,
          },
          baseURL,
          (percent: number) => setProgress(percent),
          item.pages ?? 0,
          item.duration ?? 0
        )
        const updatedMedia = media.map((mediaItem, i) =>
          i === index
            ? {
                ...mediaItem,
                status: 'uploaded' as const,
                source: uploaded.source,
                url: uploaded.source,
                previewUrl: mediaItem.previewUrl,
                poster: uploaded.poster ?? mediaItem.poster,
                uri: mediaItem.uri,
              }
            : mediaItem
        )

        updateChatWithFile('/chats', {
          timeNumber: chatId,
          media: updatedMedia,
        })
      } catch (err) {
        console.error('Upload failed:', err)

        const updatedMedia = media.map((mediaItem, i) =>
          i === index ? { ...mediaItem, status: 'failed' as const } : mediaItem
        )

        updateChatWithFile('/chats', {
          timeNumber: chatId,
          media: updatedMedia,
        })
      } finally {
        setIsUploading(false)
      }
    }

    upload()
  }, [item.status, item.uri, isSender, chatId])

  const downloadFile = async (remoteUrl: string) => {
    const filename = remoteUrl.split('/').pop() ?? `file_${Date.now()}`

    // Create /cache/downloads directory
    const downloadsDir = new Directory(Paths.cache, 'downloads')
    if (!downloadsDir.exists) {
      downloadsDir.create({ intermediates: true })
    }

    const dest = new File(downloadsDir, filename)

    // Delete if exists
    if (dest.exists) {
      await dest.delete()
    }

    // 🔥 Use Expo downloadAsync
    const result = await FileSystem.downloadAsync(remoteUrl, dest.uri)

    return result.uri // local file path
  }

  const openFile = async (uri: string) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri)
    } else {
      alert('Cannot open file on this device')
    }
  }

  const handleOpenDocument = async (file: PreviewFile) => {
    try {
      let localUri = file.uri

      // If the file is remote (uploaded) and not yet local → download it
      if (
        file.status === 'uploaded' &&
        file.url &&
        !file.uri.startsWith('file://')
      ) {
        localUri = await downloadFile(String(file.url))
      }

      await openFile(localUri)
    } catch (e) {
      console.error('Open file failed:', e)
    }
  }

  return (
    <View className="flex-row items-start mb-2 w-full">
      {isUploading ? (
        <MediaCircularProgress
          progressPercent={progressPercent}
          size={size}
          strokeWidth={strokeWidth}
          radius={radius}
        />
      ) : (
        <DocImage extension={extension} />
      )}
      <View className="flex-1">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 4,
            justifyContent: 'space-between',
          }}
        >
          {item.name && (
            <Text
              className="text-primary dark:text-dark-primary"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
          )}
        </View>

        <Text
          className="text-primaryLight dark:text-dark-primaryLight"
          style={{ fontSize: 12, textTransform: 'uppercase' }}
        >
          {String(item.url)
            .substring(String(item.url).lastIndexOf('.'))
            .slice(1)}
          {' · '}
          {(item.size / (1024 * 1024)).toFixed(2)} MB{' '}
          {item.pages &&
            item.pages > 0 &&
            `· ${item.pages} ${item.pages !== 1 ? 'Pages' : 'Page'}`}
        </Text>
      </View>
      <TouchableOpacity
        className="rounded-full items-center justify-center"
        onPress={() => handleOpenDocument(item)}
        style={{
          marginLeft: 'auto',
          minWidth: 32,
          width: 32,
          height: 32,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'white',
        }}
      >
        <Download size={16} color={'white'} />
      </TouchableOpacity>
    </View>
  )
}

export default ChatDocument
