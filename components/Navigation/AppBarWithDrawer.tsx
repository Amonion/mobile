import React, { useEffect, useState } from 'react'
import { usePathname } from 'expo-router'
import MainAppBar from './MainAppBar'
import MinorAppBar from './MinorAppBar'
import SideDrawer from './SideDrawer'
import { View } from 'react-native'

const AppBarWithDrawer = () => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const pathName = usePathname()
  const mainPaths = ['/home', '/home/news', '/home/giveaway']

  useEffect(() => {
    setDrawerVisible(false)
  }, [pathName])

  return (
    <>
      {mainPaths.includes(pathName) ? (
        <MainAppBar onMenuPress={() => setDrawerVisible(true)} />
      ) : pathName === '/questions' ? (
        <View></View>
      ) : (
        !pathName.includes('/friends') && (
          <MinorAppBar onMenuPress={() => setDrawerVisible(true)} />
        )
      )}

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </>
  )
}

export default AppBarWithDrawer
