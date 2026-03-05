'use client'

import SettingsContent from '@/components/pages/settings-content'

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and preferences
        </p>
      </div>

      <SettingsContent />
    </div>
  )
}
