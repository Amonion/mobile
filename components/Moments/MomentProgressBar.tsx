// components/MomentProgressBar.tsx
import { MomentStore } from '@/store/post/Moment'
import React, { useEffect, useRef } from 'react'
import { View, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function MomentProgressBar() {
  const {
    activeMoment,
    moments,
    activeMomentIndex,
    activeMomentMediaIndex,
    isPlaying,
    openMomentModal,
    changeActiveMomentMedia,
  } = MomentStore()
  const insets = useSafeAreaInsets()
  const progressAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!activeMoment?.media?.length) return
    const currentItem = activeMoment.media[activeMomentMediaIndex]
    if (!currentItem) return

    progressAnim.setValue(0)
    const duration = (currentItem.duration ?? 5) * 1000 // default to 5s

    if (isPlaying) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          if (activeMomentMediaIndex + 1 < activeMoment.media.length) {
            changeActiveMomentMedia(
              activeMomentMediaIndex + 1,
              activeMomentIndex
            )
          } else if (activeMomentIndex + 1 < moments.length) {
            openMomentModal(activeMomentIndex + 1)
          }
        }
      })
    }

    return () => {
      progressAnim.stopAnimation()
    }
  }, [activeMoment?._id, activeMomentMediaIndex, isPlaying])

  if (!activeMoment?.media?.length) return null

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 4,
        position: 'absolute',
        top: insets.top,
        left: 0,
        right: 0,
        paddingHorizontal: 8,
      }}
    >
      {activeMoment.media.map((_, index) => {
        const width = progressAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 100],
        })

        return (
          <View
            key={index}
            style={{
              flex: 1,
              height: 3,
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: 3,
              overflow: 'hidden',
              marginHorizontal: 2,
            }}
          >
            <Animated.View
              style={{
                height: '100%',
                backgroundColor: '#fff',
                width:
                  index < activeMomentMediaIndex
                    ? '100%'
                    : index === activeMomentMediaIndex
                    ? width.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      })
                    : '0%',
              }}
            />
          </View>
        )
      })}
    </View>
  )
}
