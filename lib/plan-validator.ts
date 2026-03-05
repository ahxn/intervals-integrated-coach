import type { DayPlan, PlanValidationResult } from "@/types"

interface ValidationSettings {
  maxQualityDays: number
  maxSubThresholdDays: number
  longRunDay: string // MONDAY, TUESDAY, etc.
}

const QUALITY_TYPES = ["SUB_THRESHOLD", "LONG"]

export function validateWeekPlan(
  days: DayPlan[],
  settings: ValidationSettings
): PlanValidationResult {
  const violations: string[] = []

  if (days.length !== 7) {
    violations.push(`Plan must have exactly 7 days, got ${days.length}`)
  }

  // Count quality days (SUB_THRESHOLD + LONG)
  const qualityDays = days.filter((d) => QUALITY_TYPES.includes(d.type))
  if (qualityDays.length > settings.maxQualityDays) {
    violations.push(
      `Too many quality days: ${qualityDays.length} > max ${settings.maxQualityDays}`
    )
  }

  // Count sub-threshold days
  const subThresholdDays = days.filter((d) => d.type === "SUB_THRESHOLD")
  if (subThresholdDays.length > settings.maxSubThresholdDays) {
    violations.push(
      `Too many sub-threshold days: ${subThresholdDays.length} > max ${settings.maxSubThresholdDays}`
    )
  }

  // No back-to-back quality days
  for (let i = 1; i < days.length; i++) {
    if (
      QUALITY_TYPES.includes(days[i].type) &&
      QUALITY_TYPES.includes(days[i - 1].type)
    ) {
      violations.push(
        `Back-to-back quality days on ${days[i - 1].date} and ${days[i].date}`
      )
    }
  }

  // Long run on preferred day
  const longRunDays = days.filter((d) => d.type === "LONG")
  if (longRunDays.length > 0) {
    const expectedDay = settings.longRunDay
    const hasLongOnPreferred = longRunDays.some((d) => {
      const dayDate = new Date(d.date)
      const dayNames = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ]
      return dayNames[dayDate.getDay()] === expectedDay
    })
    if (!hasLongOnPreferred) {
      violations.push(
        `Long run not scheduled on preferred day (${expectedDay})`
      )
    }
  }

  // At least one rest or easy day
  const restOrEasy = days.filter(
    (d) => d.type === "REST" || d.type === "EASY"
  )
  if (restOrEasy.length === 0) {
    violations.push("Plan must include at least one rest or easy day")
  }

  // Duration sanity check
  for (const day of days) {
    if (day.type !== "REST" && (day.durationMinutes < 15 || day.durationMinutes > 240)) {
      violations.push(
        `Unreasonable duration on ${day.date}: ${day.durationMinutes} min`
      )
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  }
}

// Fallback template plan if AI output is invalid after retries
export function getFallbackPlan(weekStartDate: string, longRunDay: string): DayPlan[] {
  const start = new Date(weekStartDate)
  const dayNames = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ]

  const days: DayPlan[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const dateStr = date.toISOString().substring(0, 10)
    const dayName = dayNames[date.getDay()]

    let type: DayPlan["type"] = "EASY"
    let duration = 45
    let primary = "Zone 2 easy run"

    if (dayName === longRunDay) {
      type = "LONG"
      duration = 90
      primary = "Zone 2 long run"
    } else if (i === 2) {
      type = "SUB_THRESHOLD"
      duration = 50
      primary = "Sub-threshold intervals"
    } else if (i === 5) {
      type = "REST"
      duration = 0
      primary = "Full rest day"
    }

    days.push({
      date: dateStr,
      type,
      durationMinutes: duration,
      targets: { primary },
      rationale:
        type === "REST"
          ? "Recovery day to absorb training load"
          : type === "LONG"
            ? "Weekly long run to build aerobic endurance"
            : type === "SUB_THRESHOLD"
              ? "Sub-threshold work to improve lactate clearance"
              : "Easy aerobic run for base building",
    })
  }

  return days
}
