import { describe, it, expect } from 'vitest'
import {
  getUsernameEasterEgg,
  getRepoEasterEgg,
  detectSecretSpecies,
  createKonamiDetector,
  KONAMI_SEQUENCE,
} from '@/lib/aquarium/easter-eggs'

describe('Easter Eggs', () => {
  describe('getUsernameEasterEgg', () => {
    it('should return egg for known usernames', () => {
      const egg = getUsernameEasterEgg('torvalds')
      expect(egg).not.toBeNull()
      expect(egg?.type).toBe('leviathan_boss')
    })

    it('should return null for unknown usernames', () => {
      expect(getUsernameEasterEgg('random_user_123')).toBeNull()
    })
  })

  describe('getRepoEasterEgg', () => {
    it('should match awesome-* repos', () => {
      const egg = getRepoEasterEgg('awesome-typescript')
      expect(egg?.type).toBe('crown')
    })

    it('should match *-bot repos', () => {
      const egg = getRepoEasterEgg('deploy-bot')
      expect(egg?.type).toBe('robot')
    })

    it('should match dotfiles', () => {
      const egg = getRepoEasterEgg('dotfiles')
      expect(egg?.type).toBe('ghost')
    })

    it('should match hello-world', () => {
      const egg = getRepoEasterEgg('hello-world')
      expect(egg?.type).toBe('baby')
    })

    it('should return null for normal repos', () => {
      expect(getRepoEasterEgg('my-regular-project')).toBeNull()
    })
  })

  describe('detectSecretSpecies', () => {
    it('should detect ghost_fish for empty accounts', () => {
      expect(detectSecretSpecies(1, 0, 1, 0, 0, false)).toBe('ghost_fish')
    })

    it('should detect zombie_fish for reactivated fossils', () => {
      expect(detectSecretSpecies(5, 100, 2, 0, 0, true)).toBe('zombie_fish')
    })

    it('should detect pirate_fish for unlicensed repos', () => {
      expect(detectSecretSpecies(15, 100, 2, 12, 0, false)).toBe('pirate_fish')
    })

    it('should detect scholar_fish for long READMEs', () => {
      expect(detectSecretSpecies(5, 100, 2, 0, 6000, false)).toBe(
        'scholar_fish',
      )
    })

    it('should detect chameleon_fish for polyglot users', () => {
      expect(detectSecretSpecies(10, 100, 7, 0, 0, false)).toBe(
        'chameleon_fish',
      )
    })

    it('should return null when no conditions met', () => {
      expect(detectSecretSpecies(5, 100, 3, 2, 500, false)).toBeNull()
    })
  })

  describe('createKonamiDetector', () => {
    it('should activate on correct Konami sequence', () => {
      let activated = false
      const detector = createKonamiDetector(() => {
        activated = true
      })

      for (const key of KONAMI_SEQUENCE) {
        detector(key)
      }

      expect(activated).toBe(true)
    })

    it('should not activate on partial sequence', () => {
      let activated = false
      const detector = createKonamiDetector(() => {
        activated = true
      })

      detector('ArrowUp')
      detector('ArrowUp')
      detector('ArrowDown')
      // Wrong key
      detector('ArrowLeft')

      expect(activated).toBe(false)
    })

    it('should reset on wrong key and work again', () => {
      let activateCount = 0
      const detector = createKonamiDetector(() => {
        activateCount++
      })

      // Wrong sequence
      detector('ArrowUp')
      detector('KeyA')

      // Correct sequence
      for (const key of KONAMI_SEQUENCE) {
        detector(key)
      }

      expect(activateCount).toBe(1)
    })
  })
})
