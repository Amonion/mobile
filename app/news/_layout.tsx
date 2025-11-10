import React from 'react'
import { Slot } from 'expo-router'
import MinorAppBar from '@/components/Navigation/MinorAppBar'

export default function NewsLayout() {
  return (
    <>
      <MinorAppBar />

      <Slot />
    </>
  )
}
