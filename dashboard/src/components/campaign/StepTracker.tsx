import { Check } from 'lucide-react';

const STEPS = [
  { n: 1, label: 'Select Contacts' },
  { n: 2, label: 'Message Template' },
  { n: 3, label: 'Schedule' },
  { n: 4, label: 'Review & Send' },
];

interface Props {
  current: number;
}

export function StepTracker({ current }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {STEPS.map((step, idx) => {
        const done = current > step.n;
        const active = current === step.n;
        return (
          <div key={step.n} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  background: done || active ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: done || active ? '#FFFFFF' : 'var(--text-muted)',
                  border: done || active ? 'none' : '1px solid var(--border)',
                  boxShadow: active ? '0 0 0 4px rgba(15, 157, 131, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {done ? <Check size={13} strokeWidth={3} /> : step.n}
              </div>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 500,
                  whiteSpace: 'nowrap',
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  margin: '0 0.75rem',
                  background: done ? 'var(--primary)' : 'var(--border)'
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
