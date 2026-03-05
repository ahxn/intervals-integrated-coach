import { prisma } from '@/lib/prisma'
import { IntervalsClient } from '@/lib/intervals-client'
import { NextRequest, NextResponse } from 'next/server'

// This endpoint can be called by a cron service
export async function POST(request: NextRequest) {
  // Verify authorization header if using external cron
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all users with Intervals API keys
    const usersWithIntervals = await prisma.userSettings.findMany({
      where: {
        intervalsApiKey: {
          not: null,
        },
      },
      include: {
        user: true,
      },
    })

    const results = []

    for (const settings of usersWithIntervals) {
      if (!settings.intervalsApiKey || !settings.intervalsAthlete) {
        continue
      }

      try {
        const client = new IntervalsClient(
          settings.intervalsApiKey,
          settings.intervalsAthlete
        )

        // Fetch recent workouts from Intervals
        const workouts = await client.getRecentWorkouts(7)

        // Store or update workouts in database
        for (const workout of workouts) {
          await prisma.trainingStateDaily.upsert({
            where: {
              userId_date: {
                userId: settings.userId,
                date: new Date(workout.date),
              },
            },
            update: {
              intervalsData: workout,
            },
            create: {
              userId: settings.userId,
              date: new Date(workout.date),
              intervalsData: workout,
            },
          })
        }

        results.push({
          userId: settings.userId,
          status: 'success',
          workoutsImported: workouts.length,
        })
      } catch (error) {
        console.error(`Error syncing Intervals for user ${settings.userId}:`, error)
        results.push({
          userId: settings.userId,
          status: 'error',
          error: String(error),
        })
      }
    }

    return NextResponse.json({
      message: 'Intervals sync completed',
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Intervals sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: String(error) },
      { status: 500 }
    )
  }
}
