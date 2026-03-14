import { create } from 'zustand'

type PanelView = 'hud' | 'fish-detail' | 'stats' | 'codex' | null

interface UIStore {
  activePanelView: PanelView
  isMenuOpen: boolean
  isMobile: boolean
  cameraMode: 'orbit' | 'free' | 'follow'
  tooltipVisible: boolean
  tooltipPosition: { x: number; y: number }
  detailPanelOpen: boolean
  settingsOpen: boolean
  showHUD: boolean
  reducedMotion: boolean
  colorBlindMode: boolean

  setActivePanelView: (view: PanelView) => void
  toggleMenu: () => void
  setIsMobile: (value: boolean) => void
  setCameraMode: (mode: 'orbit' | 'free' | 'follow') => void
  setTooltip: (visible: boolean, position?: { x: number; y: number }) => void
  toggleDetailPanel: (open?: boolean) => void
  toggleSettings: () => void
  setMobile: (isMobile: boolean) => void
  toggleReducedMotion: () => void
  toggleColorBlindMode: () => void
}

export const useUIStore = create<UIStore>()((set) => ({
  activePanelView: 'hud',
  isMenuOpen: false,
  isMobile: false,
  cameraMode: 'orbit',
  tooltipVisible: false,
  tooltipPosition: { x: 0, y: 0 },
  detailPanelOpen: false,
  settingsOpen: false,
  showHUD: true,
  reducedMotion: false,
  colorBlindMode: false,

  setActivePanelView: (view) => set({ activePanelView: view }),
  toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),
  setIsMobile: (value) => set({ isMobile: value }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setTooltip: (visible, position) =>
    set((s) => ({
      tooltipVisible: visible,
      tooltipPosition: position ?? s.tooltipPosition,
    })),
  toggleDetailPanel: (open) =>
    set((s) => ({
      detailPanelOpen: open !== undefined ? open : !s.detailPanelOpen,
    })),
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
  setMobile: (isMobile) => set({ isMobile }),
  toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
  toggleColorBlindMode: () =>
    set((s) => ({ colorBlindMode: !s.colorBlindMode })),
}))
