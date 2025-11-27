import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  CameraCapturedPicture,
} from 'expo-camera'
import * as ImageManipulator from 'expo-image-manipulator'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-react-native'
import * as faceModel from '@tensorflow-models/face-landmarks-detection'
import { BioUserStore } from '@/store/user/BioUser'

type Props = { onPhotoTaken: (uri: string) => void }

export default function FaceCaptureBox({ onPhotoTaken }: Props) {
  const { bioUserForm } = BioUserStore()
  const [permission, requestPermission] = useCameraPermissions()
  const [cameraStarted, setCameraStarted] = useState(false)
  const [capturedUri, setCapturedUri] = useState<string | null>(null)
  const [facing, setFacing] = useState<CameraType>('front')

  const [tfReady, setTfReady] = useState(false)
  const [model, setModel] = useState<any>(null)

  const cameraRef = useRef<CameraView | null>(null)
  const screenWidth = Dimensions.get('window').width
  const cameraSize = screenWidth * 0.55

  // ---------------------------
  // LOAD TENSORFLOW + MODEL
  // ---------------------------
  useEffect(() => {
    async function loadTF() {
      await tf.ready()
      const loadedModel = await faceModel.load(
        faceModel.SupportedPackages.mediapipeFacemesh
      )
      setModel(loadedModel)
      setTfReady(true)
    }
    loadTF()
  }, [])

  // ---------------------------
  // START CAMERA
  // ---------------------------
  const handleStartCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission()
      if (!res.granted) return
    }

    setCapturedUri(null)
    setCameraStarted(true)
  }

  // ---------------------------
  // FLIP CAMERA
  // ---------------------------
  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === 'front' ? 'back' : 'front'))
  }

  // ---------------------------
  // TAKE PHOTO + FACE DETECTION
  // ---------------------------
  const takePicture = async () => {
    if (!cameraRef.current || !model) return

    try {
      const photo: CameraCapturedPicture =
        await cameraRef.current.takePictureAsync({ skipProcessing: true })

      let finalPhoto = photo

      // Flip front camera
      if (facing === 'front') {
        finalPhoto = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ flip: ImageManipulator.FlipType.Horizontal }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        )
      }

      // Load image as tensor
      const imgB64 = await fetch(finalPhoto.uri).then((r) => r.blob())
      const imageTensor = await tf.browser.fromPixelsAsync(imgB64)

      // Detect faces
      const predictions = await model.estimateFaces({
        input: imageTensor,
        returnTensors: false,
        flipHorizontal: facing === 'front',
      })

      if (!predictions || predictions.length === 0) {
        alert('No face detected. Please try again.')
        return
      }

      // Success
      setCapturedUri(finalPhoto.uri)
      setCameraStarted(false)
      onPhotoTaken(finalPhoto.uri)
    } catch (error) {
      console.warn('Error taking picture:', error)
    }
  }

  // ---------------------------
  // CLOSE CAPTURE
  // ---------------------------
  const closeCapture = () => {
    setCapturedUri(null)
    setCameraStarted(false)
  }

  // ---------------------------
  // UI RENDER
  // ---------------------------
  if (!tfReady) {
    return (
      <View className="items-center justify-center mt-10">
        <ActivityIndicator size={40} color="#DA3986" />
        <Text className="text-gray-500 mt-2">Loading Face Detection…</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 justify-center items-center mb-3">
      {/* Initial State */}
      {!cameraStarted && !capturedUri && !bioUserForm.passport ? (
        <>
          <View style={{ width: cameraSize, height: cameraSize }}>
            <Image
              source={require('@/assets/images/avatar.jpg')}
              style={{ width: '100%', height: '100%', borderRadius: 20 }}
            />
          </View>

          <TouchableOpacity
            onPress={handleStartCamera}
            activeOpacity={0.7}
            className={` customBtn`}
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
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: 20,
            }}
          >
            <CameraView
              ref={(ref) => (cameraRef.current = ref)}
              style={{ width: '100%', height: '100%' }}
              facing={facing}
            >
              <View style={styles.flipContainer}>
                <TouchableOpacity
                  onPress={toggleCameraFacing}
                  style={styles.flipButton}
                >
                  <Text className="text-white">Flip</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>

          <View className="flex-row w-full px-4">
            <TouchableOpacity
              onPress={() => setCameraStarted(false)}
              activeOpacity={0.7}
              className={` customBtn`}
            >
              <Text className={`text-xl text-white font-psemibold`}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={takePicture}
              activeOpacity={0.7}
              className={` customBtn`}
            >
              <Text className={`text-xl text-white font-psemibold`}>Snap</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : capturedUri ? (
        <View className="w-full items-center">
          <Image
            source={{ uri: capturedUri }}
            style={{
              width: cameraSize,
              height: cameraSize,
              borderRadius: 20,
              marginBottom: 20,
            }}
          />

          <View className="flex-row w-full px-4">
            <TouchableOpacity
              onPress={closeCapture}
              activeOpacity={0.7}
              className={` customBtn`}
            >
              <Text className={`text-xl text-white font-psemibold`}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStartCamera}
              activeOpacity={0.7}
              className={` customBtn`}
            >
              <Text className={`text-xl text-white font-psemibold`}>
                Retake
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Image
          source={{ uri: bioUserForm.passport }}
          style={{
            width: cameraSize,
            height: cameraSize,
            borderRadius: 20,
            marginBottom: 20,
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  flipContainer: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  flipButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
})
