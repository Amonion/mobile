import React from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native'
import { Play } from 'lucide-react-native'
import { Video, ResizeMode } from 'expo-av'
import { Post, PostStore } from '@/store/post/Post'
import CommentStore from '@/store/post/Comment'
import { router } from 'expo-router'

interface MediaSource {
  source: string
  type: string
}

interface GiveawayPostMediaProps {
  sources: MediaSource[]
}

const { width } = Dimensions.get('window')

const GiveawayPostMedia: React.FC<GiveawayPostMediaProps> = ({ sources }) => {
  const { mediaResults, setSelectedMedia, setCurrentIndex, setFitMode } =
    PostStore()
  const { page_size, currentPage, getComments } = CommentStore()

  const setMainPost = (index: number) => {
    let comment: Post | undefined
    PostStore.setState((prev) => {
      comment = prev.postResults.find(
        (item) => item._id === mediaResults[index].postId
      )
      return {
        postForm: prev.postResults.find(
          (item) => item._id === mediaResults[index].postId
        ),
      }
    })
    CommentStore.setState({ mainPost: comment })
    if (mediaResults[index].postId) {
      getComments(
        `/posts/comments?page=${currentPage}&page_size=${20}&postId=${
          mediaResults[index].postId
        }&level=1`
      )
    }
    router.push(`/full-post`)
  }

  const setMedia = (src: string) => {
    const mediaIndex = PostStore.getState().mediaResults.findIndex(
      (item) => item.src === src
    )
    setMainPost(mediaIndex)
    setCurrentIndex(mediaIndex)
    setFitMode(false)
    setSelectedMedia(mediaResults[mediaIndex])
  }

  const renderMedia = (media: MediaSource) => {
    if (media.type.includes('video')) {
      return (
        <View style={styles.videoContainer}>
          <Play size={40} color="white" style={styles.playIcon} />
          <Video
            source={{ uri: media.source }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            isMuted
            isLooping
            shouldPlay
          />
        </View>
      )
    } else if (sources.length === 1) {
      return (
        <Image
          source={{ uri: media.source }}
          style={styles.singleImage}
          resizeMode="cover"
        />
      )
    } else {
      return (
        <Image
          source={{ uri: media.source }}
          style={styles.multiImage}
          resizeMode="cover"
        />
      )
    }
  }

  const renderLayout = () => {
    if (sources.length === 1) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMedia(sources[0].source)}
        >
          {renderMedia(sources[0])}
        </TouchableOpacity>
      )
    }

    if (sources.length === 2) {
      return (
        <View style={styles.row}>
          {sources.map((media, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setMedia(media.source)}
              style={styles.half}
            >
              {renderMedia(media)}
            </TouchableOpacity>
          ))}
        </View>
      )
    }

    if (sources.length === 3) {
      return (
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => setMedia(sources[0].source)}
            style={[styles.half, { marginRight: 4 }]}
          >
            {renderMedia(sources[0])}
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            {sources.slice(1).map((media, index) => (
              <TouchableOpacity
                key={index + 1}
                onPress={() => setMedia(media.source)}
                style={{ flex: 1, marginBottom: index === 0 ? 4 : 0 }}
              >
                {renderMedia(media)}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )
    }

    return (
      <View style={styles.grid}>
        {sources.slice(0, 4).map((media, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setMedia(media.source)}
            style={styles.gridItem}
          >
            {renderMedia(media)}
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  return (
    <View
      className="bg-secondary mt-3 dark:bg-dark-secondary"
      style={styles.container}
    >
      {renderLayout()}
    </View>
  )
}

export default GiveawayPostMedia

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
