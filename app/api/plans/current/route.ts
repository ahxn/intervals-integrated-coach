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
    const today = new Date()

    // Find current or most recent plan
    const plan = await prisma.weekPlan.findFirst({
      where: {
        userId: session.user.id,
        weekStartDate: {
          lte: today,
        },
      },
      orderBy: {
        weekStartDate: "desc",
      },
    })

    if (!plan) {
      return NextResponse.json({
        id: null,
        weekStart: today.toISOString(),
        workouts: [],
      })
    }

    // Extract workouts from planJson
    const planData = plan.planJson as { days?: Array<{ date: string; type: string; durationMinutes: number; targets: unknown; rationale: string }> }
    const workouts = (planData.days || []).map((day) => ({
      date: day.date,
      type: day.type,
      name: day.type,
      description: day.rationale || "",
      duration: day.durationMinutes,
      targets: day.targets,
    }))

    return NextResponse.json({
      id: plan.id,
      weekStart: plan.weekStartDate.toISOString(),
      workouts,
    })
  } catch (error) {
    console.error("Error fetching current plan:", error)
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    )
  }
}
