import Link from 'next/link'
import type { LeaderboardData } from '@/types/social'

interface LeaderboardTableProps {
  data: LeaderboardData
}

export function LeaderboardTable({ data }: LeaderboardTableProps) {
  if (data.entries.length === 0) {
    return (
      <div className="rounded-xl bg-white/5 p-12 text-center">
        <p className="text-gray-400">No entries yet. Be the first!</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white/5">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 text-left text-sm text-gray-400">
            <th className="px-4 py-3 font-medium">Rank</th>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 text-right font-medium">Score</th>
          </tr>
        </thead>
        <tbody>
          {data.entries.map((entry) => (
            <tr
              key={`${entry.username}-${entry.rank}`}
              className="border-b border-white/5 transition-colors hover:bg-white/5"
            >
              <td className="px-4 py-3">
                <span
                  className={`font-mono text-sm ${
                    entry.rank <= 3
                      ? 'font-bold text-yellow-400'
                      : 'text-gray-400'
                  }`}
                >
                  #{entry.rank}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/${entry.username}`}
                  className="flex items-center gap-3 hover:text-cyan-400"
                >
                  {entry.avatarUrl && (
                    <img
                      src={entry.avatarUrl}
                      alt={entry.username}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="font-medium text-white">
                    {entry.username}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-mono text-cyan-400">
                  {entry.score.toLocaleString()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
