import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0]

    // Find today's planned workout
    const plannedWorkout = await prisma.plannedWorkout.findFirst({
      where: {
        userId: session.user.id,
        date: new Date(date),
      },
    })

    // Get feedback for this day
    const feedback = await prisma.feedback.findFirst({
      where: {
        userId: session.user.id,
        date: new Date(date),
      },
    })

    // If no planned workout, try to find it from the week plan
    if (!plannedWorkout) {
      const weekPlan = await prisma.weekPlan.findFirst({
        where: {
          userId: session.user.id,
          weekStartDate: {
            lte: new Date(date),
          },
        },
        orderBy: { weekStartDate: "desc" },
      })

      if (weekPlan && typeof weekPlan.planJson === "object") {
        const plan = weekPlan.planJson as { days?: Array<{ date: string; type: string; durationMinutes: number; targets: unknown; rationale: string }> }
        const dayEntry = plan.days?.find((d) => d.date === date)

        if (dayEntry) {
          return NextResponse.json({
            id: `${date}-${session.user.id}`,
            date,
            plannedWorkout: {
              type: dayEntry.type,
              name: dayEntry.type,
              description: dayEntry.rationale || "",
              duration: dayEntry.durationMinutes,
              targets: dayEntry.targets,
            },
            feedback: feedback?.notes || null,
          })
        }
      }
    }

    return NextResponse.json({
      id: plannedWorkout?.id || `${date}-${session.user.id}`,
      date,
      plannedWorkout: plannedWorkout
        ? {
            type: plannedWorkout.type,
            name: plannedWorkout.type,
            description: plannedWorkout.rationale || "",
            duration: plannedWorkout.durationMinutes,
            targets: plannedWorkout.targets,
          }
        : null,
      feedback: feedback?.notes || null,
    })
  } catch (error) {
    console.error("Error fetching today workout:", error)
    return NextResponse.json(
      { error: "Failed to fetch workout" },
      { status: 500 }
    )
  }
}
