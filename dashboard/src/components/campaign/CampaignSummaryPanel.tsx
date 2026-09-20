import { MessageCircle, Users, Hash, CalendarClock, CheckCircle2, Activity, Loader2, ArrowUpRight } from 'lucide-react';
import type { MessageTemplate, ScheduleForm } from '../../types/campaign';
import type { BatchStatusResponse } from '../../services/api';

interface Props {
  templateName: string;
  template: MessageTemplate;
  recipientCount: number;
  schedule: ScheduleForm;
  sent: boolean;
  activeBatchStatus?: BatchStatusResponse | null;
  onOpenProgress?: () => void;
  sessionName?: string;
}

export function CampaignSummaryPanel({
  templateName,
  recipientCount,
  schedule,
  sent,
  activeBatchStatus,
  onOpenProgress,
  sessionName,
}: Props) {
  const scheduleLabel = schedule.mode === 'now'
    ? 'Immediately'
    : schedule.date && schedule.time
      ? `${schedule.date} at ${schedule.time}`
      : 'Not set';

  return (
    <aside style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="campaign-card">
        {/* Header badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.25rem 0.625rem',
            borderRadius: '9999px',
            background: 'var(--primary-soft)',
            color: 'var(--primary)',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <MessageCircle size={12} /> WhatsApp Campaign
          </span>
          {sessionName && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Via: <strong style={{ color: 'var(--text-primary)' }}>{sessionName}</strong>
            </span>
          )}
        </div>

        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Campaign Summary
        </h3>

        <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Hash size={15} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <dt style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Template</dt>
              <dd style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{templateName}</dd>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Users size={15} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <dt style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recipients</dt>
              <dd style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {recipientCount > 0 ? `${recipientCount} contacts selected` : 'None selected'}
              </dd>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <MessageCircle size={15} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <dt style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Channel</dt>
              <dd style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>WhatsApp</dd>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <CalendarClock size={15} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <dt style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Send Time</dt>
              <dd style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{scheduleLabel}</dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Active Batch Progress Card */}
      {activeBatchStatus && (
        <div style={{
          padding: '1rem',
          borderRadius: 12,
          background: 'var(--bg-card)',
          border: '1px solid var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}>
              {activeBatchStatus.status === 'processing' ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Activity size={14} />
              )}
              Batch Status: {activeBatchStatus.status}
            </span>
            {onOpenProgress && (
              <button
                onClick={onOpenProgress}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: 0,
                }}
              >
                View Live <ArrowUpRight size={12} />
              </button>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Sent: <strong>{activeBatchStatus.progress?.sent || 0}</strong> / {activeBatchStatus.progress?.total || 0}</span>
            <span>Failed: <strong>{activeBatchStatus.progress?.failed || 0}</strong></span>
          </div>
        </div>
      )}

      {/* Success banner */}
      {sent && !activeBatchStatus && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '1rem',
          borderRadius: 12,
          background: 'var(--primary-soft)',
          border: '1px solid var(--primary)',
          color: 'var(--primary)'
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Campaign queued!</p>
            <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.75rem', opacity: 0.9 }}>Messages dispatched to bulk queue.</p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{
        padding: '1rem',
        borderRadius: 12,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)'
      }}>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>💡 Tips</p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <li>Use variables like {"{{name}}"} and {"{{company}}"} for personalisation</li>
          <li>Pacing delays prevent WhatsApp account blocks</li>
          <li>Keep messages concise and engaging</li>
        </ul>
      </div>
    </aside>
  );
}

