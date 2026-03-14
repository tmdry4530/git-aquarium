import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import { recordVisit, getRecentVisitors } from '@/lib/social/visit'
import { validateMessage } from '@/lib/social/guestbook'

const visitSchema = z.object({
  hostUsername: z.string().min(1).max(39),
  visitorFish: z.object({
    species: z.string() as z.ZodType<import('@/types/fish').FishSpecies>,
    size: z.number(),
    color: z.string(),
    evolutionStage: z.string() as z.ZodType<
      import('@/types/fish').EvolutionStage
    >,
    repoName: z.string(),
  }),
  message: z.string().max(200).optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    )
  }

  try {
    const body = await request.json()
    const parsed = visitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )
    }

    const { hostUsername, visitorFish, message } = parsed.data
    const sanitizedMessage = message ? validateMessage(message) : undefined

    const visit = await recordVisit(
      session.user.id,
      hostUsername,
      visitorFish,
      sanitizedMessage,
    )

    return NextResponse.json(visit, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error'
    const status = msg.includes('cooldown') ? 429 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const username = request.nextUrl.searchParams.get('username')
  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 })
  }

  try {
    const visitors = await getRecentVisitors(username)
    return NextResponse.json({ visitors })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch visitors' },
      { status: 500 },
    )
  }
}
