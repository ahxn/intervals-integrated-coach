export interface WorkoutTargets {
  primary: string
  secondary?: string
  notes?: string[]
}

export interface AlternateWorkout {
  label: string
  type: string
  durationMinutes: number
  targets: WorkoutTargets
}

export interface DayPlan {
  date: string
  type: "EASY" | "SUB_THRESHOLD" | "LONG" | "REST" | "OTHER"
  durationMinutes: number
  targets: WorkoutTargets
  rationale: string
  alternates?: AlternateWorkout[]
}

export interface WeekPlanSchema {
  weekStartDate: string
  days: DayPlan[]
}

export interface TrainingState {
  ctl: number | null
  atl: number | null
  tsb: number | null
  volume7d: number | null
  volume14d: number | null
  volume28d: number | null
  lastLongRunDate: string | null
  lastQualityDate: string | null
}

export interface PlanValidationResult {
  valid: boolean
  violations: string[]
}

export interface ProposedPlanPatch {
  date: string
  type?: string
  durationMinutes?: number
  targets?: WorkoutTargets
  rationale?: string
}
