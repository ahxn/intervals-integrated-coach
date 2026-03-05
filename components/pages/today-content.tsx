'use client'

import { useState } from 'react'
import { useWorkouts } from '@/hooks/use-workouts'
import WorkoutCard from '@/components/workout-card'
import PlanGeneratorButton from '@/components/plan-generator-button'

export default function TodayContent() {
  const today = new Date().toISOString().split('T')[0]
  const { workout, isLoading, isError, refresh } = useWorkouts(today)
  const [feedbackText, setFeedbackText] = useState('')
  const [savingFeedback, setSavingFeedback] = useState(false)

  const handleSaveFeedback = async () => {
    if (!feedbackText.trim()) return

    setSavingFeedback(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          rating: 5,
          notes: feedbackText,
        }),
      })

      if (!res.ok) throw new Error('Failed to save feedback')

      setFeedbackText('')
      refresh()
    } catch (err) {
      console.error('Error saving feedback:', err)
    } finally {
      setSavingFeedback(false)
    }
  }

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
        Failed to load today&apos;s workout
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {workout?.plannedWorkout ? (
        <>
          <WorkoutCard workout={workout.plannedWorkout} />
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Log Feedback</h3>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="How did the workout feel? Any notes?"
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
            />
            <button
              onClick={handleSaveFeedback}
              disabled={savingFeedback || !feedbackText.trim()}
              className="mt-4 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {savingFeedback ? 'Saving...' : 'Save Feedback'}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12 bg-card border border-border rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No workout scheduled for today</p>
              <p className="text-sm text-muted-foreground mt-2">
                Generate a plan to get started!
              </p>
            </div>
          </div>
          <PlanGeneratorButton onGenerated={refresh} />
        </div>
      )}
    </div>
  )
}
