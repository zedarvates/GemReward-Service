import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatGems, formatDate } from '@/lib/utils'

export function DashboardPage() {
  const health = useQuery({ queryKey: ['health'], queryFn: api.health })
  const agents = useQuery({ queryKey: ['agents'], queryFn: api.listAgents })
  const workers = useQuery({ queryKey: ['workers'], queryFn: api.listWorkers })
  const escrows = useQuery({ queryKey: ['escrows'], queryFn: api.listEscrows })

  const totalGems = agents.data?.agents.reduce((s, a) => s + a.total_gems_earned, 0) ?? 0
  const onlineWorkers = workers.data?.filter((w) => w.status === 'online').length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">GemReward Dashboard</h1>
        <p className="text-muted-foreground">Overview of the Gem Protocol service</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Service Status</CardTitle>
            <span>{health.data?.status === 'active' ? '✅' : '❌'}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.data?.version ?? '...'}</div>
            <Badge variant={health.data?.status === 'active' ? 'success' : 'destructive'} className="mt-1">
              {health.data?.status ?? 'loading'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
            <span>🤖</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.data?.total_registered ?? 0}</div>
            <p className="text-xs text-muted-foreground">registered agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Workers</CardTitle>
            <span>🖥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineWorkers}/{workers.data?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">online / total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Gems</CardTitle>
            <span>💎</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatGems(totalGems)}</div>
            <p className="text-xs text-muted-foreground">earned by agents</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Escrows</CardTitle>
          </CardHeader>
          <CardContent>
            {escrows.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {escrows.data?.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b py-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{e.reason || 'Escrow'}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(e.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatGems(e.amount)} 💎</p>
                  <Badge variant={e.status === 'released' ? 'success' : e.status === 'pending' ? 'warning' : 'destructive'}>
                    {e.status}
                  </Badge>
                </div>
              </div>
            ))}
            {escrows.data?.length === 0 && <p className="text-sm text-muted-foreground">No escrows yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Agents</CardTitle>
          </CardHeader>
          <CardContent>
            {agents.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {agents.data?.agents.slice(0, 5).map((a) => (
              <div key={a.agent_id} className="flex items-center justify-between border-b py-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{a.agent_name}</p>
                  <p className="text-xs text-muted-foreground">{a.platform} · {a.model}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatGems(a.total_gems_earned)} 💎</p>
                  <p className="text-xs text-muted-foreground">{a.total_contributions} contributions</p>
                </div>
              </div>
            ))}
            {agents.data?.agents.length === 0 && <p className="text-sm text-muted-foreground">No agents registered</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
