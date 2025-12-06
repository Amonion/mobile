import {
  ScrollView,
  TouchableOpacity,
  Text,
  useColorScheme,
  Animated,
} from 'react-native'
import React, { useRef } from 'react'
import { router, Slot, usePathname } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { MessageStore } from '@/store/notification/Message'
import { AuthStore } from '@/store/AuthStore'

export default function VerificationLayout() {
  const pathname = usePathname()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { setMessage } = MessageStore()
  const { bioUserState } = AuthStore()
  const scrollViewRef = useRef<ScrollView | null>(null)
  const translateX = useRef(new Animated.Value(0)).current

  return (
    <>
      <ScrollView
        horizontal
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        style={{
          marginBottom: 20,
          paddingHorizontal: 10,
          position: 'relative',
        }}
      >
        <Animated.View
          className={'py-3'}
          style={{
            flexDirection: 'row',
            transform: [{ translateX }],
            position: 'relative',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              if (pathname !== '/home/verification') {
                router.push('/home/verification')
              }
            }}
            className={` py-1 px-3 flex-row items-center`}
          >
            <Text
              className={`${
                pathname === '/home/verification'
                  ? 'text-custom'
                  : bioUserState?.isBio
                  ? 'text-success dark:text-dark-success'
                  : 'text-primary dark:text-dark-primary'
              } text-xl text-center`}
            >
              Profile
            </Text>
            {!bioUserState?.isBio && (
              <Feather
                name="help-circle"
                size={14}
                className="ml-1"
                color={
                  pathname === '/home/verification'
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
              if (!bioUserState?.isBio) {
                setMessage(
                  'Please complete your profile verification section to continue',
                  false
                )
                return
              }
              if (pathname !== '/home/verification/origin') {
                router.push('/home/verification/origin')
              }
            }}
            className={` py-1 px-3 flex-row items-center`}
          >
            <Text
              className={`${
                pathname === '/home/verification/origin'
                  ? 'text-custom'
                  : bioUserState?.isOrigin
                  ? 'text-success dark:text-dark-success'
                  : 'text-primary dark:text-dark-primary'
              } text-xl text-center`}
            >
              Origin
            </Text>
            {!bioUserState?.isOrigin && (
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
              if (!bioUserState?.isBio || !bioUserState?.isOrigin) {
                setMessage(
                  'Please complete your origin verification section to continue',
                  false
                )
                return
              }
              if (pathname !== '/home/verification/contact') {
                router.push('/home/verification/contact')
              }
            }}
            className={`py-1 px-3 flex-row items-center`}
          >
            <Text
              className={`${
                pathname === '/home/verification/contact'
                  ? 'text-custom'
                  : bioUserState?.isContact
                  ? 'text-success dark:text-dark-success'
                  : 'text-primary dark:text-dark-primary'
              } text-xl text-center`}
            >
              Contact
            </Text>
            {!bioUserState?.isContact && (
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
              if (
                !bioUserState?.isBio ||
                !bioUserState?.isOrigin ||
                !bioUserState.isContact
              ) {
                setMessage(
                  'Please complete your contact verification section to continue',
                  false
                )
                return
              }
              if (pathname !== '/home/verification/related') {
                router.push('/home/verification/related')
              }
            }}
            className={`py-1 px-4 flex-row items-center`}
          >
            <Text
              className={`${
                pathname === '/home/verification/related'
                  ? 'text-custom'
                  : bioUserState?.isRelated
                  ? 'text-success dark:text-dark-success'
                  : 'text-primary dark:text-dark-primary'
              } text-xl text-center`}
            >
              Related
            </Text>
            {!bioUserState?.isRelated && (
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
              if (
                !bioUserState?.isBio ||
                !bioUserState?.isOrigin ||
                !bioUserState.isContact ||
                !bioUserState.isRelated
              ) {
                setMessage(
                  'Please complete your related verification section to continue',
                  false
                )
                return
              }
              if (pathname !== '/home/verification/document') {
                router.push('/home/verification/document')
              }
            }}
            className={`py-1 px-4 flex-row items-center`}
          >
            <Text
              className={`${
                pathname === '/home/verification/document'
                  ? 'text-custom'
                  : bioUserState?.isDocument
                  ? 'text-success dark:text-dark-success'
                  : 'text-primary dark:text-dark-primary'
              } text-xl text-center`}
            >
              Document
            </Text>
            {!bioUserState?.isDocument && (
              <Feather
                name="help-circle"
                size={14}
                className="ml-1"
                color={isDark ? '#BABABA' : '#6E6E6E'}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      {/* <View className="relative">
        <Text className=" text-[12px] right-3 absolute bottom-[15px] text-custom">
          {`Swipe Right`}
        </Text>
      </View> */}

      <Slot />
    </>
  )
}
