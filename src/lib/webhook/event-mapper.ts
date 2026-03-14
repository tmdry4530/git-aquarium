import { randomUUID } from 'crypto'
import type { AquariumEvent, AquariumEventType } from '@/types/webhook'
import {
  pushEventSchema,
  starEventSchema,
  forkEventSchema,
  issuesEventSchema,
  pullRequestEventSchema,
  createEventSchema,
  deleteEventSchema,
  releaseEventSchema,
} from './types'

const EVENT_ICONS: Record<AquariumEventType, string> = {
  feed: '\uD83D\uDC1F',
  starlight: '\u2B50',
  birth: '\uD83E\uDD5A',
  ripple: '\uD83D\uDD34',
  heal: '\uD83D\uDC9A',
  swim_together: '\uD83E\uDD1D',
  flee: '\uD83D\uDCA8',
  egg_spawn: '\uD83C\uDD95',
  dissolve: '\uD83D\uDCAB',
  level_up: '\uD83C\uDF89',
}

export { EVENT_ICONS }

export function mapWebhookToAquariumEvent(
  githubEventType: string,
  payload: unknown,
): AquariumEvent | null {
  const baseId = randomUUID()
  const timestamp = new Date().toISOString()

  switch (githubEventType) {
    case 'push':
      return mapPushEvent(baseId, timestamp, payload)
    case 'watch':
      return mapStarEvent(baseId, timestamp, payload)
    case 'fork':
      return mapForkEvent(baseId, timestamp, payload)
    case 'issues':
      return mapIssuesEvent(baseId, timestamp, payload)
    case 'pull_request':
      return mapPullRequestEvent(baseId, timestamp, payload)
    case 'create':
      return mapCreateEvent(baseId, timestamp, payload)
    case 'delete':
      return mapDeleteEvent(baseId, timestamp, payload)
    case 'release':
      return mapReleaseEvent(baseId, timestamp, payload)
    default:
      return null
  }
}

function mapPushEvent(
  id: string,
  timestamp: string,
  payload: unknown,
): AquariumEvent | null {
  const parsed = pushEventSchema.safeParse(payload)
  if (!parsed.success) return null
  const { repository, sender, commits } = parsed.data
  return {
    id,
    type: 'feed',
    fishId: null,
    repoName: repository.name,
    username: sender.login,
    message: `${repository.name} received ${commits.length} commit(s)`,
    timestamp,
    metadata: { commitCount: commits.length, ref: parsed.data.ref },
  }
}

function mapStarEvent(
  id: string,
  timestamp: string,
  payload: unknown,
): AquariumEvent | null {
  const parsed = starEventSchema.safeParse(payload)
  if (!parsed.success) return null
  if (parsed.data.action !== 'created') return null
  const { repository, sender } = parsed.data
  return {
    id,
    type: 'starlight',
    fishId: null,
    repoName: repository.name,
    username: sender.login,
    message: `${repository.name} received a star`,
    timestamp,
    metadata: {},
  }
}

function mapForkEvent(
  id: string,
  timestamp: string,
  payload: unknown,
): AquariumEvent | null {
  const parsed = forkEventSchema.safeParse(payload)
  if (!parsed.success) return null
  const { repository, sender, forkee } = parsed.data
  return {
    id,
    type: 'birth',
    fishId: null,
    repoName: repository.name,
    username: sender.login,
    message: `${repository.name} was forked to ${forkee.full_name}`,
    timestamp,
    metadata: { forkFullName: forkee.full_name },
  }
}

function mapIssuesEvent(
  id: string,
  timestamp: string,
  payload: unknown,
): AquariumEvent | null {
  const parsed = issuesEventSchema.safeParse(payload)
  if (!parsed.success) return null
  const { action, issue, repository, sender } = parsed.data

  if (action === 'opened') {
    return {
      id,
      type: 'ripple',
      fishId: null,
      repoName: repository.name,
      username: sender.login,
      message: `Issue #${issue.number} opened: ${issue.title}`,
      timestamp,
      metadata: { issueNumber: issue.number },
    }
  }
  if (action === 'closed') {
    return {
      id,
      type: 'heal',
      fishId: null,
      repoName: repository.name,
      username: sender.login,
      message: `Issue #${issue.number} closed: ${issue.title}`,
      timestamp,
      metadata: { issueNumber: issue.number },
    }
  }
  return null
}

function mapPullRequestEvent(
  id: string,
  timestamp: string,
  payload: unknown,
): AquariumEvent | null {
  const parsed = pullRequestEventSchema.safeParse(payload)
  if (!parsed.success) return null
  const { action, pull_request, repository, sender } = parsed.data

  if (action === 'closed' && pull_request.merged) {
    return {
      id,
      type: 'swim_together',
      fishId: null,
      repoName: repository.name,
      username: sender.login,
      message: `PR #${pull_request.number} merged: ${pull_request.title}`,
      timestamp,
      metadata: { prNumber: pull_request.number },
    }
  }
  if (action === 'closed' && !pull_request.merged) {
    return {
      id,
      type: 'flee',
      fishId: null,
      repoName: repository.name,
      username: sender.login,
      message: `PR #${pull_request.number} closed: ${pull_request.title}`,
      timestamp,
      metadata: { prNumber: pull_request.number },
    }
  }
  return null
}

function mapCreateEvent(
  id: string,
  timestamp: string,
  payload: unknown,
): AquariumEvent | null {
  const parsed = createEventSchema.safeParse(payload)
  if (!parsed.success) return null
  if (parsed.data.ref_type !== 'repository') return null
  const { repository, sender } = parsed.data
  return {
    id,
    type: 'egg_spawn',
    fishId: null,
    repoName: repository.name,
    username: sender.login,
    message: `New repository created: ${repository.name}`,
    timestamp,
    metadata: {},
  }
}

function mapDeleteEvent(
  id: string,
  timestamp: string,
  payload: unknown,
): AquariumEvent | null {
  const parsed = deleteEventSchema.safeParse(payload)
  if (!parsed.success) return null
  if (parsed.data.ref_type !== 'repository') return null
  const { repository, sender } = parsed.data
  return {
    id,
    type: 'dissolve',
    fishId: null,
    repoName: repository.name,
    username: sender.login,
    message: `Repository deleted: ${repository.name}`,
    timestamp,
    metadata: {},
  }
}

function mapReleaseEvent(
  id: string,
  timestamp: string,
  payload: unknown,
): AquariumEvent | null {
  const parsed = releaseEventSchema.safeParse(payload)
  if (!parsed.success) return null
  if (parsed.data.action !== 'published') return null
  const { repository, sender, release } = parsed.data
  return {
    id,
    type: 'level_up',
    fishId: null,
    repoName: repository.name,
    username: sender.login,
    message: `Release ${release.tag_name} published for ${repository.name}`,
    timestamp,
    metadata: { tagName: release.tag_name },
  }
}
