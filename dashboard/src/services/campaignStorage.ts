import { INITIAL_MOCK_CAMPAIGNS } from '../data/mockCampaigns';
import type { CampaignRecord } from '../types/campaign';

const STORAGE_KEY = 'openwa_campaigns_store_v1';

export const campaignStorage = {
  list: (): CampaignRecord[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CAMPAIGNS));
        return INITIAL_MOCK_CAMPAIGNS;
      }
      return JSON.parse(stored) as CampaignRecord[];
    } catch {
      return INITIAL_MOCK_CAMPAIGNS;
    }
  },

  getById: (id: string): CampaignRecord | undefined => {
    const campaigns = campaignStorage.list();
    return campaigns.find(c => c.id === id);
  },

  save: (campaign: CampaignRecord): void => {
    try {
      const campaigns = campaignStorage.list();
      const index = campaigns.findIndex(c => c.id === campaign.id);
      if (index >= 0) {
        campaigns[index] = { ...campaign, updatedAt: new Date().toISOString() };
      } else {
        campaigns.unshift({ ...campaign, updatedAt: new Date().toISOString() });
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    } catch (e) {
      console.error('Failed to save campaign to storage:', e);
    }
  },

  delete: (id: string): void => {
    try {
      const campaigns = campaignStorage.list();
      const filtered = campaigns.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete campaign from storage:', e);
    }
  },

  duplicate: (id: string): CampaignRecord | null => {
    const existing = campaignStorage.getById(id);
    if (!existing) return null;

    const dup: CampaignRecord = {
      ...existing,
      id: `camp_${Date.now().toString(36)}`,
      name: `${existing.name} (Copy)`,
      status: 'draft',
      batchId: undefined,
      stats: {
        total: existing.recipientCount,
        sent: 0,
        failed: 0,
        pending: existing.recipientCount,
        deliveryRate: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    campaignStorage.save(dup);
    return dup;
  },
};
