import { prisma } from "@/lib/prisma"
import {
  fetchActivities,
  fetchWellness,
  computeTrainingState,
} from "@/lib/intervals-client"
import { NextRequest, NextResponse } from "next/server"

// This endpoint can be called by a cron service
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all users (in production, filter to those with Intervals configured)
    const users = await prisma.user.findMany({
      select: { id: true },
    })

    const results = []
    const now = new Date()
    const oldest = new Date(now)
    oldest.setDate(oldest.getDate() - 28)

    for (const user of users) {
      try {
        const activities = await fetchActivities(
          "i0",
          oldest.toISOString().split("T")[0],
          now.toISOString().split("T")[0]
        )
        const wellness = await fetchWellness(
          "i0",
          oldest.toISOString().split("T")[0],
          now.toISOString().split("T")[0]
        )

        const state = computeTrainingState(activities, wellness)

        await prisma.trainingStateDaily.upsert({
          where: {
            userId_date: {
              userId: user.id,
              date: new Date(now.toISOString().split("T")[0]),
            },
          },
          update: {
            ctl: state.ctl,
            atl: state.atl,
            tsb: state.tsb,
            volume7d: state.volume7d,
            volume14d: state.volume14d,
            volume28d: state.volume28d,
            lastLongRunDate: state.lastLongRunDate
              ? new Date(state.lastLongRunDate)
              : null,
            lastQualityDate: state.lastQualityDate
              ? new Date(state.lastQualityDate)
              : null,
          },
          create: {
            userId: user.id,
            date: new Date(now.toISOString().split("T")[0]),
            ctl: state.ctl,
            atl: state.atl,
            tsb: state.tsb,
            volume7d: state.volume7d,
            volume14d: state.volume14d,
            volume28d: state.volume28d,
            lastLongRunDate: state.lastLongRunDate
              ? new Date(state.lastLongRunDate)
              : null,
            lastQualityDate: state.lastQualityDate
              ? new Date(state.lastQualityDate)
              : null,
          },
        })

        results.push({ userId: user.id, status: "success" })
      } catch (error) {
        console.error(`Error syncing for user ${user.id}:`, error)
        results.push({ userId: user.id, status: "error", error: String(error) })
      }
    }

    return NextResponse.json({
      message: "Intervals sync completed",
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Intervals sync error:", error)
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    )
  }
}
