import { Stack } from 'expo-router'
import { View } from 'react-native'

export default function HomeLayout() {
  return (
    <View className={`flex-1 bg-secondary dark:bg-dark-secondary`}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="notifications" />
        <Stack.Screen name="post/[id]" />
        {/* <Stack.Screen name="exam/[id]" />
        <Stack.Screen name="school/[id]" />
        <Stack.Screen
          name="exam/start/[id]"
          options={{
            gestureEnabled: false,
          }}
        /> */}
        <Stack.Screen name="profile" />
        <Stack.Screen name="verification" />
        {/* <Stack.Screen name="user/[username]" /> */}
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  )
}
