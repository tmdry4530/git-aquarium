import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { AquariumEvent, EventFeedItem } from '@/types/webhook'
import { EVENT_ICONS } from '@/lib/webhook/event-mapper'

const MAX_EVENTS = 50

interface EventStore {
  events: AquariumEvent[]
  feedItems: EventFeedItem[]
  activeAnimations: AquariumEvent[]

  addEvent: (event: AquariumEvent) => void
  removeAnimation: (eventId: string) => void
  clearEvents: () => void
}

export const useEventStore = create<EventStore>()(
  immer((set) => ({
    events: [],
    feedItems: [],
    activeAnimations: [],

    addEvent: (event) =>
      set((state) => {
        state.events.unshift(event)
        if (state.events.length > MAX_EVENTS) {
          state.events = state.events.slice(0, MAX_EVENTS)
        }

        const feedItem: EventFeedItem = {
          id: event.id,
          icon: EVENT_ICONS[event.type] ?? '\uD83D\uDC1F',
          message: event.message,
          timestamp: event.timestamp,
          isNew: true,
        }
        state.feedItems.unshift(feedItem)
        if (state.feedItems.length > MAX_EVENTS) {
          state.feedItems = state.feedItems.slice(0, MAX_EVENTS)
        }

        if (state.activeAnimations.length < 5) {
          state.activeAnimations.push(event)
        }
      }),

    removeAnimation: (eventId) =>
      set((state) => {
        state.activeAnimations = state.activeAnimations.filter(
          (e) => e.id !== eventId,
        )
      }),

    clearEvents: () =>
      set((state) => {
        state.events = []
        state.feedItems = []
        state.activeAnimations = []
      }),
  })),
)
