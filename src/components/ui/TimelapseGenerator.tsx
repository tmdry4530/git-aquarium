'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TimelapseGeneratorProps {
  username: string
  year: number
  onGenerate: () => Promise<Blob | null>
}

export function TimelapseGenerator({
  username,
  year,
  onGenerate,
}: TimelapseGeneratorProps) {
  const [progress, setProgress] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    }
  }, [downloadUrl])

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    setProgress(0)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 5, 90))
    }, 500)

    const blob = await onGenerate()

    clearInterval(progressInterval)
    setProgress(100)

    if (blob) {
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
    }

    setGenerating(false)
  }, [onGenerate])

  return (
    <div className="rounded-xl bg-black/40 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Generate Timelapse - {username} ({year})
      </h3>

      {!generating && !downloadUrl && (
        <button
          onClick={handleGenerate}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Generate Timelapse
        </button>
      )}

      {generating && (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-white/60">{progress}% complete...</p>
        </div>
      )}

      {downloadUrl && (
        <div className="space-y-3">
          <p className="text-sm text-green-400">Timelapse ready!</p>
          <a
            href={downloadUrl}
            download={`${username}-aquarium-${year}.webm`}
            className="inline-block rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
          >
            Download WebM
          </a>
        </div>
      )}
    </div>
  )
}
