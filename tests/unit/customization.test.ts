import { describe, it, expect } from 'vitest'
import {
  getBackgroundConfig,
  getAllBackgrounds,
  getUnlockedBackgrounds,
  isBackgroundUnlocked,
} from '@/lib/customization/backgrounds'
import {
  getLightingPreset,
  getAllLightingPresets,
} from '@/lib/customization/lighting'
import {
  DECORATION_CONFIGS,
  MAX_DECORATIONS,
  getAllDecorations,
  isDecorationUnlocked,
  validateDecorationSelection,
} from '@/lib/customization/decorations'
import {
  FRAME_CONFIGS,
  getFrameConfig,
  getAllFrames,
  isFrameUnlocked,
  getFrameCSSProperties,
} from '@/lib/customization/frames'
import {
  SUBSTRATE_CONFIGS,
  isSubstrateUnlocked,
  getUnlockedSubstrates,
} from '@/lib/customization/substrates'

describe('backgrounds', () => {
  it('should have 6 backgrounds', () => {
    expect(getAllBackgrounds()).toHaveLength(6)
  })

  it('should return default background for unknown id', () => {
    expect(getBackgroundConfig('nonexistent').id).toBe('tropical')
  })

  it('should unlock tropical by default', () => {
    expect(isBackgroundUnlocked('tropical', new Set())).toBe(true)
  })

  it('should not unlock deep_sea without achievement', () => {
    expect(isBackgroundUnlocked('deep_sea', new Set())).toBe(false)
  })

  it('should unlock deep_sea with deep_diver achievement', () => {
    expect(isBackgroundUnlocked('deep_sea', new Set(['deep_diver']))).toBe(true)
  })

  it('should return only unlocked backgrounds', () => {
    const unlocked = getUnlockedBackgrounds(new Set())
    expect(unlocked.every((bg) => bg.unlockMethod === 'default')).toBe(true)
  })
})

describe('lighting', () => {
  it('should have 6 lighting presets', () => {
    expect(getAllLightingPresets()).toHaveLength(6)
  })

  it('should return normal preset for unknown id', () => {
    expect(getLightingPreset('nonexistent').id).toBe('normal')
  })

  it('neon should have point lights', () => {
    const neon = getLightingPreset('neon')
    expect(neon.pointLights.length).toBeGreaterThan(0)
    expect(neon.bloomIntensity).toBeGreaterThan(0)
  })

  it('normal should have no point lights', () => {
    expect(getLightingPreset('normal').pointLights).toHaveLength(0)
  })
})

describe('decorations', () => {
  it('should have decorations defined', () => {
    expect(getAllDecorations().length).toBeGreaterThan(0)
  })

  it('should have max 5 decoration limit', () => {
    expect(MAX_DECORATIONS).toBe(5)
  })

  it('should unlock default decorations without achievements', () => {
    const defaults = getAllDecorations().filter(
      (d) => d.unlockMethod === 'default',
    )
    expect(defaults.length).toBeGreaterThan(0)
    for (const d of defaults) {
      expect(isDecorationUnlocked(d, new Set(), 0)).toBe(true)
    }
  })

  it('should not unlock achievement decorations without achievement', () => {
    const castle = DECORATION_CONFIGS.castle!
    expect(isDecorationUnlocked(castle, new Set(), 0)).toBe(false)
  })

  it('should unlock castle with star_collector achievement', () => {
    const castle = DECORATION_CONFIGS.castle!
    expect(isDecorationUnlocked(castle, new Set(['star_collector']), 0)).toBe(
      true,
    )
  })

  it('should unlock kudos decoration with enough kudos', () => {
    const chest = DECORATION_CONFIGS.treasure_chest!
    expect(isDecorationUnlocked(chest, new Set(), 49)).toBe(false)
    expect(isDecorationUnlocked(chest, new Set(), 50)).toBe(true)
  })

  describe('validateDecorationSelection', () => {
    it('should accept valid selection', () => {
      const result = validateDecorationSelection(['anchor', 'coral_formation'])
      expect(result.valid).toBe(true)
    })

    it('should reject more than MAX_DECORATIONS', () => {
      const ids = Array.from({ length: 6 }, () => 'anchor')
      const result = validateDecorationSelection(ids)
      expect(result.valid).toBe(false)
    })

    it('should reject duplicate decorations', () => {
      const result = validateDecorationSelection(['anchor', 'anchor'])
      expect(result.valid).toBe(false)
    })

    it('should reject unknown decorations', () => {
      const result = validateDecorationSelection(['nonexistent'])
      expect(result.valid).toBe(false)
    })
  })
})

describe('frames', () => {
  it('should have frames defined', () => {
    expect(getAllFrames().length).toBeGreaterThan(0)
  })

  it('should return none frame for unknown id', () => {
    expect(getFrameConfig('nonexistent').id).toBe('none')
  })

  it('should unlock default frames without achievements', () => {
    const defaults = getAllFrames().filter((f) => f.unlockMethod === 'default')
    for (const f of defaults) {
      expect(isFrameUnlocked(f, new Set(), 0)).toBe(true)
    }
  })

  it('should not unlock golden frame without achievement', () => {
    const golden = FRAME_CONFIGS.golden!
    expect(isFrameUnlocked(golden, new Set(), 0)).toBe(false)
  })

  it('should unlock golden frame with legendary_tamer', () => {
    const golden = FRAME_CONFIGS.golden!
    expect(isFrameUnlocked(golden, new Set(['legendary_tamer']), 0)).toBe(true)
  })

  it('should unlock crystal frame with 500 kudos', () => {
    const crystal = FRAME_CONFIGS.crystal!
    expect(isFrameUnlocked(crystal, new Set(), 499)).toBe(false)
    expect(isFrameUnlocked(crystal, new Set(), 500)).toBe(true)
  })

  describe('getFrameCSSProperties', () => {
    it('should return empty object for none frame', () => {
      const result = getFrameCSSProperties('none')
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should return CSS properties for wood frame', () => {
      const result = getFrameCSSProperties('wood')
      expect(result.borderStyle).toBe('solid')
      expect(result.borderWidth).toBe('8px')
    })
  })
})

describe('substrates', () => {
  it('should have 3 substrates', () => {
    expect(Object.keys(SUBSTRATE_CONFIGS)).toHaveLength(3)
  })

  it('should unlock sand by default', () => {
    expect(isSubstrateUnlocked('sand', new Set())).toBe(true)
  })

  it('should not unlock gravel without fossil_hunter', () => {
    expect(isSubstrateUnlocked('gravel', new Set())).toBe(false)
  })

  it('should unlock gravel with fossil_hunter', () => {
    expect(isSubstrateUnlocked('gravel', new Set(['fossil_hunter']))).toBe(true)
  })

  it('should not unlock volcanic without legendary_tamer', () => {
    expect(isSubstrateUnlocked('volcanic', new Set())).toBe(false)
  })

  it('should unlock volcanic with legendary_tamer', () => {
    expect(isSubstrateUnlocked('volcanic', new Set(['legendary_tamer']))).toBe(
      true,
    )
  })

  it('should return only sand when no achievements', () => {
    const unlocked = getUnlockedSubstrates(new Set())
    expect(unlocked).toHaveLength(1)
    expect(unlocked[0]!.type).toBe('sand')
  })

  it('should return all substrates with all achievements', () => {
    const unlocked = getUnlockedSubstrates(
      new Set(['fossil_hunter', 'legendary_tamer']),
    )
    expect(unlocked).toHaveLength(3)
  })
})
