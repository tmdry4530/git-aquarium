'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSocialStore } from '@/stores/social'
import type { KudoType } from '@/types/social'

interface KudoButtonProps {
  receiverUsername: string
  fishId: string
  position: [number, number, number]
}

const KUDO_OPTIONS: { type: KudoType; emoji: string; label: string }[] = [
  { type: 'star', emoji: '\u2B50', label: 'Star' },
  { type: 'bug', emoji: '\uD83D\uDC1B', label: 'Bug' },
  { type: 'idea', emoji: '\uD83D\uDCA1', label: 'Idea' },
]

export function KudoButton({
  receiverUsername,
  fishId,
  position,
}: KudoButtonProps) {
  const { data: session } = useSession()
  const [showOptions, setShowOptions] = useState(false)
  const [sending, setSending] = useState(false)
  const { triggerKudoEffect, addKudo, remainingKudos } = useSocialStore()

  if (!session?.user) return null

  const handleKudo = async (kudoType: KudoType) => {
    setSending(true)
    try {
      const res = await fetch('/api/kudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverUsername, fishId, kudoType }),
      })

      if (res.ok) {
        addKudo()
        triggerKudoEffect(fishId, kudoType, position)
      }
    } finally {
      setSending(false)
      setShowOptions(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={sending || remainingKudos <= 0}
        className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-50"
      >
        Feed Fish ({remainingKudos})
      </button>

      {showOptions && (
        <div className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-lg bg-black/80 p-2 backdrop-blur-sm">
          {KUDO_OPTIONS.map(({ type, emoji, label }) => (
            <button
              key={type}
              onClick={() => handleKudo(type)}
              disabled={sending}
              className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-white/10"
              title={label}
              aria-label={label}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
