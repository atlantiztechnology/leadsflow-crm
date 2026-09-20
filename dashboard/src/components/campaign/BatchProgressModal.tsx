import { CheckCircle, XCircle, Clock, AlertTriangle, X, Loader2, StopCircle, CheckCircle2 } from 'lucide-react';
import type { BatchStatusResponse } from '../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  batchStatus: BatchStatusResponse | null;
  onCancelBatch: () => void;
  isCancelling: boolean;
  sessionName: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Queued', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)' },
  processing: { label: 'Sending in Progress', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  completed: { label: 'Completed', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  cancelled: { label: 'Cancelled', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  failed: { label: 'Failed', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
};

export function BatchProgressModal({
  isOpen,
  onClose,
  batchStatus,
  onCancelBatch,
  isCancelling,
  sessionName,
}: Props) {
  if (!isOpen || !batchStatus) return null;

  const status = batchStatus.status || 'processing';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.processing;
  const isTerminal = status === 'completed' || status === 'cancelled' || status === 'failed';

  const total = batchStatus.progress?.total || 0;
  const sent = batchStatus.progress?.sent || 0;
  const failed = batchStatus.progress?.failed || 0;
  const pending = batchStatus.progress?.pending || 0;
  const cancelled = batchStatus.progress?.cancelled || 0;
  const percent = total > 0 ? Math.round(((sent + failed + cancelled) / total) * 100) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
    >
      <div
        className="campaign-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: config.bg,
                color: config.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {!isTerminal ? (
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              ) : status === 'completed' ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Campaign Dispatch
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Session: <strong style={{ color: 'var(--text-primary)' }}>{sessionName}</strong> • Batch: {batchStatus.batchId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status badge and progress % */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: config.bg,
                color: config.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: config.color,
                }}
              />
              {config.label}
            </span>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {percent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '10px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '9999px',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div
              style={{
                width: `${total > 0 ? (sent / total) * 100 : 0}%`,
                backgroundColor: '#10B981',
                transition: 'width 0.3s ease',
              }}
            />
            <div
              style={{
                width: `${total > 0 ? (failed / total) * 100 : 0}%`,
                backgroundColor: '#EF4444',
                transition: 'width 0.3s ease',
              }}
            />
            <div
              style={{
                width: `${total > 0 ? (cancelled / total) * 100 : 0}%`,
                backgroundColor: '#F59E0B',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Counters Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {total}
              </p>
            </div>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#10B981' }}>Sent</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.125rem', fontWeight: 700, color: '#10B981' }}>
                {sent}
              </p>
            </div>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>Failed</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.125rem', fontWeight: 700, color: '#EF4444' }}>
                {failed}
              </p>
            </div>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {pending}
              </p>
            </div>
          </div>

          {/* Results List / Activity Stream */}
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Delivery Logs ({batchStatus.results?.length || 0})
            </h4>
            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                fontSize: '0.8125rem',
              }}
            >
              {batchStatus.results && batchStatus.results.length > 0 ? (
                batchStatus.results.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderBottom: i < batchStatus.results.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                      {r.chatId}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {r.status === 'sent' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#10B981', fontWeight: 600 }}>
                          <CheckCircle size={13} /> Sent
                        </span>
                      )}
                      {r.status === 'failed' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#EF4444', fontWeight: 600 }} title={r.error?.message}>
                          <XCircle size={13} /> Failed
                        </span>
                      )}
                      {r.status === 'cancelled' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#F59E0B', fontWeight: 600 }}>
                          <Clock size={13} /> Cancelled
                        </span>
                      )}
                      {r.status === 'pending' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-muted)' }}>
                          <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Queued
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Starting batch processing with anti-ban delay...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {!isTerminal ? (
            <button
              onClick={onCancelBatch}
              disabled={isCancelling}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #EF4444',
                backgroundColor: 'transparent',
                color: '#EF4444',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isCancelling ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <StopCircle size={14} />}
              Stop Campaign
            </button>
          ) : (
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Batch finished
            </div>
          )}

          <button
            onClick={onClose}
            className="campaign-btn-secondary"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            {isTerminal ? 'Close' : 'Hide & Run in Background'}
          </button>
        </div>
      </div>
    </div>
  );
}
