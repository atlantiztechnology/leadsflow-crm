import { Clock, Calendar, Globe, Send, Bookmark, ShieldCheck, Loader2 } from 'lucide-react';
import type { ScheduleForm } from '../../types/campaign';

interface Props {
  schedule: ScheduleForm;
  onChange: (s: ScheduleForm) => void;
  onSaveDraft: () => void;
  onSend: () => void;
  recipientCount: number;
  isSending?: boolean;
  delayBetweenMessages?: number;
  onDelayChange?: (ms: number) => void;
  randomizeDelay?: boolean;
  onRandomizeDelayChange?: (val: boolean) => void;
}

const TIMEZONES = [
  'Asia/Kolkata (IST, UTC+5:30)',
  'America/New_York (EST, UTC-5)',
  'America/Los_Angeles (PST, UTC-8)',
  'Europe/London (GMT, UTC+0)',
  'Europe/Paris (CET, UTC+1)',
  'Asia/Singapore (SGT, UTC+8)',
  'Asia/Tokyo (JST, UTC+9)',
  'Australia/Sydney (AEST, UTC+10)',
];

export function ScheduleSection({
  schedule,
  onChange,
  onSaveDraft,
  onSend,
  recipientCount,
  isSending = false,
  delayBetweenMessages = 3000,
  onDelayChange,
  randomizeDelay = true,
  onRandomizeDelayChange,
}: Props) {
  const isScheduled = schedule.mode === 'scheduled';
  const canSend = recipientCount > 0 && !isSending;

  return (
    <div className="campaign-card">
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 className="campaign-section-title">Schedule & Pacing</h2>
        <p className="campaign-section-subtitle">Configure dispatch time and anti-ban message pacing</p>
      </div>

      {/* Mode selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          borderRadius: 12,
          border: `2px solid ${!isScheduled ? 'var(--primary)' : 'var(--border)'}`,
          background: !isScheduled ? 'var(--primary-soft)' : 'var(--bg-secondary)',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}>
          <input
            type="radio"
            name="schedule-mode"
            value="now"
            checked={!isScheduled}
            onChange={() => onChange({ ...schedule, mode: 'now' })}
            style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Send now</p>
            <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Start batch dispatch immediately</p>
          </div>
        </label>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          borderRadius: 12,
          border: `2px solid ${isScheduled ? 'var(--primary)' : 'var(--border)'}`,
          background: isScheduled ? 'var(--primary-soft)' : 'var(--bg-secondary)',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}>
          <input
            type="radio"
            name="schedule-mode"
            value="scheduled"
            checked={isScheduled}
            onChange={() => onChange({ ...schedule, mode: 'scheduled' })}
            style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Schedule</p>
            <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pick date & time</p>
          </div>
        </label>
      </div>

      {/* Date / time / tz */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
        opacity: isScheduled ? 1 : 0.4,
        pointerEvents: isScheduled ? 'auto' : 'none',
        transition: 'opacity 0.15s ease'
      }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
            <Calendar size={12} /> Date
          </label>
          <input
            type="date"
            aria-label="Campaign send date"
            value={schedule.date}
            disabled={!isScheduled}
            onChange={e => onChange({ ...schedule, date: e.target.value })}
            className="campaign-input"
          />
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
            <Clock size={12} /> Time
          </label>
          <input
            type="time"
            aria-label="Campaign send time"
            value={schedule.time}
            disabled={!isScheduled}
            onChange={e => onChange({ ...schedule, time: e.target.value })}
            className="campaign-input"
          />
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
            <Globe size={12} /> Timezone
          </label>
          <select
            aria-label="Campaign timezone"
            value={schedule.timezone}
            disabled={!isScheduled}
            onChange={e => onChange({ ...schedule, timezone: e.target.value })}
            className="campaign-input"
          >
            {TIMEZONES.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Anti-Ban Pacing Configuration */}
      <div style={{
        padding: '1rem',
        borderRadius: 12,
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Anti-Ban Safety Controls
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Delay between messages
            </label>
            <select
              aria-label="Delay between messages"
              value={delayBetweenMessages}
              onChange={e => onDelayChange?.(Number(e.target.value))}
              className="campaign-input"
              style={{ fontSize: '0.8125rem' }}
            >
              <option value={2000}>2 seconds (Fast)</option>
              <option value={3000}>3 seconds (Standard Recommended)</option>
              <option value={5000}>5 seconds (Safe)</option>
              <option value={10000}>10 seconds (High Protection)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={randomizeDelay}
                onChange={e => onRandomizeDelayChange?.(e.target.checked)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              Add random jitter (+0 to 2s) to emulate natural human typing
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onSaveDraft}
          className="campaign-btn-secondary"
        >
          <Bookmark size={14} /> Save draft
        </button>
        <button
          onClick={onSend}
          disabled={!canSend}
          className="campaign-btn-primary"
        >
          {isSending ? (
            <>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Queueing Batch...
            </>
          ) : (
            <>
              <Send size={14} />
              {isScheduled ? 'Schedule campaign' : 'Send campaign now'}
            </>
          )}
        </button>
        {!canSend && !isSending && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select at least one contact to send</span>
        )}
      </div>
    </div>
  );
}

