import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import { createReport } from '@/lib/social/moderation'

const reportSchema = z.object({
  targetType: z.enum(['guestbook', 'username', 'message']),
  targetId: z.string().min(1),
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'other']),
  description: z.string().max(500).optional(),
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
    const parsed = reportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )
    }

    const { targetType, targetId, reason, description } = parsed.data
    const result = await createReport(
      session.user.id,
      targetType,
      targetId,
      reason,
      description,
    )

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
