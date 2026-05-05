import type {
  HealthResponse,
  AppCreatePayload,
  AppCreateResponse,
  RewardRule,
  UserWallet,
  GemTransaction,
  AgentInfo,
  AgentRegisterPayload,
  AgentRegisterResponse,
  AgentContributionPayload,
  AgentContributionResponse,
  WorkerNode,
  WorkerRegisterPayload,
  Escrow,
  EscrowCreatePayload,
  TransferPayload,
  TaskCategory,
  AnalysisPayload,
  AnalysisResponse,
} from '@/types/api'

const BASE = '/v1'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Health
  health: () => request<HealthResponse>('/'),

  // Apps
  registerApp: (data: AppCreatePayload) =>
    request<AppCreateResponse>('/apps/register', { method: 'POST', body: JSON.stringify(data) }),

  getAppRules: (appId: string) =>
    request<RewardRule[]>(`/apps/${appId}/rules`),

  // Wallet
  getBalance: (userId: string) =>
    request<UserWallet>(`/gems/balance/${userId}`),

  getHistory: (userId: string) =>
    request<GemTransaction[]>(`/gems/history/${userId}`),

  // Agents
  registerAgent: (data: AgentRegisterPayload) =>
    request<AgentRegisterResponse>('/gems/ai/agent/register', { method: 'POST', body: JSON.stringify(data) }),

  agentContribution: (data: AgentContributionPayload) =>
    request<AgentContributionResponse>('/gems/ai/agent-contribution', { method: 'POST', body: JSON.stringify(data) }),

  listAgents: () =>
    request<{ agents: AgentInfo[]; total_registered: number }>('/gems/ai/agents'),

  analyzeContribution: (data: AnalysisPayload) =>
    request<AnalysisResponse>('/gems/ai/analyze-contribution', { method: 'POST', body: JSON.stringify(data) }),

  // Escrow
  createEscrow: (data: EscrowCreatePayload) =>
    request<{ status: string; escrow_id: string; amount: number }>('/gems/escrow/create', { method: 'POST', body: JSON.stringify(data) }),

  releaseEscrow: (escrowId: string) =>
    request<{ status: string; escrow_id: string }>(`/gems/escrow/release/${escrowId}`, { method: 'POST' }),

  cancelEscrow: (escrowId: string) =>
    request<{ status: string; escrow_id: string }>(`/gems/escrow/cancel/${escrowId}`, { method: 'POST' }),

  listEscrows: () =>
    request<Escrow[]>('/gems/escrows'),

  // Transfer
  transferGems: (data: TransferPayload) =>
    request<{ status: string; transaction_id: string; amount: number; from: string; to: string }>(
      '/gems/transfer', { method: 'POST', body: JSON.stringify(data) }
    ),

  // Workers
  registerWorker: (data: WorkerRegisterPayload) =>
    request<{ status: string; worker_id: string }>('/gems/worker/register', { method: 'POST', body: JSON.stringify(data) }),

  listWorkers: () =>
    request<WorkerNode[]>('/gems/workers'),

  // Task Categories
  listTaskCategories: () =>
    request<TaskCategory[]>('/gems/task-categories'),

  seedTasks: () =>
    request<{ status: string; message: string }>('/gems/tasks/seed', { method: 'POST' }),
}
