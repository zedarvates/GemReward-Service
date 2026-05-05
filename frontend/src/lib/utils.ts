import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatGems(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString()
}

export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function tierColor(tier: string): string {
  switch (tier) {
    case 'legend': return 'text-yellow-500'
    case 'gold': return 'text-amber-400'
    case 'silver': return 'text-gray-400'
    default: return 'text-blue-400'
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'online': return 'text-green-500'
    case 'busy': return 'text-yellow-500'
    case 'offline': return 'text-red-500'
    default: return 'text-gray-500'
  }
}

export function escrowStatusColor(status: string): string {
  switch (status) {
    case 'released': return 'text-green-500'
    case 'pending': return 'text-yellow-500'
    case 'cancelled': return 'text-red-500'
    default: return 'text-gray-500'
  }
}
