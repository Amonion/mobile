import React from 'react'
import { View, Text, useColorScheme } from 'react-native'

import Svg, { Circle } from 'react-native-svg'

type MediaCircularProgressProps = {
  progressPercent: number
  size: number
  strokeWidth: number
  radius: number
}

const MediaCircularProgress: React.FC<MediaCircularProgressProps> = ({
  progressPercent,
  size,
  strokeWidth,
  radius,
}) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false

  return (
    <View
      style={{ width: 55, height: 55 }}
      className=" items-center relative justify-center mr-2"
    >
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? '#121314' : '#EBEDF4'}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#DA3986"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={2 * Math.PI * radius}
          strokeDashoffset={2 * Math.PI * radius * (1 - progressPercent / 100)}
          strokeLinecap="round"
        />
      </Svg>
      <Text className="absolute text-primary dark:text-dark-primary text-xs font-medium">
        {progressPercent}%
      </Text>
    </View>
  )
}

export default MediaCircularProgress
