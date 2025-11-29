import { Area } from '@/store/place/Area'
import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native'

interface DropdownProps {
  data: Area[]
  placeholder?: string
  onSelect: (value: Area) => void
  disabled?: boolean
  errorMessage?: string
  type?: string
}

const CustomDropdown: React.FC<DropdownProps> = ({
  data,
  placeholder = 'Select...',
  onSelect,
  disabled = false,
  errorMessage,
  type,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showError, setShowError] = useState(false)
  const [selected, setSelected] = useState<string>(placeholder)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const heightAnim = useRef(new Animated.Value(0)).current

  // -----------------------------
  // Animation handling
  // -----------------------------
  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(heightAnim, {
          toValue: 160,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: false,
        }),
      ]).start()
    }
  }, [isOpen])

  // -----------------------------
  // Item selection
  // -----------------------------
  const handleSelect = (item: Area) => {
    setSelected(
      type === 'state' ? item.state : type === 'area' ? item.area : item.country
    )
    onSelect(item)
    setIsOpen(false)
  }

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      setShowError(false)
    } else {
      setShowError(true)
    }
  }

  return (
    <>
      {isOpen && (
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <View className="w-full mb-5 relative">
        <Text className="text-primary dark:text-dark-primaryLight mb-1">
          {placeholder}
        </Text>

        <TouchableOpacity
          onPress={toggleDropdown}
          // disabled={disabled}
          activeOpacity={disabled ? 1 : 0.7}
          className={`rounded-full p-4 flex-row justify-between
            ${
              disabled
                ? 'bg-gray-300 dark:bg-gray-700'
                : 'bg-secondary dark:bg-dark-secondary'
            }
          `}
        >
          <Text
            className={`${
              disabled
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-primary dark:text-dark-primary'
            }`}
          >
            {selected || placeholder}
          </Text>

          <Text
            className={`text-sm ${
              disabled
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-primary dark:text-dark-primary'
            }`}
          >
            {isOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {errorMessage && showError && (
          <Text className="text-red-500 mt-1">{errorMessage}</Text>
        )}

        <Animated.View
          className="rounded-xl overflow-hidden w-full left-0 z-20 absolute top-[75px] border border-border dark:border-dark-border
                     bg-secondary dark:bg-dark-secondary"
          style={{
            opacity: fadeAnim,
            height: heightAnim,
          }}
        >
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {data.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="border-b border-border dark:border-dark-border p-4"
                onPress={() => handleSelect(item)}
              >
                <Text className="text-primary dark:text-dark-primary">
                  {type === 'state'
                    ? item.state
                    : type === 'area'
                    ? item.area
                    : item.country}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </>
  )
}

export default CustomDropdown

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
})
