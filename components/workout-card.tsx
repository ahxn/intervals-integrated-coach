'use client'

interface WorkoutProps {
  workout: {
    type: string
    name: string
    description: string
    distance?: number
    duration?: number
    pace?: string
    intensity?: string
  }
}

export default function WorkoutCard({ workout }: WorkoutProps) {
  const getIntensityColor = (intensity?: string) => {
    switch (intensity?.toLowerCase()) {
      case 'easy':
        return 'text-green-400'
      case 'moderate':
        return 'text-yellow-400'
      case 'hard':
      case 'threshold':
        return 'text-orange-400'
      case 'maximum':
      case 'vo2max':
        return 'text-red-400'
      default:
        return 'text-blue-400'
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{workout.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{workout.type}</p>
        </div>
        {workout.intensity && (
          <span className={`text-sm font-medium px-3 py-1 rounded-full bg-muted ${getIntensityColor(workout.intensity)}`}>
            {workout.intensity}
          </span>
        )}
      </div>

      <p className="text-foreground mb-4">{workout.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {workout.distance && (
          <div>
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="text-lg font-semibold text-foreground">{workout.distance} mi</p>
          </div>
        )}
        {workout.duration && (
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-lg font-semibold text-foreground">
              {Math.floor(workout.duration)} min
            </p>
          </div>
        )}
        {workout.pace && (
          <div>
            <p className="text-xs text-muted-foreground">Target Pace</p>
            <p className="text-lg font-semibold text-foreground">{workout.pace}</p>
          </div>
        )}
      </div>
    </div>
  )
}
