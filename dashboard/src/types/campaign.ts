// ---------------------------------------------------------------------------
// Campaign feature — shared TypeScript types
// ---------------------------------------------------------------------------

export type ContactStatus = 'New' | 'Contacted' | 'Interested' | 'Converted';

export interface Contact {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  company: string;
  phone: string;
  status: ContactStatus;
}

export interface MessageTemplate {
  id: string;
  name: string;
  body: string;
}

export type ScheduleMode = 'now' | 'scheduled';

export interface ScheduleForm {
  mode: ScheduleMode;
  date: string;    // ISO date string  "2025-01-15"
  time: string;    // "HH:MM"
  timezone: string;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  deliveryRate: number;
}

export interface CampaignRecord {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  template: MessageTemplate;
  recipientCount: number;
  recipientIds: string[];
  schedule: ScheduleForm;
  pacing: {
    delayBetweenMessages: number;
    randomizeDelay: boolean;
  };
  sessionId: string;
  sessionName?: string;
  batchId?: string;
  stats?: CampaignStats;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignState {
  selectedContactIds: Set<string>;
  template: MessageTemplate;
  schedule: ScheduleForm;
  currentStep: 1 | 2 | 3 | 4;
}
