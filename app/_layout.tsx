import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { useColorScheme } from '@/hooks/use-color-scheme'
import '../global.css'
import { useCallback, useEffect } from 'react'
import { Platform, View } from 'react-native'
import { useFonts } from 'expo-font'
import * as NavigationBar from 'expo-navigation-bar'
import Message from '@/components/Response/Message'
import { MessageStore } from '@/store/notification/Message'
import { NewsProvider } from '@/context/NewsContext'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { GeneralProvider } from '@/context/GeneralContext'
import { MomentProvider } from '@/context/MomentContext'
import { ExamProvider } from '@/context/ExamContext'
import { ChatProvider } from '@/context/ChatContext'
import { PostProvider } from '@/context/PostContext'
import { TraceProvider } from '@/context/TraceContext'
import UserAlert from '@/components/UserAlert'
import { UserProvider } from '@/context/UserContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { GiveawayProvider } from '@/context/GiveawayContext'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const { message } = MessageStore()
  const isDark = colorScheme === 'dark' ? true : false
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Black': require('../assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins/Poppins-ExtraLight.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Thin': require('../assets/fonts/Poppins/Poppins-Thin.ttf'),
  })

  useEffect(() => {
    const theme = isDark ? 'light' : 'dark'
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync(theme)
    }
  }, [isDark])

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GeneralProvider>
        <UserProvider>
          <NotificationProvider>
            <GiveawayProvider>
              <TraceProvider>
                <ChatProvider>
                  <PostProvider>
                    <NewsProvider>
                      <MomentProvider>
                        <ExamProvider>
                          <UserAlert />
                          {message !== null && <Message />}
                          <GestureHandlerRootView style={{ flex: 1 }}>
                            <View
                              style={{ flex: 1 }}
                              onLayout={onLayoutRootView}
                            >
                              <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="index" />
                                {/* <Stack.Screen name="trace" /> */}
                              </Stack>
                            </View>
                          </GestureHandlerRootView>

                          <StatusBar style={isDark ? 'light' : 'dark'} />
                        </ExamProvider>
                      </MomentProvider>
                    </NewsProvider>
                  </PostProvider>
                </ChatProvider>
              </TraceProvider>
            </GiveawayProvider>
          </NotificationProvider>
        </UserProvider>
      </GeneralProvider>
    </ThemeProvider>
  )
}
