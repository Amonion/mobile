import React from 'react'
import { View, Text, TextInput, useColorScheme } from 'react-native'

interface TextAreaFieldProps {
  label: string
  value: string
  placeholder?: string
  error?: string | null
  onChangeText: (text: string) => void
  secureTextEntry?: boolean
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  value,
  placeholder,
  error,
  onChangeText,
  secureTextEntry = false,
}) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View className="mb-[20px]">
      <Text className="text-primary dark:text-dark-primaryLight mb-1">
        {label}
      </Text>

      <TextInput
        className={`p-3 rounded-[10px] text-primary dark:text-dark-primary bg-secondary dark:bg-dark-secondary ${
          error ? 'border-red-500 border' : ''
        }`}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#BABABA' : '#6E6E6E'}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="sentences"
        multiline={true}
        numberOfLines={4}
        secureTextEntry={secureTextEntry}
        keyboardType="default"
        style={{
          textAlignVertical: 'top',
          minHeight: 100,
        }}
        importantForAutofill="noExcludeDescendants"
      />

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  )
}

export default TextAreaField
