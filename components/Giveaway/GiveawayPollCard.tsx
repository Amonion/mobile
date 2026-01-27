'use client'
import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { formatCount } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { Poll, PostStore } from '@/store/post/Post'

interface GiveawayPollCardProps {
  postId: string
  isSelected: boolean
  totalVotes: number
}

const GiveawayPollCard: React.FC<GiveawayPollCardProps> = ({
  postId,
  isSelected,
  totalVotes,
}) => {
  const { user } = AuthStore()
  const { selectPoll } = PostStore()
  const post = PostStore((state) =>
    state.postResults.find((p) => p._id === postId)
  )

  if (!post) return null

  const handleSelectPoll = (int: number) => {
    let sendPoll = false
    let total = 0
    let polls: Poll[] = []
    PostStore.setState((state) => {
      const updatedPosts = state.postResults.map((item) => {
        if (item._id === post._id) {
          const updatedPolls = item.polls.map((poll, index) => {
            if (index === int) {
              if (poll.userId === user?._id) {
                sendPoll = false
                return poll
              }
              sendPoll = true
              return {
                ...poll,
                percent: (poll.percent || 0) + 1,
                userId: String(user?._id),
              }
            } else if (poll.userId === user?._id) {
              return {
                ...poll,
                percent: Math.max((poll.percent || 0) - 1, 0),
                userId: '',
              }
            }
            return poll
          })

          const totalVotes = updatedPolls.reduce(
            (sum, poll) => sum + (poll.percent || 0),
            0
          )

          polls = updatedPolls

          total = totalVotes
          return {
            ...item,
            polls: updatedPolls,
            totalVotes,
            isSelected: true,
          }
        }
        return item
      })

      return { postResults: updatedPosts }
    })
    if (sendPoll) {
      selectPoll(`/posts/poll/${post._id}`, {
        polls: polls,
        userId: user?._id,
        username: user?.username,
        totalVotes: total,
        pollIndex: int,
      })
    }
  }

  return (
    <View className="px-3">
      {post.polls.map((poll, index) => (
        <TouchableOpacity
          onPress={() => handleSelectPoll(index)}
          key={index}
          className={`${
            poll.userId === user?._id
              ? 'border-custom'
              : 'border-border dark:border-dark-border'
          } relative overflow-hidden border rounded-lg mt-2`}
        >
          <View className="flex-row z-20 p-1 items-center">
            {poll.picture && (
              <View className="relative h-[40px] w-[50px] min-w-[50px] overflow-hidden mr-2">
                <Image
                  source={{ uri: String(poll.picture) }}
                  className="w-full object-cover rounded-[5px]"
                  resizeMode="cover"
                  alt="Selected Image"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </View>
            )}
            <Text className="flex-1 text-lg text-primary dark:text-dark-primary">
              {poll.text}
            </Text>
            <View className="items-center px-[2px] justify-center min-w-10 h-10 bg-secondary dark:bg-dark-secondary rounded-lg">
              {post.isSelected ? (
                <Text className="text-primary text-[12px] dark:text-dark-primary">
                  {((poll.percent * 100) / post.totalVotes).toFixed(1)}%
                </Text>
              ) : (
                <Text className="text-primary dark:text-dark-primary">?</Text>
              )}
            </View>
          </View>
          <View
            style={{
              width: post.isSelected
                ? `${(poll.percent * 100) / post.totalVotes}%`
                : 0,
            }}
            className="bg-secondary dark:bg-dark-secondary absolute top-0 left-0 h-full"
          ></View>
        </TouchableOpacity>
      ))}
      {post.totalVotes > 0 && post.isSelected && (
        <Text className="text-sm mt-2 text-custom">
          Votes {formatCount(post.totalVotes)}
        </Text>
      )}
    </View>
  )
}

export default GiveawayPollCard
