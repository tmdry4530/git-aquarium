import { NextResponse } from 'next/server'
import { buildYearRecap } from '@/lib/timeline/recap'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string; year: string }> },
): Promise<NextResponse> {
  const { username, year: yearStr } = await params
  const year = parseInt(yearStr, 10)

  if (isNaN(year) || year < 2008 || year > new Date().getFullYear()) {
    return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
  }

  const recap = await buildYearRecap(username, year)
  if (!recap) {
    return NextResponse.json(
      { error: 'No data available for this year' },
      { status: 404 },
    )
  }

  return NextResponse.json(recap)
}
