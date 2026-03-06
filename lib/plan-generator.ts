import { generateText, Output } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import type { DayPlan, TrainingState, WeekPlanSchema } from "@/types"
import { validateWeekPlan, getFallbackPlan } from "@/lib/plan-validator"

const dayPlanSchema = z.object({
  date: z.string(),
  type: z.enum(["EASY", "SUB_THRESHOLD", "LONG", "REST", "OTHER"]),
  durationMinutes: z.number(),
  targets: z.object({
    primary: z.string(),
    secondary: z.string().nullable(),
    notes: z.array(z.string()).nullable(),
  }),
  rationale: z.string(),
  alternates: z
    .array(
      z.object({
        label: z.string(),
        type: z.string(),
        durationMinutes: z.number(),
        targets: z.object({
          primary: z.string(),
          secondary: z.string().nullable(),
          notes: z.array(z.string()).nullable(),
        }),
      })
    )
    .nullable(),
})

const weekPlanOutputSchema = z.object({
  weekStartDate: z.string(),
  days: z.array(dayPlanSchema),
})

interface GeneratePlanInput {
  weekStartDate: string
  trainingState: TrainingState
  userSettings: {
    raceDate: string | null
    raceType: string
    longRunDay: string
    maxQualityDays: number
    maxSubThresholdDays: number
    notes: string | null
  }
  recentFeedback: Array<{
    date: string
    rpe: number
    soreness: string
    notes: string | null
  }>
}

function buildSystemPrompt(input: GeneratePlanInput): string {
  const weeksToRace = input.userSettings.raceDate
    ? Math.ceil(
        (new Date(input.userSettings.raceDate).getTime() - Date.now()) /
          (7 * 86400000)
      )
    : null

  return `You are an expert running coach specializing in distance running. You follow a "Norwegian-style" training approach: mostly easy aerobic running with 2-3 sub-threshold sessions per week, minimal VO2max emphasis.

Generate a 7-day training plan as strict JSON. Follow these constraints EXACTLY:
- Maximum quality days (SUB_THRESHOLD + LONG combined): ${input.userSettings.maxQualityDays}
- Maximum sub-threshold days: ${input.userSettings.maxSubThresholdDays}
- NO back-to-back quality days (at least 1 easy/rest day between quality sessions)
- Long run should be on ${input.userSettings.longRunDay}
- Include at least 1 rest or easy day
- All durations in minutes (15-240 range for non-rest days, 0 for REST)
- Workout types: EASY, SUB_THRESHOLD, LONG, REST, OTHER

Athlete context:
- Race: ${input.userSettings.raceType} ${weeksToRace ? `in ${weeksToRace} weeks` : "(no race date set)"}
- CTL (fitness): ${input.trainingState.ctl ?? "unknown"}
- ATL (fatigue): ${input.trainingState.atl ?? "unknown"}
- TSB (form): ${input.trainingState.tsb ?? "unknown"}
- 7-day volume: ${input.trainingState.volume7d ?? "unknown"} min
- 14-day volume: ${input.trainingState.volume14d ?? "unknown"} min
- 28-day volume: ${input.trainingState.volume28d ?? "unknown"} min
- Last long run: ${input.trainingState.lastLongRunDate ?? "unknown"}
- Last quality session: ${input.trainingState.lastQualityDate ?? "unknown"}
${input.userSettings.notes ? `- Athlete notes: ${input.userSettings.notes}` : ""}

Recent feedback:
${
  input.recentFeedback.length > 0
    ? input.recentFeedback
        .map(
          (f) =>
            `  ${f.date}: RPE ${f.rpe}/10, Soreness: ${f.soreness}${f.notes ? `, Notes: ${f.notes}` : ""}`
        )
        .join("\n")
    : "  No recent feedback available."
}

Week starts on: ${input.weekStartDate}
Generate dates starting from ${input.weekStartDate} for 7 consecutive days.

Provide clear rationale for each workout. Include 1-2 alternates for quality sessions.`
}

export async function generateWeekPlan(
  input: GeneratePlanInput,
  maxRetries: number = 2
): Promise<WeekPlanSchema> {
  const systemPrompt = buildSystemPrompt(input)

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const userMessage =
        attempt === 0
          ? `Generate a 7-day training plan starting ${input.weekStartDate}.`
          : `The previous plan had constraint violations. Please regenerate with these fixes applied. Remember: max ${input.userSettings.maxQualityDays} quality days, no back-to-back quality, long run on ${input.userSettings.longRunDay}.`

      const result = await generateText({
        model: google("gemini-1.5-flash"),
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        output: Output.object({ schema: weekPlanOutputSchema }),
        maxOutputTokens: 4000,
      })

      const plan = result.output
      if (!plan) {
        console.error("No output from AI model")
        continue
      }

      // Validate constraints
      const validation = validateWeekPlan(plan.days as DayPlan[], {
        maxQualityDays: input.userSettings.maxQualityDays,
        maxSubThresholdDays: input.userSettings.maxSubThresholdDays,
        longRunDay: input.userSettings.longRunDay,
      })

      if (validation.valid) {
        return plan as WeekPlanSchema
      }

      console.warn(
        `Plan validation failed (attempt ${attempt + 1}):`,
        validation.violations
      )
    } catch (error) {
      console.error(`Plan generation error (attempt ${attempt + 1}):`, error)
    }
  }

  // Fallback to template plan
  console.warn("Using fallback template plan after failed AI attempts")
  return {
    weekStartDate: input.weekStartDate,
    days: getFallbackPlan(input.weekStartDate, input.userSettings.longRunDay),
  }
}
