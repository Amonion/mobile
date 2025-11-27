import React from 'react'
import { View, Text, TextInput, useColorScheme } from 'react-native'

interface InputFieldProps {
  label: string
  value: string
  placeholder?: string
  error?: string | null
  onChangeText: (text: string) => void
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  multiline?: boolean
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad'
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  placeholder,
  error,
  onChangeText,
  autoCapitalize = 'none',
  multiline = false,
  secureTextEntry = false,
  keyboardType = 'default',
}) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View className="mb-[20px]">
      <Text className="text-primary dark:text-dark-primary mb-2 font-semibold">
        {label}
      </Text>

      <TextInput
        className={`input ${error ? 'border-red-500 border' : ''}`}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#BABABA' : '#6E6E6E'}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={{ textAlignVertical: 'center' }}
        importantForAutofill="noExcludeDescendants"
      />

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  )
}

export default InputField
