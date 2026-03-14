import type { BadgeConfig } from '@/types/social'

const BADGE_STYLES = {
  flat: { height: 20, borderRadius: 3, fontSize: 11, padding: 6 },
  'flat-square': { height: 20, borderRadius: 0, fontSize: 11, padding: 6 },
  'for-the-badge': { height: 28, borderRadius: 4, fontSize: 10, padding: 9 },
  plastic: { height: 20, borderRadius: 4, fontSize: 11, padding: 6 },
} as const

function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return map[c] ?? c
  })
}

export function generateBadgeSVG(config: BadgeConfig): string {
  const style = BADGE_STYLES[config.style]
  const label = config.label || 'Git Aquarium'
  const value =
    config.fishCount !== undefined
      ? `${config.fishCount} fish | ${config.languageCount} languages`
      : config.username
  const color = config.color || '#0891b2'

  const labelWidth = label.length * 7 + style.padding * 2
  const valueWidth = value.length * 6.5 + style.padding * 2
  const totalWidth = labelWidth + valueWidth

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${style.height}" role="img" aria-label="${escapeXml(label)}: ${escapeXml(value)}">
  <title>${escapeXml(label)}: ${escapeXml(value)}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="${style.height}" rx="${style.borderRadius}" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="${style.height}" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${style.height}" fill="${escapeXml(color)}"/>
    <rect width="${totalWidth}" height="${style.height}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="${style.fontSize}">
    <text x="${labelWidth / 2}" y="${style.height / 2 + 4}" fill="#010101" fill-opacity=".3">${escapeXml(label)}</text>
    <text x="${labelWidth / 2}" y="${style.height / 2 + 3}">${escapeXml(label)}</text>
    <text x="${labelWidth + valueWidth / 2}" y="${style.height / 2 + 4}" fill="#010101" fill-opacity=".3">${escapeXml(value)}</text>
    <text x="${labelWidth + valueWidth / 2}" y="${style.height / 2 + 3}">${escapeXml(value)}</text>
  </g>
</svg>`
}
