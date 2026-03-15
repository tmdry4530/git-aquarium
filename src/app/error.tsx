'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#031528] text-white">
      <div className="text-center">
        <h2 className="mb-4 font-heading text-2xl font-bold text-primary">
          Something went wrong
        </h2>
        <p className="mb-6 font-mono text-sm text-gray-400">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="rounded-lg border border-primary/40 bg-primary/10 px-6 py-2 font-mono text-sm text-primary hover:bg-primary/20 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
