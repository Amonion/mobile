import React, { useState } from 'react'
import {
  Keyboard,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native'
import { randomUUID } from 'expo-crypto'
import { Send } from 'lucide-react-native'
import { AuthStore } from '@/store/AuthStore'
import { MessageStore } from '@/store/notification/Message'
import CommentStore, { CommentEmpty } from '@/store/post/Comment'
import Spinner from '../Response/Spinner'

const CommentPostSheetInput: React.FC = () => {
  const [text, setText] = useState('')
  const colorScheme = useColorScheme()
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const {
    commentForm,
    activeComment,
    mainPost,
    loading,
    postItem,
    setTempComment,
  } = CommentStore()
  const isDark = colorScheme === 'dark'
  const color = isDark ? '#BABABA' : '#6E6E6E'

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
      postId: commentForm._id ? commentForm._id : mainPost._id,
      uniqueId: uniqueId,
      replyToId:
        activeComment.level >= 4
          ? activeComment.replyToId
          : activeComment._id
          ? activeComment._id
          : mainPost._id,
      level:
        activeComment._id === ''
          ? 1
          : activeComment.level >= 4
          ? 3
          : activeComment.level,
      commentSource: 'post',
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
      postId: activeComment.postId ? activeComment.postId : mainPost._id,
      replyToId:
        activeComment.level >= 4
          ? activeComment.replyToId
          : activeComment._id
          ? activeComment._id
          : mainPost._id,
      content: text,
      replyTo: activeComment.displayName,
      user: activeComment.displayName,
      //   commentMedia: files.length > 0 ? files[0].src : '',
      picture: String(user.picture),
      createdAt: new Date(),
    })

    setText('')
    Keyboard.dismiss()
    postItem('/comments', formData)
  }

  return (
    <View className="flex flex-row items-center gap-3">
      <TextInput
        placeholder="Write a comment..."
        onChangeText={setText}
        value={text}
        className="flex-1 rounded-[25px] bg-secondary dark:bg-dark-secondary px-4 py-3 text-primary dark:text-dark-primary"
        placeholderTextColor={color}
        style={{
          minHeight: 40,
          maxHeight: 120,
          textAlignVertical: 'top',
        }}
        multiline
        numberOfLines={4}
        returnKeyType="send"
        onSubmitEditing={submitComment}
      />
      {loading ? (
        <Spinner size={25} />
      ) : (
        <TouchableOpacity
          onPress={submitComment}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="p-2"
        >
          <Send color={'#DA3986'} size={25} />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default CommentPostSheetInput
