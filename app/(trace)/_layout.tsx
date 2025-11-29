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
// import React from 'react'
// import { View, Text, useColorScheme } from 'react-native'
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
// import { useSafeAreaInsets } from 'react-native-safe-area-context'
// import TraceHeader from '@/components/Trace/TraceHeader'

// const TopTabs = createMaterialTopTabNavigator()

// // Simple placeholder screens
// const PostsScreen = () => (
//   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//     <Text>Posts Screen</Text>
//   </View>
// )

// const AccountsScreen = () => (
//   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//     <Text>Accounts Screen</Text>
//   </View>
// )

// const PeopleScreen = () => (
//   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//     <Text>People Screen</Text>
//   </View>
// )

// const TabsLayout = () => {
//   const insets = useSafeAreaInsets()
//   const colorScheme = useColorScheme()
//   const isDark = colorScheme === 'dark'

//   return (
//     <>
//       <TraceHeader />

//       <View style={{ flex: 1, paddingTop: insets.top + 10 }}>
//         <TopTabs.Navigator
//           screenOptions={{
//             tabBarShowLabel: true,
//             tabBarIndicatorStyle: {
//               height: '100%',
//               borderRadius: 20,
//               backgroundColor: isDark ? '#2A2A2A' : '#E4E4E4',
//             },
//             tabBarStyle: {
//               borderRadius: 25,
//               marginHorizontal: 20,
//               marginBottom: 10,
//               elevation: 0,
//               shadowOpacity: 0,
//               backgroundColor: isDark ? '#1C1E21' : '#F5F5F5',
//             },
//             tabBarLabelStyle: {
//               fontSize: 14,
//               fontWeight: '600',
//               textTransform: 'none',
//             },
//             tabBarActiveTintColor: isDark ? '#FFFFFF' : '#000000',
//             tabBarInactiveTintColor: isDark ? '#888' : '#777',
//           }}
//         >
//           <TopTabs.Screen
//             name="posts"
//             component={PostsScreen}
//             options={{ title: 'Posts' }}
//           />
//           <TopTabs.Screen
//             name="accounts"
//             component={AccountsScreen}
//             options={{ title: 'Accounts' }}
//           />
//           <TopTabs.Screen
//             name="people"
//             component={PeopleScreen}
//             options={{ title: 'People' }}
//           />
//         </TopTabs.Navigator>
//       </View>
//     </>
//   )
// }

// export default TabsLayout
