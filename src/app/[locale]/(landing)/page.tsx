'use client'

import { useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { AquariumCarousel } from '@/components/ui/AquariumCarousel'
import { DiveTransition } from '@/components/ui/DiveTransition'

// GitHub username rules: alphanumeric + single hyphens, no leading/trailing hyphens
const USERNAME_RE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?!-))*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/

function validateUsername(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > 39) return 'Username too long (max 39 chars)'
  if (!USERNAME_RE.test(trimmed)) return 'Invalid GitHub username format'
  return null
}

export default function LandingPage() {
  const t = useTranslations('landing')
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'

  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [diving, setDiving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDive = async () => {
    const trimmed = username.trim()
    const validationError = validateUsername(trimmed)
    if (!trimmed) {
      inputRef.current?.focus()
      return
    }
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setDiving(true)
    await new Promise((r) => setTimeout(r, 600))
    router.push(`/${locale}/${trimmed}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleDive()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    if (error) setError(null)
  }

  return (
    <>
      <DiveTransition isVisible={diving} />

      <main
        className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 relative overflow-hidden"
        aria-label="Git Aquarium landing"
      >
        {/* Ambient glow circles */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(79,195,247,0.06) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Title */}
        <motion.div
          className="flex flex-col items-center gap-4 mb-10"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h1
            className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-primary text-center"
            style={{
              textShadow:
                '0 0 30px rgba(79,195,247,0.6), 0 0 60px rgba(79,195,247,0.3)',
            }}
          >
            {t('title')}
          </h1>
          <p className="text-foreground/70 text-sm sm:text-base md:text-lg text-center max-w-sm font-mono">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Input + DIVE */}
        <motion.div
          className="flex flex-col items-center gap-3 w-full max-w-xs sm:max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="relative w-full">
            {/* GitHub icon */}
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 select-none"
              aria-hidden="true"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={username}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={t('inputPlaceholder')}
              maxLength={39}
              autoComplete="off"
              spellCheck={false}
              aria-label="GitHub username"
              aria-describedby={error ? 'username-error' : undefined}
              aria-invalid={!!error}
              disabled={diving}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(5,15,35,0.85)] border border-primary/30 text-foreground font-mono text-sm placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>

          {error && (
            <p
              id="username-error"
              role="alert"
              className="text-danger text-xs font-mono w-full"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleDive}
            disabled={diving}
            aria-label="Dive into aquarium"
            className="w-full py-3 rounded-xl bg-primary text-background font-heading font-black text-sm sm:text-base tracking-widest uppercase hover:bg-primary/80 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: '0 0 20px rgba(79,195,247,0.3)',
            }}
          >
            {diving ? '...' : t('diveButton')}
          </button>
        </motion.div>

        {/* Recent aquariums carousel */}
        <motion.div
          className="flex flex-col items-center gap-3 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <p className="text-foreground/40 text-xs font-mono uppercase tracking-widest">
            {t('recentTitle')}
          </p>
          <AquariumCarousel />
        </motion.div>
      </main>
    </>
  )
}
