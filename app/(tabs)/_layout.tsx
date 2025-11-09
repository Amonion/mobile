import { Feather } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React, { ReactNode } from 'react'
import { useColorScheme, View, Image, Platform } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import AppBarWithDrawer from '@/components/Navigation/AppBarWithDrawer'
import OnlineBanner from '@/components/Response/OnlineBanner'
import { ScrollYProvider } from '@/context/ScrollYContext'

type TabIconProps = {
  icon: ReactNode
  name: string
  color: string
  focused: boolean
}

const TabIcon = ({ icon, name, color, focused }: TabIconProps) => {
  return (
    <View className="items-center justify-center ">
      <View>{icon}</View>
    </View>
  )
}

const TabsLayout = () => {
  const colorScheme = useColorScheme()
  const insets = useSafeAreaInsets()
  const isDark = colorScheme === 'dark' ? true : false

  return (
    <>
      <ScrollYProvider>
        <AppBarWithDrawer />
        <SafeAreaView
          className={`bg-primary dark:bg-dark-primary flex-1 relative`}
        >
          <Tabs
            screenOptions={{
              tabBarShowLabel: false,
              tabBarActiveTintColor: '#DA3986',
              tabBarInactiveTintColor: isDark ? '#BABABA' : '#6E6E6E',
              tabBarHideOnKeyboard: true,
              tabBarStyle: {
                backgroundColor: isDark ? '#1C1E21' : '#FFFFFF',
                borderTopWidth: 1,
                borderColor: isDark ? '#404040' : '#D8D8D8',
                elevation: 0,
                shadowOpacity: 0,
                height: 50,
                paddingTop: 5,
                marginBottom: Platform.OS === 'ios' ? 0 : insets.bottom,
              },
            }}
          >
            <Tabs.Screen
              name="home"
              options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon
                    color={color}
                    icon={<Feather name="home" size={28} color={color} />}
                    name="Home"
                    focused={focused}
                  />
                ),
              }}
            />

            <Tabs.Screen
              name="question"
              options={{
                title: 'Question',
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                  <Image
                    source={
                      focused
                        ? require('@/assets/images/active-icon.png')
                        : isDark
                        ? require('@/assets/images/dark-icon.png')
                        : require('@/assets/images/light-icon.png')
                    }
                    style={{
                      height: 30,
                      width: 30,
                      resizeMode: 'contain',
                    }}
                  />
                ),
              }}
            />

            <Tabs.Screen
              name="friends"
              options={{
                title: 'Friends',
                headerShown: false,
                tabBarShowLabel: false,
                tabBarIcon: ({ color, focused }) => (
                  <View>
                    <TabIcon
                      color={color}
                      icon={<Feather name="users" size={28} color={color} />}
                      name="Friends"
                      focused={focused}
                    />
                    {/* {unread > 0 && (
                      <View className="absolute w-5 h-5 items-center justify-center top-[-7px] right-[-10px] rounded-full bg-custom">
                        <Text className="text-white">
                          {unread > 9 ? '9+' : unread}
                        </Text>
                      </View>
                    )} */}
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
        </SafeAreaView>
      </ScrollYProvider>
    </>
  )
}

export default TabsLayout
