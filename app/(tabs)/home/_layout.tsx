import { Stack } from 'expo-router'
import { useColorScheme, View } from 'react-native'

export default function HomeLayout() {
  const isDark = useColorScheme() === 'dark'

  return (
    <View className={``}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: isDark ? '#1C1E21' : '#FFFFFF',
          },
        }}
      >
        <Stack.Screen name="notifications" />
        <Stack.Screen name="post/[id]" />
        <Stack.Screen name="exam/[id]" />
        <Stack.Screen name="school/[id]" />
        <Stack.Screen
          name="exam/start/[id]"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="profile" />
        <Stack.Screen name="verification" />
        <Stack.Screen name="user/[username]" />
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  )
}
