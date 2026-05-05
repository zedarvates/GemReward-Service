import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatGems, timeAgo, statusColor } from '@/lib/utils'

export function WorkersPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    user_id: '',
    name: '',
    vram_gb: 12,
    capabilities: '',
  })

  const { data: workers, isLoading } = useQuery({ queryKey: ['workers'], queryFn: api.listWorkers })
  const { data: categories } = useQuery({ queryKey: ['task-categories'], queryFn: api.listTaskCategories })

  const registerMutation = useMutation({
    mutationFn: (data: Parameters<typeof api.registerWorker>[0]) => api.registerWorker(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      setShowForm(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate({
      user_id: form.user_id,
      name: form.name,
      vram_gb: form.vram_gb,
      capabilities: form.capabilities.split(',').map((s) => s.trim()).filter(Boolean),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compute Workers</h1>
          <p className="text-muted-foreground">Hardware providers in the compute mesh</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Register Worker'}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Register Worker Node</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <div>
                <Label>User ID</Label>
                <Input value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} required />
              </div>
              <div>
                <Label>Worker Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Workstation-RTX4090" />
              </div>
              <div>
                <Label>VRAM (GB)</Label>
                <Input type="number" value={form.vram_gb} onChange={(e) => setForm({ ...form, vram_gb: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Capabilities (comma-separated)</Label>
                <Input value={form.capabilities} onChange={(e) => setForm({ ...form, capabilities: e.target.value })} placeholder="comfyui, web_search" />
              </div>
              <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Registering...' : 'Register'}
              </Button>
              {registerMutation.data && (
                <p className="text-sm text-green-600">Worker registered: {registerMutation.data.worker_id}</p>
              )}
              {registerMutation.error && <p className="text-sm text-destructive">{registerMutation.error.message}</p>}
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Worker Nodes ({workers?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {workers?.length === 0 && <p className="text-sm text-muted-foreground">No workers registered.</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">VRAM</th>
                    <th className="pb-2 font-medium">Capabilities</th>
                    <th className="pb-2 font-medium">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {workers?.map((w) => (
                    <tr key={w.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{w.name}</td>
                      <td className="py-2"><span className={statusColor(w.status)}>●</span> {w.status}</td>
                      <td className="py-2">{w.vram_gb} GB</td>
                      <td className="py-2">
                        <div className="flex gap-1 flex-wrap">
                          {(w.capabilities ?? []).map((c) => (
                            <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 text-muted-foreground text-xs">{timeAgo(w.last_seen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Task Categories</CardTitle></CardHeader>
          <CardContent>
            {categories?.length === 0 && <p className="text-sm text-muted-foreground">No categories. Seed them.</p>}
            <div className="space-y-2">
              {categories?.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{c.display_name}</p>
                    <p className="text-xs text-muted-foreground">{c.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatGems(c.base_cost)} 💎</p>
                    <p className="text-xs text-muted-foreground">min {c.min_vram_gb}GB VRAM</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
