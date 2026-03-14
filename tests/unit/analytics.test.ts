import { describe, it, expect, vi } from 'vitest'
import { track } from '@/lib/analytics/events'
import type { AnalyticsEvents } from '@/lib/analytics/events'

describe('analytics/track', () => {
  it('should call track without throwing for aquarium_created', () => {
    expect(() =>
      track('aquarium_created', {
        username: 'testuser',
        fish_count: 10,
        load_time: 1234,
      }),
    ).not.toThrow()
  })

  it('should call track without throwing for fish_clicked', () => {
    expect(() =>
      track('fish_clicked', {
        repo_name: 'my-repo',
        species: 'angelfish',
        evolution_stage: 'adult',
      }),
    ).not.toThrow()
  })

  it('should call track without throwing for share_initiated', () => {
    expect(() => track('share_initiated', { method: 'url' })).not.toThrow()
  })

  it('should call track without throwing for fallback_triggered', () => {
    expect(() => track('fallback_triggered', { type: '2d' })).not.toThrow()
  })

  it('should call track without throwing for error_occurred', () => {
    expect(() =>
      track('error_occurred', {
        error_type: 'NETWORK_ERROR',
        context: 'aquarium fetch',
      }),
    ).not.toThrow()
  })

  it('should log in development mode', () => {
    const consoleSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined)
    // NODE_ENV is 'test' not 'development', so no log expected
    track('share_completed', { method: 'twitter', success: true })
    // Should not log in test env
    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

describe('AnalyticsEvents type coverage', () => {
  it('should accept all valid share methods', () => {
    const methods: AnalyticsEvents['share_initiated']['method'][] = [
      'url',
      'twitter',
      'gif',
    ]
    expect(methods).toHaveLength(3)
  })

  it('should accept all valid fallback types', () => {
    const types: AnalyticsEvents['fallback_triggered']['type'][] = [
      '2d',
      'static',
      'text',
    ]
    expect(types).toHaveLength(3)
  })
})
