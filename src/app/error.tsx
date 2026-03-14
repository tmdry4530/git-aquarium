'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error tracking service in production
    if (process.env['NODE_ENV'] === 'production') {
      console.error('Global error:', error)
    }
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#0a1628] text-white">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
          <p className="mb-6 text-gray-400">
            {error.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
