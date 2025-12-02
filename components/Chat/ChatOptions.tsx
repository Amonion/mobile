import { View, Text, TouchableOpacity, useColorScheme } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { Contact, List } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ChatOptionsProps = {
  isOptions: boolean
  setOptions: (status: boolean) => void
  pickImagesVideos: () => void
  pickDocuments: () => void
  pickAudio: () => void
}

const ChatOptions = ({
  isOptions,
  setOptions,
  pickImagesVideos,
  pickDocuments,
  pickAudio,
}: ChatOptionsProps) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()

  return (
    <>
      {isOptions && (
        <TouchableOpacity
          onPress={() => setOptions(false)}
          activeOpacity={1}
          className="flex-row px-3 w-full h-[600px] items-end"
          style={{
            position: 'absolute',
            left: 0,
            bottom: insets.bottom + 50,
          }}
        >
          <View
            className="flex-row flex-wrap w-full"
            style={{
              backgroundColor: isDark ? '#1C1E21' : '#FFFFFF',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#333',
              overflow: 'hidden',
            }}
          >
            <TouchableOpacity
              className="chatMediaBtn"
              onPress={pickImagesVideos}
            >
              <Feather
                name="image"
                size={25}
                color={isDark ? '#EFEFEF' : '#3A3A3A'}
                style={{ marginBottom: 5 }}
              />
              <Text style={{ color: isDark ? '#EFEFEF' : '#3A3A3A' }}>
                Media
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickAudio} className="chatMediaBtn">
              <Feather
                name="music"
                size={25}
                color={isDark ? '#EFEFEF' : '#3A3A3A'}
                style={{ marginBottom: 5 }}
              />
              <Text style={{ color: isDark ? '#EFEFEF' : '#3A3A3A' }}>
                Sound
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickDocuments} className="chatMediaBtn">
              <Feather
                name="file"
                size={25}
                color={isDark ? '#EFEFEF' : '#3A3A3A'}
                style={{ marginBottom: 5 }}
              />
              <Text style={{ color: isDark ? '#EFEFEF' : '#3A3A3A' }}>
                Documents
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImagesVideos}
              className="chatMediaBtn"
            >
              <Contact
                size={25}
                color={isDark ? '#EFEFEF' : '#3A3A3A'}
                style={{ marginBottom: 5 }}
              />
              <Text style={{ color: isDark ? '#EFEFEF' : '#3A3A3A' }}>
                Contact
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImagesVideos}
              className="chatMediaBtn"
            >
              <List
                size={25}
                color={isDark ? '#EFEFEF' : '#3A3A3A'}
                style={{ marginBottom: 5 }}
              />
              <Text style={{ color: isDark ? '#EFEFEF' : '#3A3A3A' }}>
                Poll
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </>
  )
}

export default ChatOptions
