export type LeadStatus =
  | 'active'
  | 'completed'
  | 'replied'
  | 'paused'
  | 'suppressed'
  | 'failed'
  | string;

export type AccountHealthState = 'healthy' | 'caution' | 'restricted' | string;

export type OutreachChannel = 'email' | 'linkedin' | 'system' | string;

export interface Prospect {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  job_title: string | null;
  linkedin_url: string | null;
  email: string | null;
  personalization: Record<string, unknown> | null;
  current_step: number;
  status: LeadStatus;
  next_send_at: string | null;
  linkedin_connected: boolean | null;
  created_at: string;
  country: string | null;
  timezone: string | null;
  processing: boolean | null;
  processing_started_at: string | null;
  getsales_lead_uuid?: string | null;
  getsales_enrollment_uuid?: string | null;
  getsales_enrollment_status?: string | null;
  getsales_action_status?: string | null;
  getsales_action_started_at?: string | null;
}

export type AutomationErrorStatus = 'open' | 'resolved' | 'ignored' | string;

export interface AutomationError {
  id: string;
  workflow_name: string;
  execution_id: string | null;
  failed_node: string | null;
  error_message: string | null;
  execution_url: string | null;
  status: AutomationErrorStatus;
  telegram_message: string | null;
  created_at: string;
}

export interface QueueHealthStats {
  lockedCount: number;
  staleCount: number;
  totalActiveCount: number;
}

export interface GetSalesAccountData {
  uuid?: string;
  ln_id?: string | null;
  sn_id?: string | null;
  has_sn?: boolean;
  team_id?: number | null;
  user_id?: number | null;
  nickname?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  ln_member_id?: string | null;
  has_recruiter?: boolean;
  active_sessions?: unknown;
  last_sn_check_at?: string | null;
  last_snapshot_at?: string | null;
  linkedin_server_id?: string | null;
  linkedin_browser_id?: number | null;
  sender_profile_uuid?: string | null;
  last_contacts_sync_at?: string | null;
  last_inmail_strike_at?: string | null;
  last_withdraw_sync_at?: string | null;
  last_recruiter_check_at?: string | null;
  last_sn_threads_sync_at?: string | null;
  last_tasks_heartbeat_at?: string | null;
  last_conversations_sync_at?: string | null;
  last_messages_heartbeat_at?: string | null;
  delay_between_tasks_in_minutes?: number | null;
  last_connection_weekly_limit_at?: string | null;
  [key: string]: unknown;
}

export interface LinkedinAccount {
  id: string;
  account_name: string;
  health_state: AccountHealthState;
  sent_today: number;
  sent_this_week: number;
  pending_invites: number;
  acceptance_rate: number | null;
  restriction_detected: boolean | null;
  updated_at: string;
  getsales_account_uuid?: string | null;
  getsales_data?: GetSalesAccountData | null;
}

export interface OutreachEvent {
  id: string;
  prospect_id: string;
  step: number;
  channel: OutreachChannel;
  action: string;
  message: string | null;
  message_id: string | null;
  sent_at: string;
  response: Record<string, unknown> | null;
  // Optional joined prospect info
  prospect?: Pick<Prospect, 'id' | 'first_name' | 'last_name' | 'company' | 'email'>;
}

export interface SuppressionRecord {
  id: string;
  email: string | null;
  linkedin_url: string | null;
  reason: string | null;
  created_at: string;
}

export interface OutreachConfigSettings {
  business_start_hour?: number;
  business_end_hour?: number;
  min_delay_days?: number;
  max_delay_days?: number;
  default_timezone?: string;
  max_daily_requests?: number;
  max_weekly_requests?: number;
  max_daily_messages?: number;
  max_pending_invites?: number;
  min_acceptance_rate?: number;
  pause_on_restriction?: boolean;
  [key: string]: unknown;
}

export interface OutreachConfig {
  id: string;
  config: OutreachConfigSettings;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  description?: string;
}
