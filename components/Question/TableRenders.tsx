import React from 'react'
import { WebView } from 'react-native-webview'

export default function HtmlTableWebView({ html }: { html: string }) {
  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: `<html><body>${html}</body></html>` }}
      style={{ height: 300 }}
    />
  )
}
