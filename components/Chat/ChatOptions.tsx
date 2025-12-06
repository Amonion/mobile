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
  handlePickContacts: () => void
}

const ChatOptions = ({
  isOptions,
  setOptions,
  pickImagesVideos,
  pickDocuments,
  pickAudio,
  handlePickContacts,
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
          className="flex-row px-3 w-full h-[600px] items-end text-primaryLight dark:text-dark-primaryLight"
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
                color={isDark ? '#848484' : '#A4A2A2'}
                style={{ marginBottom: 5 }}
              />
              <Text style={{ color: isDark ? '#848484' : '#A4A2A2' }}>
                Media
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickAudio} className="chatMediaBtn">
              <Feather
                name="music"
                size={25}
                color={isDark ? '#848484' : '#A4A2A2'}
                style={{ marginBottom: 5 }}
              />
              <Text style={{ color: isDark ? '#848484' : '#A4A2A2' }}>
                Sound
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickDocuments} className="chatMediaBtn">
              <Feather
                name="file"
                size={25}
                color={isDark ? '#848484' : '#A4A2A2'}
                style={{ marginBottom: 5 }}
              />
              <Text style={{ color: isDark ? '#848484' : '#A4A2A2' }}>
                Documents
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePickContacts}
              className="chatMediaBtn"
            >
              <Contact
                size={25}
                color={isDark ? '#848484' : '#A4A2A2'}
                style={{ marginBottom: 5 }}
              />
              <Text style={{ color: isDark ? '#848484' : '#A4A2A2' }}>
                Contact
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImagesVideos}
              className="chatMediaBtn"
            >
              <List
                size={25}
                color={isDark ? '#848484' : '#A4A2A2'}
                style={{ marginBottom: 5 }}
              />
              <Text style={{ color: isDark ? '#848484' : '#A4A2A2' }}>
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
