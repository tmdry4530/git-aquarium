import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { HistoryClient } from './history-client'
import { getSnapshots } from '@/lib/timeline/snapshot'

interface HistoryPageProps {
  params: Promise<{ locale: string; username: string }>
}

export async function generateMetadata({
  params,
}: HistoryPageProps): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username}'s Aquarium History | Git Aquarium`,
    description: `Travel through time and see how ${username}'s aquarium evolved`,
  }
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { username } = await params
  const now = new Date()
  const oneYearAgo = new Date(now)
  oneYearAgo.setFullYear(now.getFullYear() - 1)

  const snapshots = await getSnapshots(
    username,
    oneYearAgo.toISOString().split('T')[0] ?? '',
    now.toISOString().split('T')[0] ?? '',
  )

  if (!username) notFound()

  return <HistoryClient username={username} snapshots={snapshots} />
}
