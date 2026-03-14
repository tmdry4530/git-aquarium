interface ShareRecordingConfig {
  format: 'story' | 'landscape' | 'square'
  duration: number
  fps: number
  quality: number
}

export const FORMAT_DIMENSIONS: Record<
  string,
  { width: number; height: number }
> = {
  story: { width: 1080, height: 1920 },
  landscape: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
}

export function createShareRecorder(
  canvas: HTMLCanvasElement,
  config: ShareRecordingConfig,
): {
  start: () => void
  stop: () => Promise<Blob>
} {
  const stream = canvas.captureStream(config.fps)
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 2500000,
  })
  const chunks: Blob[] = []

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  return {
    start: () => {
      chunks.length = 0
      recorder.start()
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop()
        }
      }, config.duration)
    },
    stop: () =>
      new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: 'video/webm' }))
        }
        if (recorder.state === 'recording') recorder.stop()
      }),
  }
}
