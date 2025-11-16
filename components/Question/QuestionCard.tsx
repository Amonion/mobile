import { formatDate } from '@/lib/helpers'
import ExamStore, { Exam } from '@/store/exam/Exam'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  useColorScheme,
} from 'react-native'

interface QuestionCardProps {
  item: Exam
}

const QuestionCard: React.FC<QuestionCardProps> = ({ item }) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const move = () => {
    ExamStore.setState({ examForm: item })
    router.push(`/questions/${item._id}/exam`)
  }

  return (
    <View className="pt-2 pb-2 mb-[2px] bg-primary dark:bg-dark-primary px-3 w-full">
      {/* Image */}
      <View className="mb-1">
        <View className="h-[200px] w-full rounded-[5px] mb-1 overflow-hidden">
          <Image
            style={{ height: '100%', objectFit: 'cover' }}
            source={
              item?.picture
                ? { uri: item.picture }
                : require('@/assets/images/class.png')
            }
            className="w-full h-full"
          />
        </View>

        {/* Profile Row */}
        <View className="flex-row relative">
          <View className="h-[50px] w-[50px] rounded-full mr-3 overflow-hidden">
            <Image
              style={{ height: '100%', objectFit: 'cover' }}
              source={
                item?.logo
                  ? { uri: item.logo }
                  : item?.picture
                  ? { uri: item.picture }
                  : require('@/assets/images/icon.png')
              }
              className="w-full h-full"
            />
          </View>

          <TouchableOpacity onPress={move} className="flex-1">
            <Text className="text-primary dark:text-dark-primary text-lg mr-1 line-clamp-1">
              {item.title}
            </Text>
            <Text className="text-custom mb-1">@{item.name}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer Row */}
      <View className="flex-row flex-wrap items-center">
        {/* Type */}
        <View className="flex-row items-center">
          <Ionicons
            name="document-text-outline"
            size={16}
            color={isDark ? '#848484' : '#6E6E6E'}
          />
          <Text className="text-primary text-sm dark:text-dark-primaryLight uppercase">
            {item.type}
          </Text>
        </View>

        <View className="w-1 h-1 bg-slate-600 rounded-full mx-2" />

        {/* Subjects */}
        <View className="flex-row items-center">
          <Ionicons
            name="layers-outline"
            size={16}
            color={isDark ? '#848484' : '#6E6E6E'}
          />
          <Text className="text-primary text-sm dark:text-dark-primaryLight">
            {item.subjects}
          </Text>
        </View>

        <View className="w-1 h-1 bg-slate-600 rounded-full mx-2" />

        {/* Published Date */}
        <View className="flex-row items-center">
          <MaterialIcons
            name="date-range"
            size={16}
            color={isDark ? '#848484' : '#6E6E6E'}
          />
          <Text className="text-primary text-sm dark:text-dark-primaryLight">
            {formatDate(String(item.publishedAt))}
          </Text>
        </View>

        <View className="w-1 h-1 bg-slate-600 rounded-full mx-2" />

        {/* Questions Count */}
        <View className="flex-row items-center">
          <Ionicons
            name="help-circle-outline"
            size={16}
            color={isDark ? '#848484' : '#6E6E6E'}
          />
          <Text className="text-primary text-sm dark:text-dark-primaryLight">
            {item.questions}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default QuestionCard
