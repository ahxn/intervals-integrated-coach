import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTrainingPlan } from '@/lib/plan-generator'
import { validatePlan } from '@/lib/plan-validator'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { weekStart, constraints } = await request.json()

    // Fetch user's training state and settings
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        settings: true,
        trainingState: {
          orderBy: { date: 'desc' },
          take: 7,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate plan using AI
    const plan = await generateTrainingPlan({
      weekStart,
      constraints,
      userSettings: user.settings,
      recentTrainingState: user.trainingState,
    })

    // Validate plan
    const validation = validatePlan(plan)
    if (!validation.isValid) {
      console.error('Plan validation failed:', validation.errors)
      return NextResponse.json(
        { error: 'Generated plan failed validation', details: validation.errors },
        { status: 400 }
      )
    }

    // Save plan to database
    const savedPlan = await prisma.weekPlan.create({
      data: {
        userId: session.user.id,
        weekStart: new Date(weekStart),
        planData: plan,
        workouts: {
          create: plan.workouts.map((workout: any) => ({
            plannedWorkoutId: null,
            workoutDetails: workout,
          })),
        },
      },
      include: { workouts: true },
    })

    return NextResponse.json(savedPlan, { status: 201 })
  } catch (error) {
    console.error('Plan generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate plan' },
      { status: 500 }
    )
  }
}
