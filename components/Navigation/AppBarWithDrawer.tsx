import React, { useEffect, useState } from 'react'
import { usePathname } from 'expo-router'
import { AuthStore } from '@/store/AuthStore'
import { UserStore } from '@/store/user/User'
import MainAppBar from './MainAppBar'
import MinorAppBar from './MinorAppBar'
import SideDrawer from './SideDrawer'

const AppBarWithDrawer = () => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const { user } = AuthStore()
  const { getUser } = UserStore()
  const pathName = usePathname()

  useEffect(() => {
    if (user) {
      getUser(`/users/${user?.username}`)
    }
  }, [user?.username])

  useEffect(() => {
    setDrawerVisible(false)
  }, [pathName])

  return (
    <>
      {pathName === '/home' ? (
        <MainAppBar onMenuPress={() => setDrawerVisible(true)} />
      ) : (
        <MinorAppBar />
      )}

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </>
  )
}

export default AppBarWithDrawer
