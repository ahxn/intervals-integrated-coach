// Intervals.icu API client (read-only, single global API key)
// TODO: Support per-user OAuth in future versions

import type { TrainingState } from "@/types"

const INTERVALS_BASE = "https://intervals.icu/api/v1"

function getAuthHeader(): string {
  const apiKey = process.env.INTERVALS_API_KEY
  if (!apiKey) {
    throw new Error("INTERVALS_API_KEY not set")
  }
  return "Basic " + Buffer.from(`API_KEY:${apiKey}`).toString("base64")
}

interface IntervalsActivity {
  id: string
  start_date_local: string
  type: string
  moving_time: number
  elapsed_time: number
  icu_training_load?: number
  name?: string
}

interface IntervalsWellness {
  id: string
  ctl?: number
  atl?: number
  rampRate?: number
}

// Fetch recent activities from Intervals.icu
// athleteId "i0" means "me" (the owner of the API key)
export async function fetchActivities(
  athleteId: string = "i0",
  oldest: string,
  newest: string
): Promise<IntervalsActivity[]> {
  try {
    const url = `${INTERVALS_BASE}/athlete/${athleteId}/activities?oldest=${oldest}&newest=${newest}`
    const res = await fetch(url, {
      headers: { Authorization: getAuthHeader() },
    })

    if (!res.ok) {
      console.error(`Intervals API error: ${res.status} ${res.statusText}`)
      return []
    }

    return (await res.json()) as IntervalsActivity[]
  } catch (error) {
    console.error("Failed to fetch Intervals activities:", error)
    return []
  }
}

// Fetch wellness data (includes CTL/ATL)
export async function fetchWellness(
  athleteId: string = "i0",
  oldest: string,
  newest: string
): Promise<IntervalsWellness[]> {
  try {
    const url = `${INTERVALS_BASE}/athlete/${athleteId}/wellness?oldest=${oldest}&newest=${newest}`
    const res = await fetch(url, {
      headers: { Authorization: getAuthHeader() },
    })

    if (!res.ok) {
      console.error(`Intervals wellness error: ${res.status} ${res.statusText}`)
      return []
    }

    return (await res.json()) as IntervalsWellness[]
  } catch (error) {
    console.error("Failed to fetch Intervals wellness:", error)
    return []
  }
}

// Compute TrainingState from raw Intervals data
export function computeTrainingState(
  activities: IntervalsActivity[],
  wellness: IntervalsWellness[]
): TrainingState {
  const now = new Date()

  // Compute rolling volumes
  const msPerDay = 86400000
  const recentActivities = activities.filter(
    (a) => a.type === "Run" || a.type === "VirtualRun"
  )

  const volume7d = recentActivities
    .filter(
      (a) =>
        now.getTime() - new Date(a.start_date_local).getTime() <=
        7 * msPerDay
    )
    .reduce((sum, a) => sum + (a.moving_time || 0) / 60, 0)

  const volume14d = recentActivities
    .filter(
      (a) =>
        now.getTime() - new Date(a.start_date_local).getTime() <=
        14 * msPerDay
    )
    .reduce((sum, a) => sum + (a.moving_time || 0) / 60, 0)

  const volume28d = recentActivities
    .filter(
      (a) =>
        now.getTime() - new Date(a.start_date_local).getTime() <=
        28 * msPerDay
    )
    .reduce((sum, a) => sum + (a.moving_time || 0) / 60, 0)

  // Get latest wellness entry for CTL/ATL
  const latestWellness = wellness.length > 0 ? wellness[wellness.length - 1] : null
  const ctl = latestWellness?.ctl ?? null
  const atl = latestWellness?.atl ?? null
  const tsb = ctl !== null && atl !== null ? ctl - atl : null

  // Determine last long run and last quality session dates
  // (heuristic: long run > 75 min, quality = has high training load)
  const sortedRuns = [...recentActivities].sort(
    (a, b) =>
      new Date(b.start_date_local).getTime() -
      new Date(a.start_date_local).getTime()
  )

  const lastLongRun = sortedRuns.find(
    (a) => (a.moving_time || 0) / 60 > 75
  )
  const lastQuality = sortedRuns.find(
    (a) => (a.icu_training_load ?? 0) > 80
  )

  return {
    ctl,
    atl,
    tsb,
    volume7d: Math.round(volume7d),
    volume14d: Math.round(volume14d),
    volume28d: Math.round(volume28d),
    lastLongRunDate: lastLongRun
      ? lastLongRun.start_date_local.substring(0, 10)
      : null,
    lastQualityDate: lastQuality
      ? lastQuality.start_date_local.substring(0, 10)
      : null,
  }
}

// Mock data for development / when Intervals.icu isn't configured
export function getMockTrainingState(): TrainingState {
  const today = new Date()
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const fiveDaysAgo = new Date(today)
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

  return {
    ctl: 42.5,
    atl: 48.2,
    tsb: -5.7,
    volume7d: 280,
    volume14d: 520,
    volume28d: 980,
    lastLongRunDate: fiveDaysAgo.toISOString().substring(0, 10),
    lastQualityDate: threeDaysAgo.toISOString().substring(0, 10),
  }
}
