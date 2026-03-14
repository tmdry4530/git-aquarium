import { ImageResponse } from '@vercel/og'
import type { AquariumData } from '@/types/aquarium'

export const runtime = 'edge'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  let data: AquariumData | null = null
  try {
    const res = await fetch(`${appUrl}/api/aquarium/${username}`, {
      next: { revalidate: 1800 },
    })
    if (res.ok) {
      data = (await res.json()) as AquariumData
    }
  } catch {
    // Render fallback OG if fetch fails
  }

  const fishCount = data?.stats.aliveFish ?? 0
  const totalStars = data?.stats.totalStars ?? 0
  const topLanguage = data?.stats.topLanguage ?? ''

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        background:
          'linear-gradient(180deg, #031528 0%, #0a1f3d 60%, #031528 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '64px 80px',
        fontFamily: 'sans-serif',
        color: '#e2e8f0',
        position: 'relative',
      }}
    >
      {/* Glow accent */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '80px',
          transform: 'translateY(-50%)',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(79,195,247,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Site label */}
      <div
        style={{
          fontSize: '16px',
          color: '#4fc3f7',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          marginBottom: '24px',
          opacity: 0.7,
          display: 'flex',
        }}
      >
        GIT AQUARIUM
      </div>

      {/* Username */}
      <div
        style={{
          fontSize: '64px',
          fontWeight: 900,
          color: '#4fc3f7',
          lineHeight: 1.1,
          marginBottom: '16px',
          display: 'flex',
        }}
      >
        @{username}
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          gap: '40px',
          marginTop: '32px',
        }}
      >
        <StatBadge label="FISH" value={String(fishCount)} color="#4fc3f7" />
        <StatBadge
          label="STARS"
          value={
            totalStars >= 1000
              ? `${Math.round(totalStars / 1000)}k`
              : String(totalStars)
          }
          color="#ffd54f"
        />
        {topLanguage ? (
          <StatBadge label="TOP LANG" value={topLanguage} color="#80cbc4" />
        ) : null}
      </div>

      {/* Fish silhouettes decoration */}
      <div
        style={{
          position: 'absolute',
          bottom: '48px',
          right: '80px',
          fontSize: '48px',
          opacity: 0.15,
          display: 'flex',
          gap: '16px',
        }}
      >
        🐠 🐡 🦈
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}

function StatBadge({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        background: 'rgba(5,15,35,0.7)',
        border: `1px solid ${color}33`,
        borderRadius: '12px',
        padding: '16px 24px',
      }}
    >
      <span
        style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '2px' }}
      >
        {label}
      </span>
      <span style={{ fontSize: '32px', fontWeight: 700, color }}>{value}</span>
    </div>
  )
}
