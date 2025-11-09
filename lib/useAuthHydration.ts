import { useEffect, useState } from 'react'
import { AuthStore } from '@/store/AuthStore'

export function useAuthHydration() {
  const [hydrated, setHydrated] = useState(AuthStore.persist.hasHydrated())

  useEffect(() => {
    const unsub = AuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    return () => unsub?.()
  }, [])

  return hydrated
}
