import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { AppCreatePayload } from '@/types/api'

export function AppsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [rules, setRules] = useState([{ event_type: 'github_label', trigger_key: '', gem_amount: 5 }])

  const registerMutation = useMutation({
    mutationFn: (data: AppCreatePayload) => api.registerApp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] })
      setShowForm(false)
      setName('')
      setRules([{ event_type: 'github_label', trigger_key: '', gem_amount: 5 }])
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    registerMutation.mutate({
      name: name.trim(),
      rules: rules.filter((r) => r.trigger_key.trim()),
    })
  }

  const addRule = () => setRules([...rules, { event_type: 'github_label', trigger_key: '', gem_amount: 5 }])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-muted-foreground">Register and manage applications</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Register App'}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Register New Application</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>App Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My App" required />
              </div>
              <div className="space-y-2">
                <Label>Reward Rules</Label>
                {rules.map((rule, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label className="text-xs">Trigger Key</Label>
                      <Input
                        value={rule.trigger_key}
                        onChange={(e) => {
                          const next = [...rules]
                          next[i] = { ...next[i], trigger_key: e.target.value }
                          setRules(next)
                        }}
                        placeholder="severity:critical"
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">Gems</Label>
                      <Input
                        type="number"
                        value={rule.gem_amount}
                        onChange={(e) => {
                          const next = [...rules]
                          next[i] = { ...next[i], gem_amount: parseInt(e.target.value) || 0 }
                          setRules(next)
                        }}
                      />
                    </div>
                    {rules.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setRules(rules.filter((_, j) => j !== i))}>
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addRule}>+ Add Rule</Button>
              </div>
              <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Registering...' : 'Register'}
              </Button>
              {registerMutation.data && (
                <div className="rounded-lg border bg-green-50 p-3 text-sm dark:bg-green-950">
                  <p><strong>App ID:</strong> {registerMutation.data.app_id}</p>
                  <p><strong>API Key:</strong> <code className="text-xs">{registerMutation.data.api_key}</code></p>
                  <p><strong>Webhook Secret:</strong> <code className="text-xs">{registerMutation.data.webhook_secret}</code></p>
                </div>
              )}
              {registerMutation.error && (
                <p className="text-sm text-destructive">{registerMutation.error.message}</p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      <AppList />
    </div>
  )
}

function AppList() {
  const agents = useQuery({ queryKey: ['agents'], queryFn: api.listAgents })

  return (
    <Card>
      <CardHeader><CardTitle>Registered Apps (via Agents)</CardTitle></CardHeader>
      <CardContent>
        {agents.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {agents.data?.agents.length === 0 && <p className="text-sm text-muted-foreground">No apps registered. Create one above.</p>}
        {agents.data?.agents.map((a) => (
          <div key={a.agent_id} className="flex items-center justify-between border-b py-3 last:border-0">
            <div>
              <p className="font-medium">{a.agent_name}</p>
              <p className="text-xs text-muted-foreground">{a.agent_id} · {a.platform}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{a.model}</Badge>
              <span className="text-sm font-bold">{a.total_gems_earned} 💎</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
