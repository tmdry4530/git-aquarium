'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  username: string
}

function ShareButtons({ username }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? 'https://gitaquarium.com')

  const shareUrl = `${appUrl}/en/${username}`
  const shareText = `Check out my GitHub aquarium! 🐠🌊 ${shareUrl}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const el = document.createElement('textarea')
      el.value = shareUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-30 flex items-center gap-2"
      role="group"
      aria-label="Share options"
    >
      {/* Copy link */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Link copied!' : 'Copy link'}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-[rgba(5,15,35,0.85)] text-primary text-xs font-mono hover:border-primary transition-colors"
      >
        {copied ? (
          <>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy link
          </>
        )}
      </button>

      {/* Twitter/X */}
      <button
        type="button"
        onClick={handleTwitter}
        aria-label="Share on Twitter"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-[rgba(5,15,35,0.85)] text-primary text-xs font-mono hover:border-primary transition-colors"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Twitter
      </button>
    </div>
  )
}

export { ShareButtons }
