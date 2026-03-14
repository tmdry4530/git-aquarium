'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CompareInput() {
  const [u1, setU1] = useState('')
  const [u2, setU2] = useState('')
  const router = useRouter()

  const handleCompare = () => {
    if (u1.trim() && u2.trim()) {
      router.push(`/compare/${u1.trim()}/${u2.trim()}`)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h2 className="text-center text-2xl font-bold text-white">
        Compare Aquariums
      </h2>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={u1}
          onChange={(e) => setU1(e.target.value)}
          placeholder="Username 1"
          aria-label="First username to compare"
          className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
        />
        <span className="font-bold text-cyan-400">VS</span>
        <input
          type="text"
          value={u2}
          onChange={(e) => setU2(e.target.value)}
          placeholder="Username 2"
          aria-label="Second username to compare"
          className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
        />
      </div>
      <button
        onClick={handleCompare}
        disabled={!u1.trim() || !u2.trim()}
        className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Compare
      </button>
    </div>
  )
}
