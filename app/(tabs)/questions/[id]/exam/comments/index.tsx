// app/(tabs)/questions/[id]/comments/index.tsx
import { View, Text, Pressable } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl mb-4">Comments for Question {id}</Text>
      {/* Your comments list */}
      <Pressable onPress={() => router.back()}>
        <Text className="text-custom mt-6">← Back to Question</Text>
      </Pressable>
    </View>
  )
}
