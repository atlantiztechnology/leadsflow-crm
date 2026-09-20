import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Send,
  FileText,
  Clock,
  Trash2,
  Copy,
  ArrowRight,
  TrendingUp,
  Radio,
} from 'lucide-react';
import { campaignStorage } from '../services/campaignStorage';
import type { CampaignRecord, CampaignStatus } from '../types/campaign';
import './CampaignsListPage.css';

export function CampaignsListPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CampaignStatus>('all');

  // Load campaigns from storage
  useEffect(() => {
    setCampaigns(campaignStorage.list());
  }, []);

  // Bridge data-theme -> Tailwind dark class
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const t = root.getAttribute('data-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = t === 'dark' || (t === null && prefersDark);
      isDark ? root.classList.add('dark') : root.classList.remove('dark');
    };
    sync();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    mq.addEventListener('change', sync);
    return () => { obs.disconnect(); mq.removeEventListener('change', sync); };
  }, []);

  // Compute metrics
  const totalCampaigns = campaigns.length;
  const totalMessagesSent = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0);
  }, [campaigns]);

  const avgDeliveryRate = useMemo(() => {
    const completed = campaigns.filter(c => c.status === 'completed' && c.stats);
    if (completed.length === 0) return 98.4;
    const sum = completed.reduce((acc, c) => acc + (c.stats?.deliveryRate || 0), 0);
    return Number((sum / completed.length).toFixed(1));
  }, [campaigns]);

  const activeBatchesCount = useMemo(() => {
    return campaigns.filter(c => c.status === 'processing' || c.status === 'scheduled').length;
  }, [campaigns]);

  // Filtered list
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase())) ||
        c.template.body.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' ? true : c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, search, statusFilter]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    campaignStorage.delete(id);
    setCampaigns(campaignStorage.list());
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated = campaignStorage.duplicate(id);
    if (duplicated) {
      setCampaigns(campaignStorage.list());
    }
  };

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="campaign-status-tag status-completed">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'scheduled':
        return (
          <span className="campaign-status-tag status-scheduled">
            <Calendar size={12} /> Scheduled
          </span>
        );
      case 'processing':
        return (
          <span className="campaign-status-tag status-processing">
            <Radio size={12} className="animate-pulse" /> Sending
          </span>
        );
      case 'draft':
        return (
          <span className="campaign-status-tag status-draft">
            <FileText size={12} /> Draft
          </span>
        );
      case 'failed':
        return (
          <span className="campaign-status-tag status-failed">
            Failed
          </span>
        );
      case 'cancelled':
        return (
          <span className="campaign-status-tag status-cancelled">
            <Clock size={12} /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="campaigns-list-container">
      {/* Header */}
      <div className="campaigns-list-header">
        <div className="campaigns-list-title-group">
          <h1>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Megaphone size={18} />
            </div>
            WhatsApp Campaigns
          </h1>
          <p>Create, schedule, and track bulk WhatsApp broadcast campaigns</p>
        </div>

        <button
          onClick={() => navigate('/campaigns/new')}
          className="campaign-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
        >
          <Plus size={18} />
          Create Campaign
        </button>
      </div>

      {/* KPI Cards */}
      <div className="campaigns-kpi-grid">
        <div className="campaigns-kpi-card">
          <div className="campaigns-kpi-info">
            <span>Total Campaigns</span>
            <h2>{totalCampaigns}</h2>
          </div>
          <div className="campaigns-kpi-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
            <Megaphone size={22} />
          </div>
        </div>

        <div className="campaigns-kpi-card">
          <div className="campaigns-kpi-info">
            <span>Messages Delivered</span>
            <h2>{totalMessagesSent.toLocaleString()}</h2>
          </div>
          <div className="campaigns-kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' }}>
            <Send size={22} />
          </div>
        </div>

        <div className="campaigns-kpi-card">
          <div className="campaigns-kpi-info">
            <span>Average Delivery Rate</span>
            <h2>{avgDeliveryRate}%</h2>
          </div>
          <div className="campaigns-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="campaigns-kpi-card">
          <div className="campaigns-kpi-info">
            <span>Active & Scheduled</span>
            <h2>{activeBatchesCount}</h2>
          </div>
          <div className="campaigns-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }}>
            <Calendar size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="campaigns-filter-bar">
        <div className="campaigns-status-tabs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`campaigns-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
          >
            All ({campaigns.length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`campaigns-tab-btn ${statusFilter === 'completed' ? 'active' : ''}`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('scheduled')}
            className={`campaigns-tab-btn ${statusFilter === 'scheduled' ? 'active' : ''}`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setStatusFilter('processing')}
            className={`campaigns-tab-btn ${statusFilter === 'processing' ? 'active' : ''}`}
          >
            Sending
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`campaigns-tab-btn ${statusFilter === 'draft' ? 'active' : ''}`}
          >
            Drafts
          </button>
        </div>

        <div className="campaigns-search-box">
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search campaigns..."
            aria-label="Search campaigns"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="campaigns-table-wrap">
        <table className="campaigns-main-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Audience</th>
              <th>Status</th>
              <th>Delivery Progress</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map(camp => {
                const total = camp.stats?.total || camp.recipientCount || 0;
                const sentCount = camp.stats?.sent || 0;
                const rate = camp.stats?.deliveryRate || (total > 0 ? Math.round((sentCount / total) * 100) : 0);

                return (
                  <tr
                    key={camp.id}
                    onClick={() => navigate(`/campaigns/${camp.id}`)}
                  >
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {camp.name}
                        </div>
                        {camp.description && (
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {camp.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {camp.recipientCount} contacts
                      </span>
                    </td>
                    <td>{getStatusBadge(camp.status)}</td>
                    <td style={{ minWidth: 160 }}>
                      {camp.status === 'completed' || camp.status === 'processing' ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rate}%</span>
                            <span style={{ color: 'var(--text-muted)' }}>{sentCount}/{total}</span>
                          </div>
                          <div style={{ height: 6, width: '100%', backgroundColor: 'var(--bg-secondary)', borderRadius: 9999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${rate}%`, backgroundColor: '#10B981', borderRadius: 9999 }} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>
                        {new Date(camp.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => handleDuplicate(camp.id, e)}
                          className="campaign-row-action"
                          title="Duplicate Campaign"
                          aria-label="Duplicate Campaign"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          onClick={e => handleDelete(camp.id, e)}
                          className="campaign-row-action"
                          title="Delete Campaign"
                          aria-label="Delete Campaign"
                        >
                          <Trash2 size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/campaigns/${camp.id}`)}
                          className="campaign-row-action"
                          title="Open Campaign Builder"
                          aria-label="Open Campaign Builder"
                        >
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                  <div style={{ maxWidth: 360, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: 'var(--primary-soft)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Megaphone size={24} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      No campaigns found
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {search ? 'Try adjusting your search criteria.' : 'Create your first WhatsApp bulk outreach campaign to engage your audience.'}
                    </p>
                    <button
                      onClick={() => navigate('/campaigns/new')}
                      className="campaign-btn-primary"
                      style={{ marginTop: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
                    >
                      <Plus size={16} /> Create Campaign
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
