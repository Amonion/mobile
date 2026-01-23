import { AuthStore } from '@/store/AuthStore'
import ObjectiveStore, { IOption, Objective } from '@/store/exam/Objective'
import UserExamStore from '@/store/exam/UserExam'
import { MessageStore } from '@/store/notification/Message'
import React from 'react'
import SocketService from '@/store/socket'
import { View, Text, TouchableOpacity } from 'react-native'
import RenderHtml, {
  HTMLContentModel,
  HTMLElementModel,
} from 'react-native-render-html'

interface Props {
  data: Objective[]
  isLastResults: boolean
  pageSize: number
  currentPage: number
  width: number
  isDark: boolean
  optionsLabel: string[]
}

const QuestionsList: React.FC<Props> = ({
  data,
  isLastResults,
  pageSize,
  currentPage,
  width,
  isDark,
  optionsLabel,
}) => {
  const { selectAnswer } = ObjectiveStore()
  const { bioUser } = AuthStore()
  const { setMessage } = MessageStore()
  const { isActive } = UserExamStore()
  const socket = SocketService.getSocket()

  const customHTMLElementModels = {
    colgroup: HTMLElementModel.fromCustomModel({
      tagName: 'colgroup',
      contentModel: HTMLContentModel.block,
    }),
  }

  const chooseAnswer = (item: IOption, id: string) => {
    if (!isActive) {
      setMessage('Please click the play button to begin your test.', false)
      return
    }
    selectAnswer?.(item, id)
    if (socket && bioUser) {
      socket.emit(`message`, {
        to: 'test',
        option: item,
        questionId: id,
        bioUserId: bioUser._id,
      })
    }
  }

  return (
    <>
      {data.map((question, index) => (
        <View
          key={index}
          className={`${
            question.isClicked
              ? 'border-border dark:border-dark-border'
              : 'border-transparent'
          } rounded-md mb-3 border`}
        >
          <View
            className={`flex-row flex-1 rounded-[5px] p-[2px] ${
              question.isClicked ? 'clicked' : ''
            }`}
          >
            {pageSize && (
              <Text className="text-primary dark:text-dark-primary mr-2">
                {(Number(currentPage) - 1) * pageSize + index + 1}
              </Text>
            )}

            <View className="flex-1">
              <RenderHtml
                contentWidth={width}
                source={{ html: question.question }}
                customHTMLElementModels={customHTMLElementModels}
                baseStyle={{
                  color: isDark ? '#EFEFEF' : '#3A3A3A',
                  fontSize: 14,
                  lineHeight: 23,
                }}
              />

              {question.options.map((item, int) =>
                isLastResults ? (
                  <View key={int} className="flex-row flex-1 py-2 pr-2">
                    <Text
                      className={`${
                        item.isSelected && question.isClicked
                          ? 'text-green-600'
                          : item.isClicked
                            ? 'text-custom'
                            : 'text-primary dark:text-dark-primary'
                      } mr-1`}
                    >
                      {optionsLabel[int]})
                    </Text>

                    <Text
                      className={`${
                        item.isSelected && question.isClicked
                          ? 'text-green-600'
                          : item.isClicked
                            ? 'text-custom'
                            : 'text-primary dark:text-dark-primary'
                      } flex-1 text-[14px]`}
                    >
                      {item.value}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    key={int}
                    onPress={() => chooseAnswer?.(item, question._id)}
                    className="flex-row flex-1 py-2 pr-2"
                  >
                    <Text
                      className={`${
                        item.isClicked
                          ? 'text-custom'
                          : 'text-primary dark:text-dark-primary'
                      } mr-1`}
                    >
                      {optionsLabel[int]})
                    </Text>

                    <Text
                      className={`${
                        item.isClicked
                          ? 'text-custom'
                          : 'text-primary dark:text-dark-primary'
                      } flex-1 text-[14px]`}
                    >
                      {item.value}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>
      ))}
    </>
  )
}

export default QuestionsList
