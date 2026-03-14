import type { FishSpecies } from '@/types/fish'
import { LANGUAGE_TO_SPECIES, SPECIES_CONFIGS } from '@/constants/species-map'

export function getSpeciesForLanguage(language: string | null): FishSpecies {
  if (!language) return 'plankton'
  return (
    (LANGUAGE_TO_SPECIES as Record<string, FishSpecies>)[language] ?? 'plankton'
  )
}

export function getSpeciesColor(species: FishSpecies): string {
  return SPECIES_CONFIGS[species].color
}
