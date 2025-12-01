// import { Stack } from 'expo-router'
// import { useColorScheme, View } from 'react-native'
// import { useSafeAreaInsets } from 'react-native-safe-area-context'
// import OnlineBanner from '@/components/Response/OnlineBanner'
// import TopTabs from '@/components/Trace/TopTabs'
// import TraceHeader from '@/components/Trace/TraceHeader'

// export default function SearchTabsLayout() {
//   const isDark = useColorScheme() === 'dark'
//   const insets = useSafeAreaInsets()

//   return (
//     <>
//       <TraceHeader />
//       <TopTabs
//         tabs={[
//           { label: 'Posts', route: 'posts' },
//           { label: 'Accounts', route: 'accounts' },
//           { label: 'People', route: 'people' },
//         ]}
//       />

//       <Stack
//         screenOptions={{
//           headerShown: false,
//         }}
//       />

//       <View
//         style={{
//           position: 'absolute',
//           left: 0,
//           bottom: insets.bottom + 30,
//           width: '100%',
//         }}
//       >
//         <OnlineBanner />
//       </View>
//     </>
//   )
// }

import { Feather } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React, { ReactNode } from 'react'
import { useColorScheme, View, Image, Platform, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import OnlineBanner from '@/components/Response/OnlineBanner'
import TraceHeader from '@/components/Trace/TraceHeader'

type TabIconProps = {
  name: string
  color: string
  focused: boolean
}

const TabIcon = ({ name, focused }: TabIconProps) => {
  return (
    <View
      style={{ height: 30 }}
      className={`justify-center w-24 rounded-full items-center ${
        focused ? 'bg-custom' : 'bg-secondary dark:bg-dark-secondary'
      }`}
    >
      <Text
        className={`${
          focused ? 'text-white' : 'text-primary dark:text-dark-primary'
        }`}
      >
        {name}
      </Text>
    </View>
  )
}

const TabsLayout = () => {
  const colorScheme = useColorScheme()
  const insets = useSafeAreaInsets()
  const isDark = colorScheme === 'dark' ? true : false

  return (
    <>
      <TraceHeader />
      <Tabs
        screenOptions={{
          tabBarPosition: 'top',
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#DA3986',
          tabBarInactiveTintColor: isDark ? '#BABABA' : '#6E6E6E',
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: isDark ? '#1C1E21' : '#FFFFFF',
            borderBottomWidth: 1,
            borderColor: isDark ? '#404040' : '#D8D8D8',
            elevation: 0,
            shadowOpacity: 0,
            height: 50,
            paddingTop: 5,
          },
        }}
      >
        <Tabs.Screen
          name="posts"
          options={{
            title: 'Posts',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} name="Posts" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="accounts"
          options={{
            title: 'Accounts',
            lazy: false,
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View>
                <TabIcon color={color} name="Accounts" focused={focused} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="people"
          options={{
            title: 'People',
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({ color, focused }) => (
              <View>
                <TabIcon color={color} name="People" focused={focused} />
              </View>
            ),
          }}
        />
      </Tabs>
      <View
        style={{
          position: 'absolute',
          left: 0,
          bottom: insets.bottom + 45,
          width: '100%',
        }}
      >
        <OnlineBanner />
      </View>
    </>
  )
}

export default TabsLayout
