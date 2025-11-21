import React from 'react'
import RenderHTML from 'react-native-render-html'
import { useWindowDimensions } from 'react-native'

interface ChatHTMLProps {
  html: string
  color: string
  isSender: boolean
}

const ChatHTMLComponent: React.FC<ChatHTMLProps> = ({
  html,
  color,
  isSender,
}) => {
  const { width } = useWindowDimensions()

  return (
    <RenderHTML
      contentWidth={width}
      source={{ html }}
      baseStyle={{
        color,
        fontSize: 17,
        fontWeight: '400',
        lineHeight: 23,
        textAlign: 'left',
      }}
    />
  )
}

// Add displayName to satisfy ESLint
ChatHTMLComponent.displayName = 'ChatHTML'

export const ChatHTML = React.memo(ChatHTMLComponent)
