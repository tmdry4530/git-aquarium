import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a1628] text-white">
      <h1 className="mb-2 text-6xl font-bold text-blue-400">404</h1>
      <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mb-8 text-gray-400">
        The aquarium you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium hover:bg-blue-700"
      >
        Return Home
      </Link>
    </div>
  )
}
