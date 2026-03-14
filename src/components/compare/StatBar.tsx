interface StatBarProps {
  label: string
  left: number
  right: number
  format?: 'percent' | 'number'
}

export function StatBar({
  label,
  left,
  right,
  format = 'number',
}: StatBarProps) {
  const total = left + right || 1
  const leftPct = (left / total) * 100
  const rightPct = (right / total) * 100
  const formatValue = (v: number) =>
    format === 'percent' ? `${(v * 100).toFixed(0)}%` : v.toLocaleString()

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-right text-sm text-white">
        {formatValue(left)}
      </span>
      <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-gray-700">
        <div
          className="bg-cyan-500 transition-all duration-500"
          style={{ width: `${leftPct}%` }}
        />
        <div
          className="bg-orange-500 transition-all duration-500"
          style={{ width: `${rightPct}%` }}
        />
      </div>
      <span className="w-16 text-sm text-white">{formatValue(right)}</span>
      <span className="w-20 text-xs text-gray-400">{label}</span>
    </div>
  )
}
