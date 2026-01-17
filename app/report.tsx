import CustomBtn from '@/components/General/CustomBtn'
import { moveToProfile } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { MessageStore } from '@/store/notification/Message'
import { PostEmpty, PostStore } from '@/store/post/Post'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'
import React, { useState } from 'react'
import {
  TouchableOpacity,
  Text,
  Image,
  View,
  useColorScheme,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ReportPost: React.FC = () => {
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const { reportedUser, reporting, loading, reportUser } = PostStore()
  const [content, setContent] = useState('')
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const insets = useSafeAreaInsets()

  const submit = () => {
    if (content.trim().length < 30) {
      setMessage('Your reason must be at least 30 characters long.', false)
      return
    }
    if (!user) return
    reportUser(
      reporting === 'post'
        ? `/posts/report/${reportedUser._id}`
        : `/users/report/${reportedUser.userId}`,
      {
        username: reportedUser.username,
        displayName: reportedUser.displayName,
        picture: reportedUser.picture,
        userId: reportedUser.userId,
        bioUserId: reportedUser.bioUserId,
        reporterDisplayName: user.displayName,
        reporterUsername: user.username,
        reporterBioUserId: user.bioUserId,
        reporterPicture: user.picture,
        reporterUserId: user._id,
        postId: reportedUser._id,
        report: content.trim(),
      },
      closeReport
    )
  }

  const closeReport = () => {
    PostStore.setState({ reportedUser: PostEmpty })
    setContent('')
    router.back()
  }

  const move = () => {
    if (user) {
      moveToProfile(
        {
          ...reportedUser,
          _id: reportedUser.userId,
          media: String(reportedUser.userMedia),
        },
        user.username
      )

      router.push(
        user.username === reportedUser.username
          ? `/home/profile/my-profile`
          : `/home/user/${reportedUser?.username}`
      )
    }
  }

  return (
    <View className="bg-secondary flex flex-1 dark:bg-dark-secondary">
      <View
        style={{
          paddingTop: Platform.OS === 'ios' ? insets.top : insets.top,
        }}
        className="flex-row px-3 items-start bg-primary pt-2 pb-3 dark:bg-dark-primary mb-auto"
      >
        <TouchableOpacity onPress={move} className="mr-3">
          <Image
            source={{ uri: reportedUser.picture }}
            className="rounded-full"
            style={{
              width: 55,
              height: 55,
            }}
          />
        </TouchableOpacity>

        <View>
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-2" onPress={move}>
              <Text className="font-semibold text-xl text-primary dark:text-dark-primary line-clamp-1 overflow-ellipsis">
                {reportedUser.displayName}
              </Text>
            </TouchableOpacity>
            {reportedUser.isVerified && (
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={18}
                color="#DA3986"
                style={{ marginLeft: 'auto' }}
              />
            )}
          </View>
          <TouchableOpacity onPress={move}>
            <Text className="text-custom">@{reportedUser.username}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
          className="p-4 justify-center items-start ml-auto"
          onPress={() => router.back()}
        >
          <ArrowRight size={26} color={isDark ? '#BABABA' : '#6E6E6E'} />
        </TouchableOpacity>
      </View>
      <Text className="p-3 text-primary dark:text-dark-primary text-xl uppercase">
        {reporting === 'post' ? 'Reporting of Post' : 'Reporting of Account'}
      </Text>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View
            style={{
              paddingBottom: Platform.OS === 'ios' ? 0 : 0,
            }}
            className="bg-primary dark:bg-dark-primary w-full pt-5 rounded-t-xl px-[10px]"
          >
            <TextInput
              style={{ height: 100 }}
              className={`rounded-[10px] py-3 mb-3 text-lg px-3 w-full text-primary dark:text-dark-primary font-rRegular bg-secondary dark:bg-dark-secondary`}
              placeholder="Write your content"
              value={content}
              onChangeText={setContent}
              placeholderTextColor={isDark ? '#A0A0A0' : '#6E6E6E'}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoCapitalize="none"
              importantForAutofill="noExcludeDescendants"
            />
            <CustomBtn
              handleSubmit={submit}
              label="Submit Report"
              loading={loading}
            />
            <View className="mb-4" />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  )
}

export default ReportPost
