import {
  ScrollView,
  TouchableOpacity,
  Text,
  useColorScheme,
  Animated,
  View,
} from 'react-native'
import React, { useRef } from 'react'
import { router, Slot, usePathname } from 'expo-router'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { MessageStore } from '@/store/notification/Message'
import { AuthStore } from '@/store/AuthStore'

export default function VerificationLayout() {
  const pathname = usePathname()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { setMessage } = MessageStore()
  const scrollViewRef = useRef<ScrollView | null>(null)
  const translateX = useRef(new Animated.Value(0)).current
  const { bioUserState } = AuthStore()

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
          style={{
            flexDirection: 'row',
            transform: [{ translateX }],
            position: 'relative',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              if (pathname !== '/home/verification/profile') {
                router.push('/home/verification/profile')
              }
            }}
            className={`${
              pathname === '/home/verification/profile'
                ? 'border-b-custom'
                : 'border-b-border dark:border-b-dark-border'
            } py-1 px-3 border-b flex-row items-center`}
          >
            <Text
              className={`${
                pathname === '/home/verification/profile'
                  ? 'text-custom'
                  : 'text-primary dark:text-dark-primary'
              } text-xl text-center`}
            >
              Profile
            </Text>
            {bioUserState?.isBio ? (
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={14}
                color={
                  pathname.includes('public')
                    ? '#0DFF19'
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
                color={isDark ? '#BABABA' : '#6E6E6E'}
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
              if (pathname !== '/home/verification/profile/origin') {
                router.push('/home/verification/profile/origin')
              }
            }}
            className={`${
              pathname === '/home/verification/profile/origin'
                ? 'border-b-custom'
                : 'border-b-border dark:border-b-dark-border'
            } py-1 px-3 border-b flex-row items-center`}
          >
            <Text
              className={`${
                pathname === '/home/verification/profile/origin'
                  ? 'text-custom'
                  : 'text-primary dark:text-dark-primary'
              } text-xl text-center`}
            >
              Origin
            </Text>
            {bioUserState?.isOrigin ? (
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={14}
                color={
                  pathname.includes('public')
                    ? '#0DFF19'
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
              if (pathname !== '/home/verification/profile/contact') {
                router.push('/home/verification/profile/contact')
              }
            }}
            className={`${
              pathname === '/home/verification/profile/contact'
                ? 'border-b-custom'
                : 'border-b-border dark:border-b-dark-border'
            } py-1 px-3 border-b flex-row items-center`}
          >
            <Text
              className={`${
                pathname === '/home/verification/profile/contact'
                  ? 'text-custom'
                  : 'text-primary dark:text-dark-primary'
              } text-xl text-center`}
            >
              Contact
            </Text>
            {bioUserState?.isContact ? (
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={14}
                color={
                  pathname.includes('public')
                    ? '#0DFF19'
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
              if (pathname !== '/home/verification/profile/related') {
                router.push('/home/verification/profile/related')
              }
            }}
            className={`${
              pathname === '/home/verification/profile/related'
                ? 'border-b-custom'
                : 'border-b-border dark:border-b-dark-border'
            } py-1 px-4 border-b flex-row items-center`}
          >
            <Text
              className={`${
                pathname === '/home/verification/profile/related'
                  ? 'text-custom'
                  : 'text-primary dark:text-dark-primary'
              } text-xl text-center`}
            >
              Related
            </Text>
            {bioUserState?.isRelated ? (
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={14}
                color={
                  pathname.includes('public')
                    ? '#0DFF19'
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
              if (pathname !== '/home/verification/profile/document') {
                router.push('/home/verification/profile/document')
              }
            }}
            className={`${
              pathname === '/home/verification/profile/document'
                ? 'border-b-custom'
                : 'border-b-border dark:border-b-dark-border'
            } py-1 px-4 border-b flex-row items-center`}
          >
            <Text
              className={`${
                pathname === '/home/verification/profile/document'
                  ? 'text-custom'
                  : 'text-primary dark:text-dark-primary'
              } text-xl text-center`}
            >
              Document
            </Text>
            {bioUserState?.isDocument ? (
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={14}
                color={
                  pathname.includes('public')
                    ? '#0DFF19'
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
