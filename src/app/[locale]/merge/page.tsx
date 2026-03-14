import { MergeInput } from '@/components/merge/MergeInput'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Merge Ocean — Git Aquarium',
  description: 'Combine multiple aquariums into one ocean',
}

export default function MergeIndexPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-950 to-black p-4">
      <MergeInput />
    </div>
  )
}
