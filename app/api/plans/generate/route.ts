import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateWeekPlan } from "@/lib/plan-generator"
import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const weekStartDate =
      body.weekStart ||
      (() => {
        const d = new Date()
        d.setDate(d.getDate() - d.getDay() + 1) // Monday
        return d.toISOString().split("T")[0]
      })()

    // Fetch user settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    })

    // Fetch recent training state
    const recentState = await prisma.trainingStateDaily.findFirst({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    })

    // Fetch recent feedback
    const recentFeedback = await prisma.feedback.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 7,
    })

    const trainingState = {
      ctl: recentState?.ctl ?? null,
      atl: recentState?.atl ?? null,
      tsb: recentState?.tsb ?? null,
      volume7d: recentState?.volume7d ?? null,
      volume14d: recentState?.volume14d ?? null,
      volume28d: recentState?.volume28d ?? null,
      lastLongRunDate:
        recentState?.lastLongRunDate?.toISOString().split("T")[0] ?? null,
      lastQualityDate:
        recentState?.lastQualityDate?.toISOString().split("T")[0] ?? null,
    }

    // Generate plan using AI
    const plan = await generateWeekPlan({
      weekStartDate,
      trainingState,
      userSettings: {
        raceDate: settings?.raceDate?.toISOString().split("T")[0] ?? null,
        raceType: settings?.raceType ?? "HALF",
        longRunDay: settings?.longRunDay ?? "SUNDAY",
        maxQualityDays: settings?.maxQualityDays ?? 2,
        maxSubThresholdDays: settings?.maxSubThresholdDays ?? 3,
        notes: settings?.notes ?? null,
      },
      recentFeedback: recentFeedback.map((f) => ({
        date: f.date.toISOString().split("T")[0],
        rpe: f.rpe,
        soreness: f.soreness,
        notes: f.notes,
      })),
    })

    // Save plan to database
    const savedPlan = await prisma.weekPlan.upsert({
      where: {
        userId_weekStartDate: {
          userId: session.user.id,
          weekStartDate: new Date(weekStartDate),
        },
      },
      update: {
        planJson: plan as unknown as Prisma.InputJsonValue,
      },
      create: {
        userId: session.user.id,
        weekStartDate: new Date(weekStartDate),
        planJson: plan as unknown as Prisma.InputJsonValue,
      },
    })

    // Also create individual PlannedWorkout entries
    for (const day of plan.days) {
      await prisma.plannedWorkout.upsert({
        where: {
          userId_date: {
            userId: session.user.id,
            date: new Date(day.date),
          },
        },
        update: {
          type: day.type,
          durationMinutes: day.durationMinutes,
          targets: day.targets as unknown as Prisma.InputJsonValue,
          rationale: day.rationale,
          alternates: (day.alternates ?? undefined) as unknown as
            | Prisma.InputJsonValue
            | undefined,
          source: "AI",
        },
        create: {
          userId: session.user.id,
          date: new Date(day.date),
          type: day.type,
          durationMinutes: day.durationMinutes,
          targets: day.targets as unknown as Prisma.InputJsonValue,
          rationale: day.rationale,
          alternates: (day.alternates ?? undefined) as unknown as
            | Prisma.InputJsonValue
            | undefined,
          source: "AI",
        },
      })
    }

    return NextResponse.json(
      { plan: savedPlan, message: "Plan generated successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Plan generation error:", error)
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 })
  }
}