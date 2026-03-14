'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const MIN_USERS = 2
const MAX_USERS = 5

export function MergeInput() {
  const [usernames, setUsernames] = useState(['', ''])
  const router = useRouter()

  const addUser = () => {
    if (usernames.length < MAX_USERS) {
      setUsernames([...usernames, ''])
    }
  }

  const removeUser = (index: number) => {
    if (usernames.length > MIN_USERS) {
      setUsernames(usernames.filter((_, i) => i !== index))
    }
  }

  const updateUser = (index: number, value: string) => {
    const updated = [...usernames]
    updated[index] = value
    setUsernames(updated)
  }

  const handleMerge = () => {
    const validUsers = usernames.filter((u) => u.trim())
    if (validUsers.length >= MIN_USERS) {
      router.push(`/merge/${validUsers.join('+')}`)
    }
  }

  const validCount = usernames.filter((u) => u.trim()).length

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h2 className="text-center text-2xl font-bold text-white">Merge Ocean</h2>
      <p className="text-center text-sm text-gray-400">
        Combine 2-5 aquariums into one ocean
      </p>

      <div className="space-y-3">
        {usernames.map((username, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => updateUser(index, e.target.value)}
              placeholder={`Username ${index + 1}`}
              aria-label={`Username ${index + 1}`}
              className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
            {usernames.length > MIN_USERS && (
              <button
                onClick={() => removeUser(index)}
                aria-label={`Remove user ${index + 1}`}
                className="rounded-lg border border-white/20 p-2 text-gray-400 hover:text-red-400"
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>

      {usernames.length < MAX_USERS && (
        <button
          onClick={addUser}
          className="w-full rounded-lg border border-dashed border-white/20 py-2 text-sm text-gray-400 hover:border-cyan-500 hover:text-cyan-400"
        >
          + Add User
        </button>
      )}

      <button
        onClick={handleMerge}
        disabled={validCount < MIN_USERS}
        className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Merge {validCount} Aquariums
      </button>
    </div>
  )
}
