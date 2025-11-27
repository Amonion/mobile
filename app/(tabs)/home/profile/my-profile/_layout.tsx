import ProfileHeader from '@/components/Profile/ProfileHeader'
import ProfileTabs from '@/components/Profile/ProfileTabs'
import { AuthStore } from '@/store/AuthStore'
import { Slot, usePathname } from 'expo-router'
import { useState } from 'react'
import {
  View,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'

export default function UserLayout() {
  const { user } = AuthStore()
  const pathname = usePathname()
  const [sticky, setSticky] = useState(false)
  const [tabsY, setTabsY] = useState(0)

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y
    setSticky(offsetY >= tabsY)
  }

  return (
    <View className="flex-1">
      {sticky && user && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
          }}
        >
          <ProfileTabs userForm={user} pathname={pathname} />
        </View>
      )}

      {user && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          className="flex-1 bg-secondary dark:bg-dark-secondary"
        >
          <ProfileHeader userForm={user} setTabsY={setTabsY} />

          <Slot />
        </ScrollView>
      )}
    </View>
  )
}
