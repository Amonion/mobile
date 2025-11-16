import { View, Text, Image, Modal, Pressable, StyleSheet } from 'react-native'

interface FullMediaProps {
  imageSource: string
  isFullScreen: boolean
  setIsFullScreen: (value: boolean) => void
}

const FullMedia: React.FC<FullMediaProps> = ({
  imageSource,
  isFullScreen,
  setIsFullScreen,
}) => {
  return (
    <Modal visible={isFullScreen} transparent={true}>
      <View style={styles.fullscreenContainer}>
        <Image
          source={{ uri: imageSource }}
          style={styles.fullscreenImage}
          resizeMode="contain"
        />
        <Pressable
          className="absolute py-[10px] px-5 rounded-md top-10 left-5 bg-custom"
          onPress={() => setIsFullScreen(false)}
        >
          <Text className="text-white">Back</Text>
        </Pressable>
      </View>
    </Modal>
  )
}
export default FullMedia

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
})
