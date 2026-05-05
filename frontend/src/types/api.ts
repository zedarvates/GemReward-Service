export interface AppRegistration {
  id: string
  name: string
  api_key: string
  webhook_secret: string | null
  is_active: boolean
  created_at: string
}

export interface RewardRule {
  id: string
  app_id: string
  event_type: string
  trigger_key: string
  gem_amount: number
  description?: string
}

export interface AppCreatePayload {
  name: string
  rules: { event_type: string; trigger_key: string; gem_amount: number }[]
}

export interface AppCreateResponse {
  app_id: string
  api_key: string
  webhook_secret: string
  rules_count: number
}

export interface UserWallet {
  user_id: string
  gem_balance: number
  gem_total_earned: number
  gem_tier: 'contributor' | 'silver' | 'gold' | 'legend'
}

export interface GemTransaction {
  id: string
  app_id: string
  user_id: string
  amount: number
  transaction_type: string
  source_platform: string | null
  source_id: string | null
  status: string
  metadata_json: Record<string, unknown> | null
  created_at: string
}

export interface AgentInfo {
  agent_id: string
  agent_name: string
  platform: string
  model: string
  operator_id: string
  total_contributions: number
  total_gems_earned: number
  avg_quality_score: number
  reputation_factor: number
}

export interface AgentRegisterPayload {
  operator_id: string
  agent_name: string
  platform: string
  model: string
  webhook_endpoint?: string
  shared_secret?: string
}

export interface AgentRegisterResponse {
  status: string
  agent_id: string
  shared_secret: string | null
  hmac_required: boolean
  message: string
}

export interface AgentContributionPayload {
  agent_id: string
  operator_id: string
  app_id: string
  output_text: string
  task_type: string
  context_prompt?: string
  source_url?: string
}

export interface AgentContributionResponse {
  status: string
  gems_awarded: number
  requires_human_review: boolean
  scoring: {
    base_value: number
    quality_score: number
    novelty_multiplier: number
    reputation_factor: number
    raw_gems: number
  }
  agent: {
    agent_id: string
    agent_name: string
    platform: string
    total_contributions: number
    reputation_factor: number
  }
}

export interface WorkerNode {
  id: string
  user_id: string
  name: string
  vram_gb: number
  compute_score: number
  status: 'online' | 'busy' | 'offline'
  capabilities: string[]
  last_seen: string
  created_at: string
}

export interface WorkerRegisterPayload {
  user_id: string
  name: string
  vram_gb: number
  capabilities: string[]
}

export interface Escrow {
  id: string
  app_id: string
  sender_id: string
  receiver_id: string
  amount: number
  status: 'pending' | 'released' | 'cancelled'
  reason: string
  task_type: string | null
  metadata_json: Record<string, unknown> | null
  created_at: string
  expires_at: string | null
}

export interface EscrowCreatePayload {
  app_id: string
  sender_id: string
  receiver_id: string
  amount: number
  reason: string
  task_type?: string
}

export interface TransferPayload {
  app_id: string
  from_user_id: string
  to_user_id: string
  amount: number
  reason: string
}

export interface TaskCategory {
  id: string
  display_name: string
  base_cost: number
  min_vram_gb: number
  is_active: boolean
  metadata_json: Record<string, unknown> | null
}

export interface HealthResponse {
  service: string
  status: string
  version: string
  documentation: string
}

export interface AnalysisPayload {
  app_id: string
  contributor_id: string
  contribution_text: string
  contribution_type: string
  source_url?: string
}

export interface AnalysisResponse {
  status: string
  gems_awarded: number
  analysis: {
    effort: number
    impact_multiplier: number
    agent: string
  }
}
