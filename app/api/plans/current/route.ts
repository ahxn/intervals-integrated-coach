import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    // Find current or most recent plan
    const plan = await prisma.weekPlan.findFirst({
      where: {
        userId: session.user.id,
        weekStart: {
          lte: today,
        },
      },
      orderBy: {
        weekStart: 'desc',
      },
      include: {
        workouts: true,
      },
    })

    if (!plan) {
      return NextResponse.json({
        id: null,
        weekStart: weekStart.toISOString(),
        workouts: [],
      })
    }

    // Extract workout details from each day
    const workouts = plan.workouts.map((workout, index) => {
      const workoutDate = new Date(plan.weekStart)
      workoutDate.setDate(workoutDate.getDate() + index)

      return {
        date: workoutDate.toISOString(),
        ...(typeof workout.workoutDetails === 'object'
          ? workout.workoutDetails
          : JSON.parse(workout.workoutDetails || '{}')),
      }
    })

    return NextResponse.json({
      id: plan.id,
      weekStart: plan.weekStart.toISOString(),
      workouts,
    })
  } catch (error) {
    console.error('Error fetching current plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    )
  }
}
