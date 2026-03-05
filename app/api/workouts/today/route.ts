import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Find today's training state or create it
    let dailyState = await prisma.trainingStateDaily.findFirst({
      where: {
        userId: session.user.id,
        date: new Date(date),
      },
      include: {
        plannedWorkout: true,
      },
    })

    if (!dailyState) {
      // Try to get from current week plan
      const weekStart = new Date(date)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())

      const weekPlan = await prisma.weekPlan.findFirst({
        where: {
          userId: session.user.id,
          weekStart: {
            lte: new Date(date),
          },
        },
        include: {
          workouts: true,
        },
      })

      if (weekPlan) {
        const dayIndex = new Date(date).getDay()
        const workout = weekPlan.workouts[dayIndex]

        if (workout) {
          dailyState = await prisma.trainingStateDaily.create({
            data: {
              userId: session.user.id,
              date: new Date(date),
              plannedWorkoutId: workout.id,
            },
            include: {
              plannedWorkout: true,
            },
          })
        }
      }
    }

    // Get feedback for this day
    const feedback = await prisma.feedback.findFirst({
      where: {
        userId: session.user.id,
        date: new Date(date),
      },
    })

    return NextResponse.json({
      id: dailyState?.id || `${date}-${session.user.id}`,
      date,
      plannedWorkout: dailyState?.plannedWorkout?.workoutDetails || null,
      feedback: feedback?.notes || null,
    })
  } catch (error) {
    console.error('Error fetching today workout:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workout' },
      { status: 500 }
    )
  }
}
