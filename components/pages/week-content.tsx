'use client'

import { usePlan } from '@/hooks/use-workouts'
import WorkoutCard from '@/components/workout-card'
import PlanGeneratorButton from '@/components/plan-generator-button'

export default function WeekContent() {
  const { plan, isLoading, isError, refresh } = usePlan()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
        Failed to load week plan
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {plan?.workouts && plan.workouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plan.workouts.map((workout, idx) => (
            <div key={idx}>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {new Date(workout.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <WorkoutCard workout={workout} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12 bg-card border border-border rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No plan for this week</p>
              <p className="text-sm text-muted-foreground mt-2">
                Generate a weekly plan to get started!
              </p>
            </div>
          </div>
          <PlanGeneratorButton onGenerated={refresh} />
        </div>
      )}
    </div>
  )
}
