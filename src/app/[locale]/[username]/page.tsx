import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AquariumClient } from './aquarium-client'
import type { AquariumData } from '@/types/aquarium'

interface AquariumPageProps {
  params: Promise<{ locale: string; username: string }>
}

export async function generateMetadata({
  params,
}: AquariumPageProps): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username}'s Aquarium | Git Aquarium`,
    description: `Explore ${username}'s GitHub repositories as a living 3D aquarium`,
    openGraph: {
      images: [`/api/og/${username}`],
    },
  }
}

export default async function AquariumPage({ params }: AquariumPageProps) {
  const { username } = await params
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
  return <AquariumClient data={data} />
}
