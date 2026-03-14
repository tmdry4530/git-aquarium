import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LiveClient } from './live-client'
import type { AquariumData } from '@/types/aquarium'

interface LivePageProps {
  params: Promise<{ locale: string; username: string }>
  searchParams: Promise<{ obs?: string; chroma?: string }>
}

export async function generateMetadata({
  params,
}: LivePageProps): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username}'s Live Aquarium | Git Aquarium`,
    description: `Live view of ${username}'s aquarium`,
  }
}

export default async function LivePage({
  params,
  searchParams,
}: LivePageProps) {
  const { username } = await params
  const query = await searchParams
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  let res: Response
  try {
    res = await fetch(`${appUrl}/api/aquarium/${username}`, {
      next: { revalidate: 1800 },
    })
  } catch {
    throw new Error('Failed to fetch aquarium data')
  }

  if (res.status === 404) notFound()
  if (!res.ok) throw new Error('Failed to fetch aquarium data')

  const data = (await res.json()) as AquariumData
  const obsMode = query.obs === 'true'
  const chromaKeyColor =
    query.chroma === 'green'
      ? '#00FF00'
      : query.chroma === 'blue'
        ? '#0000FF'
        : null

  return (
    <LiveClient
      data={data}
      username={username}
      obsMode={obsMode}
      chromaKeyColor={chromaKeyColor}
    />
  )
}
