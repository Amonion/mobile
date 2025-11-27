import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'

interface RadioButtonProps {
  label: string
  selected: boolean
  onPress: () => void
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center my-2"
      activeOpacity={0.7}
    >
      {/* Outer Circle */}
      <View
        className={`w-6 h-6 rounded-full border-2 mr-2
          ${
            selected ? 'border-custom' : 'border-border dark:border-dark-border'
          }`}
      >
        {/* Inner Circle */}
        {selected && (
          <View className="w-3 h-3 rounded-full bg-custom mx-auto my-auto" />
        )}
      </View>

      <Text className="text-primary dark:text-dark-primary">{label}</Text>
    </TouchableOpacity>
  )
}
