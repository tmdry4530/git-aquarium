export interface SoundConfig {
  masterVolume: number
  ambientVolume: number
  effectVolume: number
  isMuted: boolean
}

const DEFAULT_CONFIG: SoundConfig = {
  masterVolume: 0.5,
  ambientVolume: 0.3,
  effectVolume: 0.5,
  isMuted: false,
}

class SoundManager {
  private audioContext: AudioContext | null = null
  private isInitialized = false
  private config: SoundConfig = { ...DEFAULT_CONFIG }
  private noiseNode: AudioBufferSourceNode | null = null
  private masterGain: GainNode | null = null
  private ambientGain: GainNode | null = null
  private effectGain: GainNode | null = null
  private bubbleInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    this.loadConfig()
  }

  async init(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.audioContext = new AudioContext()
      this.masterGain = this.audioContext.createGain()
      this.ambientGain = this.audioContext.createGain()
      this.effectGain = this.audioContext.createGain()

      this.masterGain.connect(this.audioContext.destination)
      this.ambientGain.connect(this.masterGain)
      this.effectGain.connect(this.masterGain)

      this.applyVolumes()
      this.isInitialized = true
      this.startAmbience()
    } catch {
      // AudioContext not available - silently degrade
    }
  }

  private startAmbience(): void {
    if (!this.audioContext || !this.ambientGain) return

    // Brown noise for underwater ambience
    const bufferSize = this.audioContext.sampleRate * 4
    const buffer = this.audioContext.createBuffer(
      1,
      bufferSize,
      this.audioContext.sampleRate,
    )
    const data = buffer.getChannelData(0)

    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      const brown = (lastOut + 0.02 * white) / 1.02
      lastOut = brown
      data[i] = brown * 3.5
    }

    this.noiseNode = this.audioContext.createBufferSource()
    this.noiseNode.buffer = buffer
    this.noiseNode.loop = true

    // Low-pass filter for muffled underwater sound
    const filter = this.audioContext.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 200
    filter.Q.value = 1

    this.noiseNode.connect(filter)
    filter.connect(this.ambientGain)
    this.noiseNode.start()

    // Random bubble sounds
    this.bubbleInterval = setInterval(
      () => {
        this.playBubble()
      },
      2000 + Math.random() * 5000,
    )
  }

  private playBubble(): void {
    if (!this.audioContext || !this.effectGain || this.config.isMuted) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = 'sine'
    osc.frequency.value = 800 + Math.random() * 2000

    gain.gain.setValueAtTime(0, this.audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(
      0.08,
      this.audioContext.currentTime + 0.01,
    )
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.3,
    )

    osc.connect(gain)
    gain.connect(this.effectGain)

    osc.start(this.audioContext.currentTime)
    osc.stop(this.audioContext.currentTime + 0.3)
  }

  playEffect(type: 'hover' | 'click' | 'swim'): void {
    if (!this.audioContext || !this.effectGain || this.config.isMuted) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    const freqMap = { hover: 600, click: 400, swim: 300 }
    const durMap = { hover: 0.1, click: 0.15, swim: 0.2 }

    osc.type = 'sine'
    osc.frequency.value = freqMap[type]

    const dur = durMap[type]
    gain.gain.setValueAtTime(0, this.audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(
      0.05,
      this.audioContext.currentTime + 0.01,
    )
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + dur,
    )

    osc.connect(gain)
    gain.connect(this.effectGain)

    osc.start(this.audioContext.currentTime)
    osc.stop(this.audioContext.currentTime + dur)
  }

  private applyVolumes(): void {
    if (this.masterGain) {
      this.masterGain.gain.value = this.config.isMuted
        ? 0
        : this.config.masterVolume
    }
    if (this.ambientGain) {
      this.ambientGain.gain.value = this.config.ambientVolume
    }
    if (this.effectGain) {
      this.effectGain.gain.value = this.config.effectVolume
    }
  }

  setVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume))
    this.applyVolumes()
    this.saveConfig()
  }

  setAmbientVolume(volume: number): void {
    this.config.ambientVolume = Math.max(0, Math.min(1, volume))
    this.applyVolumes()
    this.saveConfig()
  }

  mute(): void {
    this.config.isMuted = true
    this.applyVolumes()
    this.saveConfig()
  }

  unmute(): void {
    this.config.isMuted = false
    this.applyVolumes()
    this.saveConfig()
  }

  toggleMute(): void {
    if (this.config.isMuted) {
      this.unmute()
    } else {
      this.mute()
    }
  }

  getConfig(): SoundConfig {
    return { ...this.config }
  }

  private loadConfig(): void {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem('aquarium-sound')
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<SoundConfig>
        this.config = { ...DEFAULT_CONFIG, ...parsed }
      }
    } catch {
      // Invalid stored config - use defaults
    }
  }

  private saveConfig(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('aquarium-sound', JSON.stringify(this.config))
    } catch {
      // Storage full - silently ignore
    }
  }

  dispose(): void {
    if (this.bubbleInterval) {
      clearInterval(this.bubbleInterval)
      this.bubbleInterval = null
    }
    if (this.noiseNode) {
      this.noiseNode.stop()
      this.noiseNode.disconnect()
      this.noiseNode = null
    }
    if (this.audioContext) {
      void this.audioContext.close()
      this.audioContext = null
    }
    this.isInitialized = false
  }
}

const soundManager = new SoundManager()

export { soundManager, SoundManager }
