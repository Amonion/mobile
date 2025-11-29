import {
  CameraView,
  CameraType,
  useCameraPermissions,
  CameraCapturedPicture,
} from 'expo-camera'
import { useRef, useState } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native'
import * as ImageManipulator from 'expo-image-manipulator'
import * as FaceDetector from 'expo-face-detector'
import {
  FaceDetectorMode,
  FaceDetectorLandmarks,
  FaceDetectorClassifications,
} from 'expo-face-detector'
import { BioUserStore } from '@/store/user/BioUser'

export default function FaceCaptureBox() {
  const [permission, requestPermission] = useCameraPermissions()
  const { bioUserForm, setForm } = BioUserStore()
  const cameraRef = useRef<CameraView | null>(null)
  const [facing, setFacing] = useState<CameraType>('front')
  const [cameraStarted, setCameraStarted] = useState(false)
  const [capturedUri, setCapturedUri] = useState<string | null>(null)

  const screenWidth = Dimensions.get('window').width
  const cameraSize = screenWidth * 0.5

  const handleStartCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission()
      if (!res.granted) return
    }
    setCapturedUri(null)
    setCameraStarted(true)
  }

  const closeCapture = () => {
    setCapturedUri(null)
    setCameraStarted(false)
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'))
  }

  const takePicture = async () => {
    if (!cameraRef.current) return

    try {
      const photo: CameraCapturedPicture =
        await cameraRef.current.takePictureAsync()

      let finalPhoto: any = photo
      if (facing === 'front') {
        const manipulated = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ flip: ImageManipulator.FlipType.Horizontal }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        )
        finalPhoto = manipulated
      }

      // Detect face in the final photo
      const faceDetection = await FaceDetector.detectFacesAsync(
        finalPhoto.uri,
        {
          mode: FaceDetectorMode.fast,
          detectLandmarks: FaceDetectorLandmarks.none,
          runClassifications: FaceDetectorClassifications.none,
        }
      )

      if (faceDetection.faces.length === 0) {
        alert('No face detected. Please try again.')
        return
      }

      // If face detected
      setCapturedUri(finalPhoto.uri)
      setCameraStarted(false)
      setForm('passport', finalPhoto.uri)

      // setCapturedUri(finalPhoto.uri)
      // setCameraStarted(false)
      // onPhotoTaken(finalPhoto.uri)
    } catch (error) {
      console.warn('Error taking picture:', error)
    }
  }

  return (
    <View className="flex-1 justify-center items-center mb-3">
      {!cameraStarted && !capturedUri && !bioUserForm.passport ? (
        <>
          <View
            style={{
              width: cameraSize,
              height: cameraSize,
              marginBottom: 10,
            }}
          >
            <Image
              source={require('@/assets/images/avatar.jpg')}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: screenWidth * 0.05,
              }}
            />
          </View>
          <Text className="f">{bioUserForm.passport}</Text>

          <TouchableOpacity
            onPress={handleStartCamera}
            activeOpacity={0.7}
            className={`customBtn`}
          >
            <Text className={`text-xl text-white font-psemibold`}>
              Start Capture
            </Text>
          </TouchableOpacity>
        </>
      ) : cameraStarted ? (
        <>
          <View
            style={{
              width: cameraSize,
              height: cameraSize,
              borderRadius: screenWidth * 0.05,
              overflow: 'hidden',
              marginBottom: 20,
            }}
          >
            <CameraView
              ref={(ref) => {
                cameraRef.current = ref
              }}
              style={{
                width: '100%',
                height: '100%',
              }}
              facing={facing}
            >
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: 10,
                    borderRadius: 10,
                  }}
                  onPress={toggleCameraFacing}
                >
                  <Text className="text-[18px] text-white">Flip Camera</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>

          <View className="flex-row w-full px-4">
            <TouchableOpacity
              onPress={() => setCameraStarted(false)}
              activeOpacity={0.7}
              className={`customBtn`}
            >
              <Text className={`text-xl text-white font-psemibold`}>
                Stop Capture
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={takePicture}
              activeOpacity={0.7}
              className={`customBtn`}
            >
              <Text className={`text-xl text-white font-psemibold`}>
                Take Photo
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : capturedUri ? (
        <View className="w-full items-center">
          <Image
            source={{ uri: String(capturedUri) }}
            style={{
              width: cameraSize,
              height: cameraSize,
              borderRadius: screenWidth * 0.05,
              marginBottom: 20,
            }}
          />
          <View className="flex-row flex-1">
            <TouchableOpacity
              onPress={closeCapture}
              activeOpacity={0.7}
              className={`customBtn`}
            >
              <Text className={`text-xl text-white font-psemibold`}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStartCamera}
              activeOpacity={0.7}
              className={`customBtn`}
            >
              <Text className={`text-xl text-white font-psemibold`}>
                Retake
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="w-full items-center">
          <Image
            source={{ uri: String(bioUserForm.passport) }}
            style={{
              width: cameraSize,
              height: cameraSize,
              borderRadius: screenWidth * 0.05,
              marginBottom: 20,
            }}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
  },
})
