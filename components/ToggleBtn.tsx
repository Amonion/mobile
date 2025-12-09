import React, { useEffect, useRef } from 'react'
import { TouchableOpacity, Animated, View, StyleSheet } from 'react-native'

interface SwitchProps {
  value: boolean
  onChange: (val: boolean) => void
  activeColor?: string
  inactiveColor?: string
}

const CustomSwitch: React.FC<SwitchProps> = ({
  value,
  onChange,
  activeColor = '#4cd964',
  inactiveColor = '#d3d3d3',
}) => {
  const offset = useRef(new Animated.Value(0)).current

  // Track is 60, knob is 20, padding is 4 → real travel distance = 60 - 20 - 8 = 32
  const TRAVEL_DISTANCE = 32

  // Fix: Sync animation with initial value & external value changes
  useEffect(() => {
    Animated.timing(offset, {
      toValue: value ? TRAVEL_DISTANCE : 0,
      duration: 180,
      useNativeDriver: false,
    }).start()
  }, [value])

  const toggle = () => {
    onChange(!value)
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={toggle}>
      <View
        style={[
          styles.track,
          { backgroundColor: value ? activeColor : inactiveColor },
        ]}
      >
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX: offset }] }]}
        />
      </View>
    </TouchableOpacity>
  )
}

export default CustomSwitch

const styles = StyleSheet.create({
  track: {
    width: 60,
    height: 28,
    borderRadius: 30,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: 'white',
  },
})
