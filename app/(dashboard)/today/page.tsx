'use client'

import { useSession } from 'next-auth/react'
import TodayContent from '@/components/pages/today-content'

export default function TodayPage() {
  const { data: session } = useSession()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Today</h1>
        <p className="text-muted-foreground mt-2">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <TodayContent />
    </div>
  )
}
