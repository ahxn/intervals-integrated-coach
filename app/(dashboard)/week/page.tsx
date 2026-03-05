'use client'

import WeekContent from '@/components/pages/week-content'

export default function WeekPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">This Week</h1>
        <p className="text-muted-foreground mt-2">
          View your training schedule for the week
        </p>
      </div>

      <WeekContent />
    </div>
  )
}
