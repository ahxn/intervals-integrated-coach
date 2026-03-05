'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PlanGeneratorButtonProps {
  onGenerated?: () => void
}

export default function PlanGeneratorButton({ onGenerated }: PlanGeneratorButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [constraints, setConstraints] = useState({
    weeklyMileage: 30,
    focusAreas: [] as string[],
  })
  const router = useRouter()

  const handleGeneratePlan = async () => {
    setLoading(true)
    setError('')

    try {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())

      const res = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: weekStart.toISOString().split('T')[0],
          constraints,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate plan')
      }

      setShowForm(false)
      setConstraints({ weeklyMileage: 30, focusAreas: [] })
      onGenerated?.()
      router.refresh()
    } catch (err) {
      setError(String(err))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
      >
        Generate Weekly Plan
      </button>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Generate Plan</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Target Weekly Mileage: {constraints.weeklyMileage} miles
          </label>
          <input
            type="range"
            min="10"
            max="80"
            step="5"
            value={constraints.weeklyMileage}
            onChange={(e) =>
              setConstraints({
                ...constraints,
                weeklyMileage: parseInt(e.target.value),
              })
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Training Focus</label>
          <div className="space-y-2">
            {['Base Building', 'Speed Work', 'Endurance', 'Recovery'].map((focus) => (
              <label key={focus} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={constraints.focusAreas.includes(focus)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setConstraints({
                        ...constraints,
                        focusAreas: [...constraints.focusAreas, focus],
                      })
                    } else {
                      setConstraints({
                        ...constraints,
                        focusAreas: constraints.focusAreas.filter((f) => f !== focus),
                      })
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">{focus}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
          <button
            onClick={() => setShowForm(false)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
