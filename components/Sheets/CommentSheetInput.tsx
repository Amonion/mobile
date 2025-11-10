import React, { useState } from 'react'
import { Keyboard, TextInput, View, useColorScheme } from 'react-native'
import { randomUUID } from 'expo-crypto'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Send } from 'lucide-react-native'
import { AuthStore } from '@/store/AuthStore'
import { MessageStore } from '@/store/notification/Message'
import CommentStore, { CommentEmpty } from '@/store/post/Comment'
import NewsStore from '@/store/news/News'

const CommentSheetInput: React.FC = () => {
  const [text, setText] = useState('')
  const colorScheme = useColorScheme()
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const { newsForm } = NewsStore()
  const { commentForm, activeComment, postItem, setTempComment } =
    CommentStore()
  const isDark = colorScheme === 'dark'
  const color = isDark ? '#BABABA' : '#6E6E6E'
  const insets = useSafeAreaInsets()

  const submitComment = async () => {
    if (!user) return
    if (text.length === 0) {
      setMessage('Your comment is empty and cannot be submitted.', false)
      return
    }

    const uniqueId = randomUUID()

    const formData = {
      to: 'users',
      content: text,
      editId: '',
      postId: commentForm._id ? commentForm._id : newsForm._id,
      uniqueId: uniqueId,
      replyToId:
        activeComment.level >= 4
          ? activeComment.replyToId
          : activeComment._id
          ? activeComment._id
          : newsForm._id,
      level:
        activeComment._id === ''
          ? 1
          : activeComment.level >= 4
          ? 3
          : activeComment.level,
      postType: 'comment',
      commentSource: 'news',
      replyTo: activeComment.displayName,
      user: activeComment.displayName,
      sender: {
        picture: user?.picture,
        displayName: user?.displayName,
        username: user?.username,
        _id: user?._id,
        isVerified: user?.isVerified,
      },
      createdAt: new Date().toISOString(),
      //   commentMedia: files.length > 0 ? files[0].src : undefined,
    }

    setTempComment({
      ...CommentEmpty,
      _id: uniqueId,
      username: user.username,
      userId: user._id,
      uniqueId: uniqueId,
      level:
        activeComment._id === ''
          ? 1
          : activeComment.level >= 4
          ? 3
          : activeComment.level,
      displayName: user.displayName,
      postId: activeComment.postId ? activeComment.postId : newsForm._id,
      replyToId:
        activeComment.level >= 4
          ? activeComment.replyToId
          : activeComment._id
          ? activeComment._id
          : newsForm._id,
      content: text,
      replyTo: activeComment.displayName,
      user: activeComment.displayName,
      //   commentMedia: files.length > 0 ? files[0].src : '',
      picture: String(user.picture),
      createdAt: new Date(),
    })

    setText('')
    Keyboard.dismiss()
    // postItem('/posts/comments', formData)
  }

  return (
    <>
      <View
        className="absolute bg-primary dark:bg-dark-primary z-30 pt-1 px-3 gap-3 items-center left-0 w-full flex flex-row"
        style={{
          bottom: insets.bottom,
        }}
      >
        <TextInput
          placeholder="Write a comment..."
          onChangeText={setText}
          value={text}
          className="rounded-[25px] text-primary dark:text-dark-primary bg-secondary dark:bg-dark-secondary px-3"
          placeholderTextColor={color}
          style={{
            flex: 1,
            minHeight: 40,
            maxHeight: 120,
            textAlignVertical: 'top',
          }}
          multiline
          numberOfLines={4}
          returnKeyType="send"
          onSubmitEditing={submitComment}
        />
        <Send onPress={submitComment} color={'#DA3986'} size={25} />
      </View>
    </>
  )
}

export default CommentSheetInput
