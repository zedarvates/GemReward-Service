import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatGems, formatDate, tierColor } from '@/lib/utils'

export function WalletPage() {
  const [userId, setUserId] = useState('')
  const [searchId, setSearchId] = useState('')

  const { data: wallet, isLoading, error } = useQuery({
    queryKey: ['wallet', searchId],
    queryFn: () => api.getBalance(searchId),
    enabled: searchId.length > 0,
  })

  const { data: history } = useQuery({
    queryKey: ['history', searchId],
    queryFn: () => api.getHistory(searchId),
    enabled: searchId.length > 0,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (userId.trim()) setSearchId(userId.trim())
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">Check gem balance and transaction history</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Search User</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID (e.g. github:username)"
            />
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && <p className="text-muted-foreground">Loading wallet...</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      {wallet && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatGems(wallet.gem_balance)} 💎</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatGems(wallet.gem_total_earned)} 💎</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold capitalize ${tierColor(wallet.gem_tier)}`}>{wallet.gem_tier}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>{history.length} transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Platform</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-2 text-xs">{formatDate(tx.created_at)}</td>
                      <td className="py-2"><Badge variant="secondary">{tx.transaction_type}</Badge></td>
                      <td className={`py-2 font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount >= 0 ? '+' : ''}{formatGems(tx.amount)} 💎
                      </td>
                      <td className="py-2 text-muted-foreground">{tx.source_platform ?? '-'}</td>
                      <td className="py-2">
                        <Badge variant={tx.status === 'confirmed' ? 'success' : 'warning'}>{tx.status}</Badge>
                      </td>
                      <td className="py-2 text-muted-foreground text-xs max-w-[200px] truncate">{tx.source_id ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {history?.length === 0 && <p className="text-sm text-muted-foreground">No transactions found for this user.</p>}
    </div>
  )
}
