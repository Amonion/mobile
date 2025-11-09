import { Trash } from 'lucide-react-native'
import React from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Pressable,
} from 'react-native'

interface MediaSource {
  source: string
  type: string
  preview: string
}

interface CreatePostMediaProps {
  sources: MediaSource[]
  removeFile(index: number, source: string): Promise<void>
}

const { width } = Dimensions.get('window')

const CreatePostMedia: React.FC<CreatePostMediaProps> = ({
  sources,
  removeFile,
}) => {
  const renderMedia = (media: MediaSource, index: number) => {
    if (sources.length === 1) {
      return (
        <View className="relative">
          {media.source && (
            <Pressable
              onPress={() => removeFile(index, media.source)}
              className="absolute z-20 bottom-3 right-3 p-1"
            >
              <Trash color="#fff" size={20} />
            </Pressable>
          )}
          <Image
            source={{
              uri: media.type.includes('video') ? media.preview : media.source,
            }}
            style={styles.singleImage}
            resizeMode="cover"
          />
        </View>
      )
    } else {
      return (
        <View className="relative">
          {media.source && (
            <Pressable
              onPress={() => removeFile(index, media.source)}
              className="absolute z-20 bottom-3 right-3 p-1"
            >
              <Trash color="#fff" size={20} />
            </Pressable>
          )}
          <Image
            source={{
              uri: media.type.includes('video') ? media.preview : media.source,
            }}
            style={styles.multiImage}
            resizeMode="cover"
          />
        </View>
      )
    }
  }

  const renderLayout = () => {
    if (sources.length === 1) {
      return (
        <TouchableOpacity activeOpacity={0.8}>
          {renderMedia(sources[0], 0)}
        </TouchableOpacity>
      )
    }

    if (sources.length === 2) {
      return (
        <View style={styles.row}>
          {sources.map((media, index) => (
            <TouchableOpacity key={index} style={styles.half}>
              {renderMedia(media, index)}
            </TouchableOpacity>
          ))}
        </View>
      )
    }

    if (sources.length === 3) {
      return (
        <View style={styles.row}>
          <TouchableOpacity style={[styles.half, { marginRight: 4 }]}>
            {renderMedia(sources[0], 0)}
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            {sources.slice(1).map((media, index) => (
              <TouchableOpacity
                key={index + 1}
                style={{ flex: 1, marginBottom: index === 0 ? 4 : 0 }}
              >
                {renderMedia(media, index)}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )
    }

    return (
      <View style={styles.grid}>
        {sources.slice(0, 4).map((media, index) => (
          <TouchableOpacity key={index} style={styles.gridItem}>
            {renderMedia(media, index)}
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  return (
    <View
      className="bg-secondary dark:bg-dark-secondary"
      style={styles.container}
    >
      {renderLayout()}
    </View>
  )
}

export default CreatePostMedia

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    overflow: 'hidden',
  },
  videoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    height: 300,
  },
  playIcon: {
    position: 'absolute',
    zIndex: 2,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  singleImage: {
    width: '100%',
    height: 350,
  },
  multiImage: {
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  half: {
    flex: 1,
    height: 250,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridItem: {
    width: (width - 16) / 2 - 2,
    height: 150,
  },
})
