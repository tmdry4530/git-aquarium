import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import {
  giveKudo,
  getKudosForFish,
  getRemainingKudos,
} from '@/lib/social/kudos'

const kudoSchema = z.object({
  receiverUsername: z.string().min(1).max(39),
  fishId: z.string().min(1),
  kudoType: z.enum(['star', 'bug', 'idea']),
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
    const parsed = kudoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )
    }

    const { receiverUsername, fishId, kudoType } = parsed.data
    const kudo = await giveKudo(
      session.user.id,
      receiverUsername,
      fishId,
      kudoType,
    )

    const remaining = await getRemainingKudos(session.user.id)

    return NextResponse.json({ kudo, remaining }, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error'
    const status = msg.includes('limit') || msg.includes('yourself') ? 400 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const username = request.nextUrl.searchParams.get('username')
  const fishId = request.nextUrl.searchParams.get('fishId')

  if (!username || !fishId) {
    return NextResponse.json(
      { error: 'Username and fishId required' },
      { status: 400 },
    )
  }

  try {
    const kudos = await getKudosForFish(username, fishId)
    return NextResponse.json(kudos)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch kudos' },
      { status: 500 },
    )
  }
}
