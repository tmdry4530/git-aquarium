'use client'

import type { CompareData } from '@/types/social'
import { CompareHUD } from './CompareHUD'

interface CompareSceneProps {
  data: CompareData
}

export function CompareScene({ data }: CompareSceneProps) {
  const { users, stats } = data

  return (
    <div className="relative flex h-screen w-full bg-gradient-to-b from-blue-950 to-black">
      {/* Left aquarium */}
      <div className="relative w-1/2 border-r-2 border-cyan-500/30">
        <div className="absolute left-4 top-4 z-10 rounded-lg bg-black/50 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
          {users[0].user.username}
        </div>
        <div className="flex h-full flex-col items-center justify-center p-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-cyan-400">
              {users[0].stats.totalFish}
            </p>
            <p className="text-sm text-gray-400">Fish</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-white">
                {users[0].stats.totalStars.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Stars</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">
                {users[0].stats.aliveFish}
              </p>
              <p className="text-xs text-gray-500">Alive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Center VS badge */}
      <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 px-4 py-2 text-2xl font-black text-white shadow-lg shadow-cyan-500/50">
          VS
        </div>
      </div>

      {/* Right aquarium */}
      <div className="relative w-1/2">
        <div className="absolute right-4 top-4 z-10 rounded-lg bg-black/50 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
          {users[1].user.username}
        </div>
        <div className="flex h-full flex-col items-center justify-center p-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-orange-400">
              {users[1].stats.totalFish}
            </p>
            <p className="text-sm text-gray-400">Fish</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-white">
                {users[1].stats.totalStars.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Stars</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">
                {users[1].stats.aliveFish}
              </p>
              <p className="text-xs text-gray-500">Alive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom comparison HUD */}
      <CompareHUD
        stats={stats}
        usernames={[users[0].user.username, users[1].user.username]}
      />
    </div>
  )
}
