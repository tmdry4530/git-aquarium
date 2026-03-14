import { z } from 'zod'

export const webhookRepositorySchema = z.object({
  name: z.string(),
  full_name: z.string(),
  language: z.string().nullable().default(null),
})

export const webhookSenderSchema = z.object({
  login: z.string(),
  avatar_url: z.string(),
})

export const pushEventSchema = z.object({
  ref: z.string(),
  commits: z.array(z.object({ message: z.string() })).default([]),
  repository: webhookRepositorySchema,
  sender: webhookSenderSchema,
})

export const starEventSchema = z.object({
  action: z.enum(['created', 'deleted']),
  repository: webhookRepositorySchema,
  sender: webhookSenderSchema,
})

export const forkEventSchema = z.object({
  forkee: z.object({
    full_name: z.string(),
    owner: z.object({ login: z.string() }),
  }),
  repository: webhookRepositorySchema,
  sender: webhookSenderSchema,
})

export const issuesEventSchema = z.object({
  action: z.string(),
  issue: z.object({
    number: z.number(),
    title: z.string(),
  }),
  repository: webhookRepositorySchema,
  sender: webhookSenderSchema,
})

export const pullRequestEventSchema = z.object({
  action: z.string(),
  pull_request: z.object({
    number: z.number(),
    title: z.string(),
    merged: z.boolean().default(false),
  }),
  repository: webhookRepositorySchema,
  sender: webhookSenderSchema,
})

export const createEventSchema = z.object({
  ref_type: z.string(),
  repository: webhookRepositorySchema,
  sender: webhookSenderSchema,
})

export const deleteEventSchema = z.object({
  ref_type: z.string(),
  repository: webhookRepositorySchema,
  sender: webhookSenderSchema,
})

export const releaseEventSchema = z.object({
  action: z.string(),
  release: z.object({
    tag_name: z.string(),
    name: z.string().nullable(),
  }),
  repository: webhookRepositorySchema,
  sender: webhookSenderSchema,
})

export const SUPPORTED_EVENTS = [
  'push',
  'watch',
  'fork',
  'issues',
  'pull_request',
  'create',
  'delete',
  'release',
] as const

export type SupportedGitHubEvent = (typeof SUPPORTED_EVENTS)[number]
