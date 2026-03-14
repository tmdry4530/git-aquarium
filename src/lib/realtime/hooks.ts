'use client'

import { useEffect } from 'react'
import { useEventStore } from '@/stores/events'
import { subscribeToAquariumEvents } from './channel'

export function useAquariumEvents(username: string): void {
  const addEvent = useEventStore((s) => s.addEvent)

  useEffect(() => {
    const unsubscribe = subscribeToAquariumEvents(username, addEvent)
    return () => {
      unsubscribe?.()
    }
  }, [username, addEvent])
}
