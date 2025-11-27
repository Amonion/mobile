import {
  View,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Text,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, Slot, usePathname } from 'expo-router'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { MessageStore } from '@/store/notification/Message'
import { AuthStore } from '@/store/AuthStore'

export default function VerificationLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const pathname = usePathname()
  const { bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const [isProfile, setProfile] = useState(false)
  const [isEducation, setEducation] = useState(false)
  const [isPublic, setPublic] = useState(false)

  useEffect(() => {
    if (bioUserState?.isPublic) {
      setPublic(true)
    }
    if (
      bioUserState?.isEducation &&
      bioUserState.isEducationHistory &&
      bioUserState.isEducationDocument
    ) {
      setEducation(true)
    }

    if (
      bioUserState?.isBio &&
      bioUserState.isOrigin &&
      bioUserState.isContact &&
      bioUserState.isRelated &&
      bioUserState.isDocument
    ) {
      setProfile(true)
    }
  }, [bioUserState])
  return (
    <>
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={{
          flex: 1,
          backgroundColor: isDark ? '#1C1E21' : '#FFFFFF',
        }}
      > */}
      <ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: isDark ? '#1C1E21' : '#FFFFFF',
          paddingBottom: 60,
          // paddingBottom: scrollHeight,
        }}
        className="flex-1 bg-primary dark:bg-dark-primary relative pb-3"
      >
        <View className="flex-row border-b border-b-border dark:border-b-dark-border py-5 justify-center px-[10px] mb-1">
          <TouchableOpacity
            onPress={() => {
              if (pathname !== '/home/verification') {
                router.push('/home/verification/profile')
              }
            }}
            className={`${
              !pathname.includes('education') && !pathname.includes('public')
                ? 'pill'
                : 'pillInActive'
            } mx-2`}
          >
            <Text
              className={`${
                !pathname.includes('education') && !pathname.includes('public')
                  ? 'text-white'
                  : 'text-primary dark:text-dark-primary'
              } `}
            >
              Profile
            </Text>
            {!isProfile && (
              <Feather
                name="help-circle"
                size={14}
                className="ml-1"
                color={
                  !pathname.includes('education') &&
                  !pathname.includes('public')
                    ? '#FFF'
                    : isDark
                    ? '#BABABA'
                    : '#6E6E6E'
                }
              />
            )}
          </TouchableOpacity>
          {/*
          {isProfile ? (
            <TouchableOpacity
              onPress={() => {
                if (pathname !== '/home/verification/public') {
                  router.push('/home/verification/public')
                }
              }}
              className={`${
                pathname.includes('public')
                  ? 'border-custom bg-custom'
                  : 'border-border dark:border-dark-border '
              } py-2 px-2 mx-2 border rounded-[5px] flex-row items-center`}
            >
              <Text
                className={`${
                  pathname.includes('public')
                    ? 'text-white'
                    : 'text-primary dark:text-dark-primary'
                } text-lg`}
              >
                Public
              </Text>
              {isPublic ? (
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={14}
                  color={
                    pathname.includes('public')
                      ? '#00EB0C'
                      : isDark
                      ? '#00B809'
                      : '#05AD0D'
                  }
                  className="ml-1"
                />
              ) : (
                <Feather
                  name="help-circle"
                  size={14}
                  className="ml-1"
                  color={
                    pathname.includes('public')
                      ? '#FFF'
                      : isDark
                      ? '#BABABA'
                      : '#6E6E6E'
                  }
                />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setMessage(
                  'Complete your profile verification to continue.',
                  false
                )
                if (pathname !== '/home/verification/public') {
                  router.push('/home/verification/public')
                }
              }}
              className={`${
                pathname.includes('public')
                  ? 'border-custom bg-custom'
                  : 'border-border dark:border-dark-border '
              } py-2 px-2 mx-2 border rounded-[5px] flex-row items-center`}
            >
              <Text
                className={`${
                  pathname.includes('public')
                    ? 'text-white'
                    : 'text-primary dark:text-dark-primary'
                } text-lg`}
              >
                Public
              </Text>
              {isPublic ? (
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={14}
                  color={
                    pathname.includes('public')
                      ? '#00EB0C'
                      : isDark
                      ? '#00B809'
                      : '#05AD0D'
                  }
                  className="ml-1"
                />
              ) : (
                <Feather
                  name="help-circle"
                  size={14}
                  className="ml-1"
                  color={
                    pathname.includes('public')
                      ? '#FFF'
                      : isDark
                      ? '#BABABA'
                      : '#6E6E6E'
                  }
                />
              )}
            </TouchableOpacity>
          )} */}

          {isPublic ? (
            <TouchableOpacity
              onPress={() => {
                if (pathname !== '/home/verification/education') {
                  router.push('/home/verification/education')
                }
              }}
              className={`${pathname.includes('education') ? '' : ''} `}
            >
              <Text
                className={`${
                  pathname.includes('education')
                    ? 'text-white'
                    : 'text-primary dark:text-dark-primary'
                }`}
              >
                Education
              </Text>
              {isEducation ? (
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={14}
                  color={
                    pathname.includes('education')
                      ? '#00EB0C'
                      : isDark
                      ? '#00B809'
                      : '#05AD0D'
                  }
                  className="ml-1"
                />
              ) : (
                <Feather
                  name="help-circle"
                  size={14}
                  className="ml-1"
                  color={
                    pathname.includes('education')
                      ? '#FFF'
                      : isDark
                      ? '#BABABA'
                      : '#6E6E6E'
                  }
                />
              )}
            </TouchableOpacity>
          ) : (
            <View
              className={`${
                pathname.includes('education') ? '' : 'pillInActive '
              } mx-2`}
            >
              <Text
                className={`${
                  pathname.includes('education')
                    ? 'text-white'
                    : 'text-primary dark:text-dark-primary'
                } text-lg`}
              >
                Education
              </Text>
              {isEducation ? (
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={14}
                  color={
                    pathname.includes('education')
                      ? '#00EB0C'
                      : isDark
                      ? '#00B809'
                      : '#05AD0D'
                  }
                  className="ml-1"
                />
              ) : (
                <Feather
                  name="help-circle"
                  size={14}
                  className="ml-1"
                  color={
                    pathname.includes('education')
                      ? '#FFF'
                      : isDark
                      ? '#BABABA'
                      : '#6E6E6E'
                  }
                />
              )}
            </View>
          )}
        </View>
        <Slot />
      </ScrollView>
      {/* </KeyboardAvoidingView> */}
    </>
  )
}
