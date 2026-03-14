import { NextRequest, NextResponse } from 'next/server'
import { getGuestbookEntries } from '@/lib/social/guestbook'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
): Promise<NextResponse> {
  const { username } = await params
  const page = Number(request.nextUrl.searchParams.get('page') ?? '1')

  try {
    const result = await getGuestbookEntries(username, page)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch guestbook' },
      { status: 500 },
    )
  }
}
