import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatGems } from '@/lib/utils'

export function EscrowsPage() {
  const [tab, setTab] = useState<'list' | 'create' | 'transfer'>('list')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Escrows & Transfers</h1>
        <p className="text-muted-foreground">P2P gem escrows and transfers</p>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === 'list' ? 'default' : 'outline'} onClick={() => setTab('list')}>Escrow List</Button>
        <Button variant={tab === 'create' ? 'default' : 'outline'} onClick={() => setTab('create')}>Create Escrow</Button>
        <Button variant={tab === 'transfer' ? 'default' : 'outline'} onClick={() => setTab('transfer')}>Transfer</Button>
      </div>

      {tab === 'list' && <EscrowList />}
      {tab === 'create' && <CreateEscrow />}
      {tab === 'transfer' && <TransferGems />}
    </div>
  )
}

function EscrowList() {
  const { data, isLoading } = useQuery({ queryKey: ['escrows'], queryFn: api.listEscrows })
  const queryClient = useQueryClient()

  const releaseMutation = useMutation({
    mutationFn: (id: string) => api.releaseEscrow(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escrows'] }),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.cancelEscrow(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escrows'] }),
  })

  return (
    <Card>
      <CardHeader><CardTitle>All Escrows</CardTitle></CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {data?.length === 0 && <p className="text-sm text-muted-foreground">No escrows found.</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">Sender</th>
                <th className="pb-2 font-medium">Receiver</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Reason</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="py-2 font-mono text-xs">{e.id.slice(0, 8)}...</td>
                  <td className="py-2">{e.sender_id}</td>
                  <td className="py-2">{e.receiver_id}</td>
                  <td className="py-2 font-bold">{formatGems(e.amount)} 💎</td>
                  <td className="py-2"><Badge variant={e.status === 'released' ? 'success' : e.status === 'pending' ? 'warning' : 'destructive'}>{e.status}</Badge></td>
                  <td className="py-2 text-muted-foreground">{e.reason}</td>
                  <td className="py-2">
                    {e.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => releaseMutation.mutate(e.id)} disabled={releaseMutation.isPending}>Release</Button>
                        <Button size="sm" variant="destructive" onClick={() => cancelMutation.mutate(e.id)} disabled={cancelMutation.isPending}>Cancel</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateEscrow() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    app_id: 'storycore',
    sender_id: '',
    receiver_id: '',
    amount: 10,
    reason: 'compute_escrow',
    task_type: '',
  })

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof api.createEscrow>[0]) => api.createEscrow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] })
      setForm({ ...form, sender_id: '', receiver_id: '', amount: 10 })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      app_id: form.app_id,
      sender_id: form.sender_id,
      receiver_id: form.receiver_id,
      amount: form.amount,
      reason: form.reason,
      task_type: form.task_type || undefined,
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Create Escrow</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <Label>Sender ID</Label>
            <Input value={form.sender_id} onChange={(e) => setForm({ ...form, sender_id: e.target.value })} required />
          </div>
          <div>
            <Label>Receiver ID</Label>
            <Input value={form.receiver_id} onChange={(e) => setForm({ ...form, receiver_id: e.target.value })} required />
          </div>
          <div>
            <Label>Amount (Gems)</Label>
            <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })} required />
          </div>
          <div>
            <Label>Reason</Label>
            <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div>
            <Label>Task Type (optional)</Label>
            <Input value={form.task_type} onChange={(e) => setForm({ ...form, task_type: e.target.value })} placeholder="video_draft" />
          </div>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating...' : 'Create Escrow'}</Button>
          {mutation.data && (
            <div className="rounded-lg border bg-green-50 p-3 text-sm dark:bg-green-950">
              <p>Escrow created: <strong>{mutation.data.escrow_id}</strong></p>
              <p>Amount locked: <strong>{mutation.data.amount} 💎</strong></p>
            </div>
          )}
          {mutation.error && <p className="text-sm text-destructive">{mutation.error.message}</p>}
        </form>
      </CardContent>
    </Card>
  )
}

function TransferGems() {
  const [form, setForm] = useState({
    app_id: 'storycore',
    from_user_id: '',
    to_user_id: '',
    amount: 10,
    reason: 'compute_p2p',
  })

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof api.transferGems>[0]) => api.transferGems(data),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      app_id: form.app_id,
      from_user_id: form.from_user_id,
      to_user_id: form.to_user_id,
      amount: form.amount,
      reason: form.reason,
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Transfer Gems (P2P)</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <Label>From User ID</Label>
            <Input value={form.from_user_id} onChange={(e) => setForm({ ...form, from_user_id: e.target.value })} required />
          </div>
          <div>
            <Label>To User ID</Label>
            <Input value={form.to_user_id} onChange={(e) => setForm({ ...form, to_user_id: e.target.value })} required />
          </div>
          <div>
            <Label>Amount</Label>
            <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })} required />
          </div>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Transferring...' : 'Transfer'}</Button>
          {mutation.data && (
            <div className="rounded-lg border bg-green-50 p-3 text-sm dark:bg-green-950">
              <p>Transaction: <strong>{mutation.data.transaction_id}</strong></p>
              <p>{mutation.data.from} → {mutation.data.to}: <strong>{mutation.data.amount} 💎</strong></p>
            </div>
          )}
          {mutation.error && <p className="text-sm text-destructive">{mutation.error.message}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
