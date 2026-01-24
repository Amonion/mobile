import { TouchableOpacity, Text, useColorScheme, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { router, Slot, usePathname } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { MessageStore } from '@/store/notification/Message'
import { AuthStore } from '@/store/AuthStore'
import { BioUserSchoolInfoStore } from '@/store/user/BioUserSchoolInfo'

export default function VerificationLayout() {
  const pathname = usePathname()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { setMessage } = MessageStore()
  const { bioUserSchoolInfo, bioUserState } = AuthStore()
  const { getPastSchools } = BioUserSchoolInfoStore()
  const translateX = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!bioUserSchoolInfo) return
    BioUserSchoolInfoStore.setState({ bioUserSchoolForm: bioUserSchoolInfo })
    getPastSchools(`/biousers-school/schools/${bioUserSchoolInfo.bioUserId}`)
  }, [bioUserSchoolInfo])

  return (
    <>
      <Animated.View
        className={'py-3'}
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          transform: [{ translateX }],
          position: 'relative',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (pathname !== '/home/verification/education') {
              router.push('/home/verification/education')
            }
          }}
          className={` py-1 px-3 flex-row items-center`}
        >
          <Text
            className={`${
              pathname === '/home/verification/education'
                ? 'text-custom'
                : bioUserState?.isEducation
                  ? 'text-success dark:text-dark-success'
                  : 'text-primary dark:text-dark-primary'
            } text-xl text-center`}
          >
            Current
          </Text>
          {!bioUserState?.isEducation && (
            <Feather
              name="help-circle"
              size={14}
              className="ml-1"
              color={
                pathname === '/home/verification/education'
                  ? '#DA3986'
                  : isDark
                    ? '#BABABA'
                    : '#6E6E6E'
              }
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (!bioUserState?.isEducation) {
              setMessage(
                'Please complete your current education verification section to continue',
                false
              )
              return
            }
            if (pathname !== '/home/verification/education/history') {
              router.push('/home/verification/education/history')
            }
          }}
          className={` py-1 px-3 flex-row items-center`}
        >
          <Text
            className={`${
              pathname === '/home/verification/education/history'
                ? 'text-custom'
                : bioUserState?.isEducationHistory
                  ? 'text-success dark:text-dark-success'
                  : 'text-primary dark:text-dark-primary'
            } text-xl text-center`}
          >
            History
          </Text>
          {!bioUserState?.isEducationHistory && (
            <Feather
              name="help-circle"
              size={14}
              className="ml-1"
              color={isDark ? '#BABABA' : '#6E6E6E'}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (!bioUserState?.isEducationHistory) {
              setMessage(
                'Please complete your past education verification section to continue',
                false
              )
              return
            }
            if (pathname !== '/home/verification/education/document') {
              router.push('/home/verification/education/document')
            }
          }}
          className={`py-1 px-3 flex-row items-center`}
        >
          <Text
            className={`${
              pathname === '/home/verification/education/document'
                ? 'text-custom'
                : bioUserState?.isEducationDocument
                  ? 'text-success dark:text-dark-success'
                  : 'text-primary dark:text-dark-primary'
            } text-xl text-center`}
          >
            Document
          </Text>
          {!bioUserState?.isEducationDocument && (
            <Feather
              name="help-circle"
              size={14}
              className="ml-1"
              color={isDark ? '#BABABA' : '#6E6E6E'}
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      <Slot />
    </>
  )
}
