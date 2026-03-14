import type { FishSpecies } from '@/types/fish'

export interface EasterEgg {
  type: string
  effect: string
}

export interface SecretSpeciesCondition {
  id: string
  nameEn: string
  nameKo: string
  condition: string
  effect: string
}

export const USERNAME_EASTER_EGGS: Record<string, EasterEgg> = {
  torvalds: {
    type: 'leviathan_boss',
    effect: 'Giant Leviathan boss appearance',
  },
  gaearon: {
    type: 'react_phoenix',
    effect: 'Phoenix Fish with React logo particles',
  },
  sindresorhus: {
    type: 'npm_school',
    effect: 'Hundreds of tiny schooling fish',
  },
  DHH: { type: 'ruby_elder', effect: 'Giant goldfish elder' },
  maboroshi: {
    type: 'ghost_fish',
    effect: 'Ghost fish with transparent blinking',
  },
} as const

export const REPO_EASTER_EGGS: Array<{ pattern: RegExp; egg: EasterEgg }> = [
  { pattern: /^awesome-/i, egg: { type: 'crown', effect: 'Crown decoration' } },
  { pattern: /^dotfiles$/i, egg: { type: 'ghost', effect: 'Ghost effect' } },
  { pattern: /-bot$/i, egg: { type: 'robot', effect: 'Robot fish' } },
  {
    pattern: /^todo/i,
    egg: { type: 'checklist', effect: 'Checklist bubbles' },
  },
  {
    pattern: /^\.github$/i,
    egg: { type: 'octocat', effect: 'Octocat silhouette' },
  },
  {
    pattern: /^hello-world$/i,
    egg: { type: 'baby', effect: 'Baby fish special effect' },
  },
] as const

export const SECRET_SPECIES: SecretSpeciesCondition[] = [
  {
    id: 'ghost_fish',
    nameEn: 'Ghost Fish',
    nameKo: '유령 물고기',
    condition: '1 repo with 0 commits — inactive account',
    effect: 'Fully transparent (opacity 0.15), blinking outline only',
  },
  {
    id: 'zombie_fish',
    nameEn: 'Zombie Fish',
    nameKo: '좀비 물고기',
    condition: 'Fossil repo that received new commits — reactivated repo',
    effect: 'Half gray fossil / half normal color, staggering swim',
  },
  {
    id: 'pirate_fish',
    nameEn: 'Pirate Fish',
    nameKo: '해적 물고기',
    condition: '10+ repos without license',
    effect: 'Pirate flag decoration, black eyepatch, irregular navigation',
  },
  {
    id: 'scholar_fish',
    nameEn: 'Scholar Fish',
    nameKo: '학자 물고기',
    condition: 'Repo with 5,000+ character README',
    effect: 'Glasses decoration, floating book particles, slow swim',
  },
  {
    id: 'chameleon_fish',
    nameEn: 'Chameleon Fish',
    nameKo: '카멜레온 물고기',
    condition: '5+ languages in repos',
    effect: 'Color cycling every 2s (language colors), mixed color trail',
  },
] as const

export const DATE_EASTER_EGGS: Record<
  string,
  { effect: string; description: string }
> = {
  '04-01': {
    effect: 'upside_down',
    description: 'Aquarium flipped upside down',
  },
  '10-31': { effect: 'skeleton', description: 'Skeleton fish' },
  '12-25': { effect: 'santa_hat', description: 'Santa hats on all fish' },
  '01-01': { effect: 'fireworks', description: 'Firework particles' },
  '02-14': { effect: 'hearts', description: 'Heart-shaped bubbles' },
} as const

export function getDateEasterEgg(): {
  effect: string
  description: string
} | null {
  const now = new Date()
  const key = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return DATE_EASTER_EGGS[key] ?? null
}

export function getUsernameEasterEgg(username: string): EasterEgg | null {
  return USERNAME_EASTER_EGGS[username] ?? null
}

export function getRepoEasterEgg(repoName: string): EasterEgg | null {
  for (const { pattern, egg } of REPO_EASTER_EGGS) {
    if (pattern.test(repoName)) return egg
  }
  return null
}

export function detectSecretSpecies(
  repoCount: number,
  totalCommits: number,
  languageCount: number,
  unlicensedRepoCount: number,
  maxReadmeLength: number,
  hasFossilReactivated: boolean,
): string | null {
  if (repoCount <= 1 && totalCommits === 0) return 'ghost_fish'
  if (hasFossilReactivated) return 'zombie_fish'
  if (unlicensedRepoCount >= 10) return 'pirate_fish'
  if (maxReadmeLength >= 5000) return 'scholar_fish'
  if (languageCount >= 5) return 'chameleon_fish'
  return null
}

// Konami code sequence
export const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
] as const

export function createKonamiDetector(
  onActivate: () => void,
): (code: string) => void {
  let position = 0
  return (code: string) => {
    if (code === KONAMI_SEQUENCE[position]) {
      position++
      if (position === KONAMI_SEQUENCE.length) {
        position = 0
        onActivate()
      }
    } else {
      position = 0
    }
  }
}

// Check special fish species based on easter egg conditions
export function getEasterEggSpeciesOverride(
  username: string,
  _fish: { repoName: string; species: FishSpecies },
): FishSpecies | null {
  const userEgg = getUsernameEasterEgg(username)
  if (userEgg?.type === 'npm_school') return 'plankton'
  if (userEgg?.type === 'ruby_elder') return 'goldfish'

  const repoEgg = getRepoEasterEgg(_fish.repoName)
  if (repoEgg?.type === 'robot') return 'squid'

  return null
}
