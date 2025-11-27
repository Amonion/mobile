import ProfileHeader from '@/components/Profile/ProfileHeader'
import ProfileTabs from '@/components/Profile/ProfileTabs'
import { AuthStore } from '@/store/AuthStore'
import { ChatStore } from '@/store/chat/Chat'
import SocialStore from '@/store/post/Social'
import { UserStore } from '@/store/user/User'
import { Slot, useLocalSearchParams, usePathname } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  View,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'

export default function UserLayout() {
  const { user } = AuthStore()
  const { setForm, userForm } = UserStore()
  const { followUser } = SocialStore()
  const { getSavedChats, setConnection } = ChatStore()
  const { username } = useLocalSearchParams()
  const pathname = usePathname()
  const [sticky, setSticky] = useState(false)
  const [tabsY, setTabsY] = useState(0)

  useEffect(() => {
    if (username && user) {
      const key = [String(username), String(user.username)].sort().join('')
      setConnection(key)
      getSavedChats(key)
    }
  }, [username, user])

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y
    setSticky(offsetY >= tabsY)
  }

  const followAccount = () => {
    setForm('followed', !userForm.followed)
    followUser(`/users/follow/${userForm._id}`, { followerId: user?._id })
  }

  return (
    <View className="flex-1">
      {sticky && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
          }}
        >
          <ProfileTabs userForm={userForm} pathname={pathname} />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        className="flex-1 bg-secondary dark:bg-dark-secondary"
      >
        <ProfileHeader
          userForm={userForm}
          setTabsY={setTabsY}
          followAccount={followAccount}
        />

        <Slot />
      </ScrollView>
    </View>
  )
}
