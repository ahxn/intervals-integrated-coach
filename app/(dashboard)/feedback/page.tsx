'use client'

import FeedbackContent from '@/components/pages/feedback-content'

export default function FeedbackPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Feedback</h1>
        <p className="text-muted-foreground mt-2">
          Log how your workouts went
        </p>
      </div>

      <FeedbackContent />
    </div>
  )
}
