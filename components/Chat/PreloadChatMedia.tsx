'use client'
import React from 'react'
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { PreviewFile } from '@/store/chat/Chat'
import Feather from '@expo/vector-icons/Feather'

type PreloadChatMediaProps = {
  files: PreviewFile[]
  removeFile: (index: number) => void
}

const PreloadChatMedia: React.FC<PreloadChatMediaProps> = ({
  files,
  removeFile,
}) => {
  return (
    <View
      className="bg-primary border border-border dark:border-dark-border  dark:bg-dark-primary"
      style={[styles.container, { width: files.length === 1 ? 300 : 400 }]}
    >
      {files.length === 1 ? (
        <View className="relative w-full h-auto">
          <Image
            source={{ uri: files[0].previewUrl }}
            style={{ width: '100%', height: 300 }}
            resizeMode="cover"
          />
          <TouchableOpacity
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            className="bg-custom"
            style={styles.removeBtn}
            onPress={() => removeFile(0)}
          >
            <Feather name="x" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : files.length === 2 ? (
        <View className="w-full flex-row">
          {files.map((item, index) => (
            <View
              key={index}
              className="relative overflow-hidden w-1/2 h-[250px] px-1 rounded-[10px]"
            >
              <Image
                source={{ uri: item.previewUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />

              <View style={styles.typeIcon}>
                {item.type === 'image' ? (
                  <Feather name="image" size={12} color="#fff" />
                ) : item.type === 'video' ? (
                  <Feather name="video" size={12} color="#fff" />
                ) : (
                  <Feather name="file" size={12} color="#fff" />
                )}
              </View>

              <TouchableOpacity
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                className="bg-custom"
                style={styles.removeBtn}
                onPress={() => removeFile(index)}
              >
                <Feather name="x" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : files.length === 3 ? (
        <View className="w-full flex-row h-[300px]">
          <View className="relative w-1/2 h-full pr-1">
            <Image
              source={{ uri: files[0].previewUrl }}
              style={{ width: '100%', height: 300 }}
              resizeMode="cover"
            />
            <TouchableOpacity
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              className="bg-custom"
              style={styles.removeBtn}
              onPress={() => removeFile(0)}
            >
              <Feather name="x" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <View className="w-1/2 h-full pl-1 justify-between">
            {files.slice(1).map((item, index) => (
              <View
                key={index}
                className="relative overflow-hidden w-full h-[142px] px-1 rounded-[10px]"
              >
                <Image
                  source={{ uri: item.previewUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                <View style={styles.typeIcon}>
                  {item.type === 'image' ? (
                    <Feather name="image" size={12} color="#fff" />
                  ) : item.type === 'video' ? (
                    <Feather name="video" size={12} color="#fff" />
                  ) : (
                    <Feather name="file" size={12} color="#fff" />
                  )}
                </View>

                <TouchableOpacity
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  className="bg-custom"
                  style={styles.removeBtn}
                  onPress={() => removeFile(index + 1)}
                >
                  <Feather name="x" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className="w-full h-[300px]">
          <View className="w-1/2 h-1/2 pb-1 flex-row justify-between">
            {files.slice(0, 2).map((item, index) => (
              <View
                key={index}
                className="relative overflow-hidden w-full h-[142px] px-1 rounded-[10px]"
              >
                <Image
                  source={{ uri: item.previewUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                <View style={styles.typeIcon}>
                  {item.type === 'image' ? (
                    <Feather name="image" size={12} color="#fff" />
                  ) : item.type === 'video' ? (
                    <Feather name="video" size={12} color="#fff" />
                  ) : (
                    <Feather name="file" size={12} color="#fff" />
                  )}
                </View>

                <TouchableOpacity
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  className="bg-custom"
                  style={styles.removeBtn}
                  onPress={() => removeFile(index)}
                >
                  <Feather name="x" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View className="w-1/2 h-1/2 pl-1 flex-row justify-between">
            {files.slice(2, 4).map((item, index) => (
              <View
                key={index}
                className="relative overflow-hidden w-full h-[142px] px-1 rounded-[10px]"
              >
                <Image
                  source={{ uri: item.previewUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                <View style={styles.typeIcon}>
                  {item.type === 'image' ? (
                    <Feather name="image" size={12} color="#fff" />
                  ) : item.type === 'video' ? (
                    <Feather name="video" size={12} color="#fff" />
                  ) : (
                    <Feather name="file" size={12} color="#fff" />
                  )}
                </View>

                {files.length > 4 && index === 1 && (
                  <View className="bg-black/50 w-[30px] h-[30px] absolute right-1 bottom-1 items-center justify-center rounded-full">
                    <Text className="text-white">{`+${files.length - 4}`}</Text>
                  </View>
                )}

                <TouchableOpacity
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  className="bg-custom"
                  style={styles.removeBtn}
                  onPress={() => removeFile(index === 1 ? 3 : 2)}
                >
                  <Feather name="x" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

export default PreloadChatMedia

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 40,
    top: '50%',
    left: '50%',
    transform: [
      { translateX: '-50%' }, // -50%
      { translateY: '-50%' }, // -50%
    ],
    padding: 12,
    borderRadius: 10,
  },

  typeIcon: {
    position: 'absolute',
    top: 6,
    left: 6,
    height: 24,
    width: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    // backgroundColor: 'rgba(0,0,0,0.5)',
    height: 24,
    width: 24,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
