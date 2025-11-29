import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import Spinner from '../Response/Spinner'

interface CustomBtnProps {
  label: string
  loading: boolean
  handleSubmit: () => void
  style?: string
}

const CustomBtn: React.FC<CustomBtnProps> = ({
  label,
  loading,
  handleSubmit,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={handleSubmit}
      activeOpacity={0.7}
      disabled={loading}
      className={`${loading ? 'opacity-50' : ''} ${
        style === 'outline' ? 'outlineBtn' : 'customBtn'
      }`}
    >
      {loading ? (
        <Spinner size={40} />
      ) : (
        <Text
          className={`text-xl ${
            style === 'outline'
              ? 'text-primary dark:text-dark-primary'
              : 'text-white'
          } font-psemibold`}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}

export default CustomBtn
