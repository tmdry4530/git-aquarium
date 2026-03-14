import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Visit, KudoType } from '@/types/social'

interface SocialStore {
  // Visit state
  visitors: Visit[]
  visitLoading: boolean

  // Kudos state
  activeKudoEffect: {
    fishId: string
    type: KudoType
    position: [number, number, number]
  } | null
  remainingKudos: number

  // Actions
  setVisitors: (visitors: Visit[]) => void
  setVisitLoading: (loading: boolean) => void
  triggerKudoEffect: (
    fishId: string,
    type: KudoType,
    position: [number, number, number],
  ) => void
  clearKudoEffect: () => void
  setRemainingKudos: (count: number) => void
  addKudo: () => void
  reset: () => void
}

export const useSocialStore = create<SocialStore>()(
  immer((set) => ({
    visitors: [],
    visitLoading: false,
    activeKudoEffect: null,
    remainingKudos: 10,

    setVisitors: (visitors) =>
      set((state) => {
        state.visitors = visitors
      }),

    setVisitLoading: (loading) =>
      set((state) => {
        state.visitLoading = loading
      }),

    triggerKudoEffect: (fishId, type, position) =>
      set((state) => {
        state.activeKudoEffect = { fishId, type, position }
      }),

    clearKudoEffect: () =>
      set((state) => {
        state.activeKudoEffect = null
      }),

    setRemainingKudos: (count) =>
      set((state) => {
        state.remainingKudos = count
      }),

    addKudo: () =>
      set((state) => {
        state.remainingKudos = Math.max(0, state.remainingKudos - 1)
      }),

    reset: () =>
      set((state) => {
        state.visitors = []
        state.visitLoading = false
        state.activeKudoEffect = null
        state.remainingKudos = 10
      }),
  })),
)
