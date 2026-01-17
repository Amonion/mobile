import React from 'react'
import { View, Text, Pressable, useColorScheme } from 'react-native'
import { Feather } from '@expo/vector-icons'
import ObjectiveStore from '@/store/exam/Objective'

interface PaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize)
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter((page) => {
    if (totalPages <= 5) return true
    if (
      page === currentPage ||
      page === currentPage + 1 ||
      page === currentPage + 2
    )
      return true
    if (
      page === 1 ||
      page === 2 ||
      page === totalPages - 1 ||
      page === totalPages
    )
      return true
    return false
  })

  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false

  const onPageChange = (i: number) => {
    ObjectiveStore.setState({ currentPage: i })
  }

  return (
    <View className="flex-row items-center">
      <Text className="text-lg text-primary dark:text-dark-primary">
        Results {totalItems}
      </Text>
      <View className="flex-row ml-auto items-center space-x-2">
        {currentPage > 1 && (
          <Pressable
            onPress={() => onPageChange(currentPage - 1)}
            className="p-2 rounded-full bg-secondary dark:bg-dark-secondary"
          >
            <Feather
              name="chevron-left"
              size={18}
              color={isDark ? '#EFEFEF' : '#3A3A3A'}
            />
          </Pressable>
        )}

        {pages.map((page, index, filteredPages) => (
          <React.Fragment key={page}>
            {index > 0 &&
              filteredPages[index] !== filteredPages[index - 1] + 1 && (
                <Text key={`dots-${index}`} className="text-gray-500 mx-1">
                  ...
                </Text>
              )}

            <Pressable
              onPress={() => onPageChange(page)}
              className={`h-8 w-8 items-center justify-center mx-1 rounded-full ${
                currentPage === page
                  ? 'bg-custom'
                  : 'bg-secondary dark:bg-dark-secondary'
              }`}
            >
              <Text
                className={`${
                  currentPage === page
                    ? 'text-white'
                    : 'text-secondary dark:text-dark-secondary'
                }`}
              >
                {page}
              </Text>
            </Pressable>
          </React.Fragment>
        ))}

        {currentPage < totalPages && (
          <Pressable
            onPress={() => onPageChange(currentPage + 1)}
            className="p-2 rounded-full bg-secondary dark:bg-dark-secondary"
          >
            <Feather
              name="chevron-right"
              size={18}
              color={isDark ? '#EFEFEF' : '#3A3A3A'}
            />
          </Pressable>
        )}
      </View>
    </View>
  )
}

export default Pagination
