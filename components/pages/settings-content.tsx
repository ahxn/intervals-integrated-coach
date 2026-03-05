'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface Settings {
  intervalsApiKey?: string
  intervalsAthlete?: string
  weeklyMileageTarget?: number
  longRunDay?: string
  trainingFocusAreas?: string[]
}

export default function SettingsContent() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/settings')

      if (!res.ok) throw new Error('Failed to fetch settings')

      const data = await res.json()
      setSettings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!res.ok) throw new Error('Failed to save settings')

      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to save settings')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-6 text-foreground">Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={session?.user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-foreground opacity-50 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6 text-foreground">Intervals.icu Integration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="password"
                value={settings.intervalsApiKey || ''}
                onChange={(e) => handleChange('intervalsApiKey', e.target.value)}
                placeholder="Your Intervals.icu API key"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Find this in your Intervals.icu settings
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Athlete ID</label>
              <input
                type="text"
                value={settings.intervalsAthlete || ''}
                onChange={(e) => handleChange('intervalsAthlete', e.target.value)}
                placeholder="Your athlete ID"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6 text-foreground">Training Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Weekly Mileage Target (miles)</label>
              <input
                type="number"
                value={settings.weeklyMileageTarget || 30}
                onChange={(e) => handleChange('weeklyMileageTarget', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preferred Long Run Day</label>
              <select
                value={settings.longRunDay || 'saturday'}
                onChange={(e) => handleChange('longRunDay', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg text-green-400">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
