import { describe, it, expect } from 'vitest'
import { generateBadgeSVG } from '@/lib/social/badge'
import type { BadgeConfig } from '@/types/social'

describe('Badge SVG Generation', () => {
  it('should generate valid SVG', () => {
    const config: BadgeConfig = {
      username: 'testuser',
      style: 'flat',
      label: 'Git Aquarium',
      color: '#0891b2',
      fishCount: 10,
      languageCount: 5,
    }

    const svg = generateBadgeSVG(config)

    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('Git Aquarium')
    expect(svg).toContain('10 fish')
    expect(svg).toContain('5 languages')
  })

  it('should use username when no fishCount', () => {
    const config: BadgeConfig = {
      username: 'myuser',
      style: 'flat',
      label: 'Aquarium',
      color: '#0891b2',
    }

    const svg = generateBadgeSVG(config)

    expect(svg).toContain('myuser')
  })

  it('should escape XML characters', () => {
    const config: BadgeConfig = {
      username: 'test<user>',
      style: 'flat',
      label: 'My & Label',
      color: '#0891b2',
    }

    const svg = generateBadgeSVG(config)

    expect(svg).not.toContain('<user>')
    expect(svg).toContain('&amp;')
    expect(svg).toContain('&lt;')
  })

  it('should support different styles', () => {
    const baseConfig: BadgeConfig = {
      username: 'test',
      style: 'flat',
      label: 'Test',
      color: '#000',
    }

    const flat = generateBadgeSVG({ ...baseConfig, style: 'flat' })
    const forTheBadge = generateBadgeSVG({
      ...baseConfig,
      style: 'for-the-badge',
    })

    // for-the-badge has height 28 vs flat's 20
    expect(flat).toContain('height="20"')
    expect(forTheBadge).toContain('height="28"')
  })

  it('should use default color when not specified', () => {
    const config: BadgeConfig = {
      username: 'test',
      style: 'flat',
      label: '',
      color: '',
    }

    const svg = generateBadgeSVG(config)

    expect(svg).toContain('#0891b2')
  })

  it('should use default label when empty', () => {
    const config: BadgeConfig = {
      username: 'test',
      style: 'flat',
      label: '',
      color: '#000',
    }

    const svg = generateBadgeSVG(config)

    expect(svg).toContain('Git Aquarium')
  })
})
