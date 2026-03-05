import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 30,
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { date, rating, notes } = await request.json()

    if (!date || !rating || !notes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if feedback already exists for this date
    const existing = await prisma.feedback.findFirst({
      where: {
        userId: session.user.id,
        date: new Date(date),
      },
    })

    if (existing) {
      const updated = await prisma.feedback.update({
        where: { id: existing.id },
        data: { rating, notes },
      })
      return NextResponse.json(updated)
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        rating,
        notes,
      },
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    )
  }
}
