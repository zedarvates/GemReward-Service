import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatGems } from '@/lib/utils'

export function AgentsPage() {
  const [tab, setTab] = useState<'list' | 'register' | 'contribute'>('list')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Agents</h1>
        <p className="text-muted-foreground">Agent economy — register, contribute, and earn gems</p>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === 'list' ? 'default' : 'outline'} onClick={() => setTab('list')}>Agent List</Button>
        <Button variant={tab === 'register' ? 'default' : 'outline'} onClick={() => setTab('register')}>Register</Button>
        <Button variant={tab === 'contribute' ? 'default' : 'outline'} onClick={() => setTab('contribute')}>Contribute</Button>
      </div>

      {tab === 'list' && <AgentList />}
      {tab === 'register' && <AgentRegister />}
      {tab === 'contribute' && <AgentContribute />}
    </div>
  )
}

function AgentList() {
  const { data, isLoading } = useQuery({ queryKey: ['agents'], queryFn: api.listAgents })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Agents ({data?.total_registered ?? 0})</CardTitle>
        <CardDescription>All AI agents with reputation scores</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {data?.agents.length === 0 && <p className="text-sm text-muted-foreground">No agents registered yet.</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Platform</th>
                <th className="pb-2 font-medium">Model</th>
                <th className="pb-2 font-medium">Contributions</th>
                <th className="pb-2 font-medium">Gems Earned</th>
                <th className="pb-2 font-medium">Quality</th>
                <th className="pb-2 font-medium">Reputation</th>
              </tr>
            </thead>
            <tbody>
              {data?.agents.map((a) => (
                <tr key={a.agent_id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{a.agent_name}</td>
                  <td className="py-2 text-muted-foreground">{a.platform}</td>
                  <td className="py-2"><Badge variant="secondary">{a.model}</Badge></td>
                  <td className="py-2">{a.total_contributions}</td>
                  <td className="py-2 font-bold">{formatGems(a.total_gems_earned)} 💎</td>
                  <td className="py-2">{(a.avg_quality_score * 100).toFixed(0)}%</td>
                  <td className="py-2">{a.reputation_factor.toFixed(2)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function AgentRegister() {
  const [form, setForm] = useState({
    operator_id: '',
    agent_name: '',
    platform: 'custom',
    model: '',
    webhook_endpoint: '',
    shared_secret: '',
  })

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof api.registerAgent>[0]) => api.registerAgent(data),
    onSuccess: () => {
      setForm({ operator_id: '', agent_name: '', platform: 'custom', model: '', webhook_endpoint: '', shared_secret: '' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      operator_id: form.operator_id,
      agent_name: form.agent_name,
      platform: form.platform,
      model: form.model,
      webhook_endpoint: form.webhook_endpoint || undefined,
      shared_secret: form.shared_secret || undefined,
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Register AI Agent</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <Label>Operator ID (Wallet)</Label>
            <Input value={form.operator_id} onChange={(e) => setForm({ ...form, operator_id: e.target.value })} required />
          </div>
          <div>
            <Label>Agent Name</Label>
            <Input value={form.agent_name} onChange={(e) => setForm({ ...form, agent_name: e.target.value })} required />
          </div>
          <div>
            <Label>Platform</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            >
              <option value="custom">custom</option>
              <option value="openclaw">OpenClaw</option>
              <option value="langchain">LangChain</option>
              <option value="autogpt">AutoGPT</option>
            </select>
          </div>
          <div>
            <Label>Model</Label>
            <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="claude-3-5-sonnet" />
          </div>
          <div>
            <Label>Webhook Endpoint (optional)</Label>
            <Input value={form.webhook_endpoint} onChange={(e) => setForm({ ...form, webhook_endpoint: e.target.value })} />
          </div>
          <div>
            <Label>Shared Secret (optional, for HMAC)</Label>
            <Input value={form.shared_secret} onChange={(e) => setForm({ ...form, shared_secret: e.target.value })} />
          </div>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Registering...' : 'Register Agent'}</Button>
          {mutation.data && (
            <div className="rounded-lg border bg-green-50 p-3 text-sm dark:bg-green-950">
              <p><strong>Agent ID:</strong> {mutation.data.agent_id}</p>
              <p><strong>HMAC Required:</strong> {mutation.data.hmac_required ? 'Yes' : 'No'}</p>
              <p className="mt-1 text-xs text-muted-foreground">{mutation.data.message}</p>
            </div>
          )}
          {mutation.error && <p className="text-sm text-destructive">{mutation.error.message}</p>}
        </form>
      </CardContent>
    </Card>
  )
}

function AgentContribute() {
  const [form, setForm] = useState({
    agent_id: '',
    operator_id: '',
    app_id: 'storycore',
    output_text: '',
    task_type: 'research',
  })

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof api.agentContribution>[0]) => api.agentContribution(data),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.output_text.length < 10) return
    mutation.mutate({
      agent_id: form.agent_id,
      operator_id: form.operator_id,
      app_id: form.app_id,
      output_text: form.output_text,
      task_type: form.task_type,
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Submit Agent Contribution</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Agent ID</Label>
              <Input value={form.agent_id} onChange={(e) => setForm({ ...form, agent_id: e.target.value })} required />
            </div>
            <div>
              <Label>Operator ID</Label>
              <Input value={form.operator_id} onChange={(e) => setForm({ ...form, operator_id: e.target.value })} required />
            </div>
            <div>
              <Label>App ID</Label>
              <Input value={form.app_id} onChange={(e) => setForm({ ...form, app_id: e.target.value })} />
            </div>
            <div>
              <Label>Task Type</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={form.task_type}
                onChange={(e) => setForm({ ...form, task_type: e.target.value })}
              >
                <option value="research">Research</option>
                <option value="code">Code</option>
                <option value="creative">Creative</option>
                <option value="summarization">Summarization</option>
                <option value="orchestration">Orchestration</option>
              </select>
            </div>
            <div>
              <Label>Output Text</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={form.output_text}
                onChange={(e) => setForm({ ...form, output_text: e.target.value })}
                placeholder="Paste the agent's output here..."
                required
              />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Evaluating...' : 'Submit Contribution'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Scoring Result</CardTitle></CardHeader>
        <CardContent>
          {mutation.isPending && <p className="text-muted-foreground">Analyzing contribution...</p>}
          {!mutation.data && !mutation.isPending && <p className="text-muted-foreground">Submit a contribution to see the scoring breakdown.</p>}
          {mutation.data && (
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-4xl font-bold">{formatGems(mutation.data.gems_awarded)} 💎</p>
                <p className="text-sm text-muted-foreground">Gems Awarded</p>
              </div>
              {mutation.data.requires_human_review && (
                <Badge variant="warning" className="w-full justify-center">⚠ Requires human review</Badge>
              )}
              <div className="rounded-lg border p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>Base Value</span><span className="font-medium">{mutation.data.scoring.base_value}</span></div>
                <div className="flex justify-between"><span>Quality Score</span><span className="font-medium">{(mutation.data.scoring.quality_score * 100).toFixed(0)}%</span></div>
                <div className="flex justify-between"><span>Novelty Multiplier</span><span className="font-medium">{mutation.data.scoring.novelty_multiplier}x</span></div>
                <div className="flex justify-between"><span>Reputation Factor</span><span className="font-medium">{mutation.data.scoring.reputation_factor}x</span></div>
                <div className="flex justify-between border-t pt-1"><span>Raw Score</span><span className="font-medium">{mutation.data.scoring.raw_gems}</span></div>
              </div>
              <div className="text-sm">
                <p><strong>Agent:</strong> {mutation.data.agent.agent_name}</p>
                <p><strong>Total Contributions:</strong> {mutation.data.agent.total_contributions}</p>
              </div>
            </div>
          )}
          {mutation.error && <p className="text-sm text-destructive">{mutation.error.message}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
