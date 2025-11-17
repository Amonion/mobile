import { IOption, Objective } from '@/store/exam/Objective'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import RenderHtml from 'react-native-render-html'

interface Props {
  data: Objective[]
  isLastResults: boolean
  pageSize: number
  currentPage: number
  width: number
  isDark: boolean
  optionsLabel: string[]
  selectAnswer?: (item: IOption, id: string) => void
}

const QuestionsList: React.FC<Props> = ({
  data,
  isLastResults,
  pageSize,
  currentPage,
  width,
  isDark,
  optionsLabel,
  selectAnswer,
}) => {
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
                baseStyle={{
                  color: isDark ? '#EFEFEF' : '#3A3A3A',
                  fontSize: 14,
                  fontWeight: '400',
                  lineHeight: 23,
                  flexGrow: 1,
                }}
                tagsStyles={{
                  p: {
                    marginBottom: 4,
                    color: isDark ? '#EFEFEF' : '#3A3A3A',
                    fontSize: 14,
                    lineHeight: 23,
                  },
                }}
              />

              {question.options.map((item, int) =>
                isLastResults ? (
                  <View key={int} className="flex-row flex-1 py-2 pr-2">
                    <Text
                      className={`${
                        item.isSelected
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
                        item.isSelected
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
                    onPress={() => selectAnswer?.(item, question._id!)}
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
