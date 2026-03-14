'use client'

import { useState, useRef } from 'react'

interface RecordButtonProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

function RecordButton({ canvasRef }: RecordButtonProps) {
  const [recording, setRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const DURATION_MS = 5000

  const handleRecord = async () => {
    const canvas = canvasRef.current
    if (!canvas || recording) return

    let stream: MediaStream
    try {
      stream = canvas.captureStream(30)
    } catch {
      console.error('captureStream not supported')
      return
    }

    const chunks: Blob[] = []
    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm',
    })
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `git-aquarium.webm`
      a.click()
      URL.revokeObjectURL(url)
      stream.getTracks().forEach((track) => track.stop())
      setRecording(false)
      setProgress(0)
    }

    setRecording(true)
    recorder.start()

    // Progress tracking
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min((elapsed / DURATION_MS) * 100, 100))
      if (elapsed >= DURATION_MS) {
        clearInterval(tick)
        recorder.stop()
      }
    }, 100)
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleRecord}
        disabled={recording}
        aria-label={
          recording ? 'Recording in progress' : 'Record 5-second WebM clip'
        }
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-danger/40 bg-[rgba(5,15,35,0.85)] text-danger text-xs font-mono hover:border-danger transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        <span
          className={`w-2 h-2 rounded-full ${recording ? 'bg-danger animate-pulse' : 'bg-danger/50'}`}
          aria-hidden="true"
        />
        {recording ? 'Recording...' : 'Record clip'}
      </button>

      {recording && (
        <div
          className="w-full h-1 bg-primary/10 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-danger transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

export { RecordButton }
