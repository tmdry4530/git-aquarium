import { describe, it, expect } from 'vitest'
import { mapWebhookToAquariumEvent } from '@/lib/webhook/event-mapper'

const baseSender = {
  login: 'testuser',
  avatar_url: 'https://example.com/avatar.png',
}
const baseRepo = {
  name: 'my-repo',
  full_name: 'testuser/my-repo',
  language: 'TypeScript',
}

describe('mapWebhookToAquariumEvent', () => {
  it('should map push event to feed', () => {
    const payload = {
      ref: 'refs/heads/main',
      commits: [{ message: 'fix bug' }, { message: 'add feature' }],
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('push', payload)
    expect(event).not.toBeNull()
    expect(event?.type).toBe('feed')
    expect(event?.username).toBe('testuser')
    expect(event?.repoName).toBe('my-repo')
    expect(event?.metadata['commitCount']).toBe(2)
  })

  it('should map star (watch) created event to starlight', () => {
    const payload = {
      action: 'created',
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('watch', payload)
    expect(event).not.toBeNull()
    expect(event?.type).toBe('starlight')
  })

  it('should return null for star deleted event', () => {
    const payload = {
      action: 'deleted',
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('watch', payload)
    expect(event).toBeNull()
  })

  it('should map fork event to birth', () => {
    const payload = {
      forkee: { full_name: 'other/my-repo', owner: { login: 'other' } },
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('fork', payload)
    expect(event).not.toBeNull()
    expect(event?.type).toBe('birth')
  })

  it('should map issues opened to ripple', () => {
    const payload = {
      action: 'opened',
      issue: { number: 42, title: 'Bug report' },
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('issues', payload)
    expect(event).not.toBeNull()
    expect(event?.type).toBe('ripple')
  })

  it('should map issues closed to heal', () => {
    const payload = {
      action: 'closed',
      issue: { number: 42, title: 'Bug report' },
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('issues', payload)
    expect(event).not.toBeNull()
    expect(event?.type).toBe('heal')
  })

  it('should return null for issues labeled', () => {
    const payload = {
      action: 'labeled',
      issue: { number: 42, title: 'Bug report' },
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('issues', payload)
    expect(event).toBeNull()
  })

  it('should map pull_request merged to swim_together', () => {
    const payload = {
      action: 'closed',
      pull_request: { number: 10, title: 'Add feature', merged: true },
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('pull_request', payload)
    expect(event).not.toBeNull()
    expect(event?.type).toBe('swim_together')
  })

  it('should map pull_request closed (not merged) to flee', () => {
    const payload = {
      action: 'closed',
      pull_request: { number: 10, title: 'Bad PR', merged: false },
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('pull_request', payload)
    expect(event).not.toBeNull()
    expect(event?.type).toBe('flee')
  })

  it('should return null for pull_request opened', () => {
    const payload = {
      action: 'opened',
      pull_request: { number: 10, title: 'New PR', merged: false },
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('pull_request', payload)
    expect(event).toBeNull()
  })

  it('should map create (repository) to egg_spawn', () => {
    const payload = {
      ref_type: 'repository',
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('create', payload)
    expect(event).not.toBeNull()
    expect(event?.type).toBe('egg_spawn')
  })

  it('should return null for create (branch)', () => {
    const payload = {
      ref_type: 'branch',
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('create', payload)
    expect(event).toBeNull()
  })

  it('should map delete (repository) to dissolve', () => {
    const payload = {
      ref_type: 'repository',
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('delete', payload)
    expect(event).not.toBeNull()
    expect(event?.type).toBe('dissolve')
  })

  it('should return null for delete (tag)', () => {
    const payload = {
      ref_type: 'tag',
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('delete', payload)
    expect(event).toBeNull()
  })

  it('should map release published to level_up', () => {
    const payload = {
      action: 'published',
      release: { tag_name: 'v1.0.0', name: 'Release 1.0' },
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('release', payload)
    expect(event).not.toBeNull()
    expect(event?.type).toBe('level_up')
  })

  it('should return null for release edited', () => {
    const payload = {
      action: 'edited',
      release: { tag_name: 'v1.0.0', name: 'Release 1.0' },
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('release', payload)
    expect(event).toBeNull()
  })

  it('should return null for unknown event type', () => {
    const event = mapWebhookToAquariumEvent('unknown_event', {})
    expect(event).toBeNull()
  })

  it('should return null for invalid payload', () => {
    const event = mapWebhookToAquariumEvent('push', { invalid: true })
    expect(event).toBeNull()
  })

  it('should include correct message format', () => {
    const payload = {
      ref: 'refs/heads/main',
      commits: [{ message: 'commit 1' }],
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('push', payload)
    expect(event?.message).toContain('my-repo')
    expect(event?.message).toContain('1 commit')
  })

  it('should have a valid id for each event', () => {
    const payload = {
      action: 'created',
      repository: baseRepo,
      sender: baseSender,
    }
    const event = mapWebhookToAquariumEvent('watch', payload)
    expect(event?.id).toBeDefined()
    expect(event?.id.length).toBeGreaterThan(0)
  })
})
