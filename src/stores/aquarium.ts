import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  AquariumData,
  AquariumLoadState,
  AquariumError,
} from '@/types/aquarium'
import type { FishData } from '@/types/fish'

interface AquariumStore {
  // State
  username: string | null
  data: AquariumData | null
  loadState: AquariumLoadState
  error: AquariumError | null
  selectedFishId: string | null
  hoveredFishId: string | null

  // Actions
  setUsername: (username: string) => void
  setData: (data: AquariumData) => void
  setLoadState: (state: AquariumLoadState) => void
  setError: (error: AquariumError | null) => void
  selectFish: (fishId: string | null) => void
  hoverFish: (fishId: string | null) => void
  getSelectedFish: () => FishData | null
  reset: () => void
}

export const useAquariumStore = create<AquariumStore>()(
  immer((set, get) => ({
    username: null,
    data: null,
    loadState: 'idle',
    error: null,
    selectedFishId: null,
    hoveredFishId: null,

    setUsername: (username) =>
      set((state) => {
        state.username = username
      }),

    setData: (data) =>
      set((state) => {
        state.data = data
        state.loadState = 'ready'
        state.error = null
      }),

    setLoadState: (loadState) =>
      set((state) => {
        state.loadState = loadState
      }),

    setError: (error) =>
      set((state) => {
        state.error = error
        state.loadState = 'error'
      }),

    selectFish: (fishId) =>
      set((state) => {
        state.selectedFishId = fishId
      }),

    hoverFish: (fishId) =>
      set((state) => {
        state.hoveredFishId = fishId
      }),

    getSelectedFish: () => {
      const { data, selectedFishId } = get()
      if (!data || !selectedFishId) return null
      return data.fish.find((f) => f.id === selectedFishId) ?? null
    },

    reset: () =>
      set((state) => {
        state.data = null
        state.loadState = 'idle'
        state.error = null
        state.selectedFishId = null
        state.hoveredFishId = null
      }),
  })),
)
