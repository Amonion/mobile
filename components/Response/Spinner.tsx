import React from 'react'
import { Image } from 'react-native'
interface SpinnerProps {
  size: number
}

const Spinner: React.FC<SpinnerProps> = ({ size }) => {
  return (
    <Image
      source={require('@/assets/images/Spinner.gif')}
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  )
}
export default Spinner
