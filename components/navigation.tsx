'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [showMenu, setShowMenu] = useState(false)

  const isActive = (path: string) => pathname === path

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const navItems = [
    { href: '/today', label: 'Today', icon: '📅' },
    { href: '/week', label: 'Week', icon: '📊' },
    { href: '/chat', label: 'Chat', icon: '💬' },
    { href: '/feedback', label: 'Feedback', icon: '📝' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <nav className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Coach</h1>
        <p className="text-sm text-muted-foreground mt-1">Running Coach AI</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="text-xs text-muted-foreground mb-4">
          <p className="truncate">{session?.user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors text-sm font-medium"
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
