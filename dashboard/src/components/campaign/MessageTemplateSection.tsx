import { useRef, useCallback } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import type { MessageTemplate } from '../../types/campaign';

const TEMPLATES: MessageTemplate[] = [
  {
    id: 't1',
    name: 'Website Outreach',
    body: "Hi {{name}},\n\nI came across {{company}} and was really impressed by what you're building.\n\nWe help businesses like yours grow faster with targeted outreach — would love to show you how.\n\nAre you open to a quick 15-min call this week?\n\nBest,\nThe Team",
  },
  {
    id: 't2',
    name: 'Follow-up',
    body: "Hi {{name}},\n\nJust following up on my earlier message. We'd love to connect with {{company}} and explore how we can help.\n\nLet me know if you have 10 minutes this week!\n\nThanks",
  },
  {
    id: 't3',
    name: 'Product Demo Invite',
    body: "Hey {{name}},\n\nWe just launched some exciting features I think {{company}} would love.\n\nCan I show you a quick demo? Takes only 20 minutes.\n\nPhone: {{phone}}",
  },
];

const VARIABLES = ['{{name}}', '{{company}}', '{{phone}}', '{{website}}'];

interface Props {
  template: MessageTemplate;
  onChange: (t: MessageTemplate) => void;
}

export function MessageTemplateSection({ template, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCount = template.body.length;
  const MAX_CHARS = 1000;

  const insertVariable = useCallback((variable: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newBody = template.body.slice(0, start) + variable + template.body.slice(end);
    onChange({ ...template, body: newBody });
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + variable.length;
      el.focus();
    });
  }, [template, onChange]);

  const selectTemplate = (t: MessageTemplate) => onChange(t);

  return (
    <div className="campaign-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="campaign-section-title">Message Template</h2>
          <p className="campaign-section-subtitle">Compose your WhatsApp message</p>
        </div>
        <button
          className="campaign-btn-primary"
          style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
        >
          <Plus size={14} /> Create Template
        </button>
      </div>

      {/* Template selector */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
          Template
        </label>
        <div style={{ position: 'relative' }}>
          <select
            aria-label="Message template"
            value={template.id}
            onChange={e => {
              const t = TEMPLATES.find(t => t.id === e.target.value);
              if (t) selectTemplate(t);
            }}
            className="campaign-input"
            style={{ appearance: 'none', paddingRight: '2rem', cursor: 'pointer' }}
          >
            {TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Textarea */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Message</label>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: charCount > MAX_CHARS ? 'var(--error)' : 'var(--text-muted)' }}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
        <textarea
          ref={textareaRef}
          rows={7}
          value={template.body}
          onChange={e => onChange({ ...template, body: e.target.value })}
          maxLength={MAX_CHARS}
          className="campaign-input"
          style={{ resize: 'vertical', lineHeight: 1.6 }}
          placeholder="Type your message here..."
        />
      </div>

      {/* Variable badges */}
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Insert variable</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {VARIABLES.map(v => (
            <button
              key={v}
              onClick={() => insertVariable(v)}
              className="variable-chip"
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
