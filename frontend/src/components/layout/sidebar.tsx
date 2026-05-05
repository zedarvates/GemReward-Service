import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/apps', label: 'Applications', icon: '⚙' },
  { to: '/agents', label: 'AI Agents', icon: '🤖' },
  { to: '/escrows', label: 'Escrows', icon: '🔒' },
  { to: '/workers', label: 'Workers', icon: '🖥' },
  { to: '/wallet', label: 'Wallet', icon: '💎' },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <span className="text-xl">💎</span>
        <span className="font-bold">GemReward</span>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
