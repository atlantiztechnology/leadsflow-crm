import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import type { Contact, ContactStatus } from '../../types/campaign';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contact: Contact) => void;
}

const AVATAR_COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#EA580C',
  '#D97706', '#65A30D', '#16A34A', '#0D9488', '#0284C7',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (!parts[0]) return 'WA';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function AddContactModal({ isOpen, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<ContactStatus>('New');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('Contact name is required.');
      return;
    }
    if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, '').length < 6) {
      setError('Please provide a valid phone number (at least 6 digits).');
      return;
    }

    const newContact: Contact = {
      id: `manual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      initials: getInitials(cleanName),
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      company: company.trim() || 'No Company',
      phone: cleanPhone,
      status: status || 'New',
    };

    onAdd(newContact);
    setName('');
    setPhone('');
    setCompany('');
    setStatus('New');
    setError(null);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
    >
      <div
        className="campaign-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: 0,
          overflow: 'hidden',
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
                backgroundColor: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Add Single Contact
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Add a new recipient to your campaign audience
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div
              style={{
                padding: '0.625rem 0.875rem',
                borderRadius: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#EF4444',
                fontSize: '0.8125rem',
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="contactName" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Full Name / Contact Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              id="contactName"
              type="text"
              placeholder="e.g. Priya Sharma or Royal Unisex Salon"
              value={name}
              onChange={e => setName(e.target.value)}
              className="campaign-input"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="contactPhone" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              WhatsApp Phone Number <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              id="contactPhone"
              type="tel"
              placeholder="e.g. +91 98765 43210 or 919876543210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="campaign-input"
              required
            />
          </div>

          <div>
            <label htmlFor="contactCompany" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Company / Business Name (Optional)
            </label>
            <input
              id="contactCompany"
              type="text"
              placeholder="e.g. Bloom Enterprises (defaults to 'No Company')"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="campaign-input"
            />
          </div>

          <div>
            <label htmlFor="contactStatus" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Lead Status
            </label>
            <select
              id="contactStatus"
              aria-label="Lead Status"
              value={status}
              onChange={e => setStatus(e.target.value as ContactStatus)}
              className="campaign-input"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Converted">Converted</option>
            </select>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '0.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="campaign-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="campaign-btn-primary"
            >
              Add to Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
