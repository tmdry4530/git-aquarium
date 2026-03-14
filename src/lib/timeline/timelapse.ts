import { getSnapshots } from './snapshot'
import type { TimelapseConfig } from './types'
import type { TimelineSnapshot } from '@/types/webhook'

export async function getTimelapseSnapshots(
  config: TimelapseConfig,
): Promise<TimelineSnapshot[]> {
  return getSnapshots(config.username, config.startDate, config.endDate)
}

export function createTimelapseBlob(chunks: BlobPart[]): Blob {
  return new Blob(chunks, { type: 'video/webm' })
}

export function getDefaultTimelapseConfig(
  username: string,
  year: number,
): TimelapseConfig {
  return {
    username,
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
    fps: 30,
    frameDuration: 500,
    resolution: { width: 1920, height: 1080 },
  }
}
