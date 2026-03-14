'use client'

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-background focus:font-mono focus:text-sm focus:font-semibold"
    >
      Skip to content
    </a>
  )
}

export { SkipLink }
