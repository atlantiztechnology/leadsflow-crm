import { useState, useRef, useCallback, type ChangeEvent } from 'react';
import { Search, Upload, ChevronLeft, ChevronRight, X, PhoneCall, Loader2, UserPlus } from 'lucide-react';
import { AddContactModal } from './AddContactModal';
import type { Contact } from '../../types/campaign';

interface Props {
  contacts: Contact[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClear: () => void;
  onImportContacts?: (newContacts: Contact[]) => void;
  onLoadSessionContacts?: () => void;
  isLoadingSessionContacts?: boolean;
  hasActiveSession?: boolean;
}

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<string, string> = {
  New:        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Contacted:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Interested: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Converted:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const AVATAR_COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#EA580C',
  '#D97706', '#65A30D', '#16A34A', '#0D9488', '#0284C7',
];

function getInitials(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
  if (!parts[0]) return 'WA';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

/** Helper to parse a single CSV line with quote handling */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === ';' || char === '\t') && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
  return result;
}

export function ContactsSection({
  contacts,
  selectedIds,
  onToggle,
  onSelectAll,
  onClear,
  onImportContacts,
  onLoadSessionContacts,
  isLoadingSessionContacts = false,
  hasActiveSession = false,
}: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAddSingleContact = (newContact: Contact) => {
    if (onImportContacts) {
      onImportContacts([newContact]);
    }
    onSelectAll([newContact.id]);
  };

  const handleCsvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length === 0) return;

      const newContacts: Contact[] = [];
      const headerCols = parseCsvLine(lines[0]).map(c => c.toLowerCase());
      const hasHeader = headerCols.some(h => /name|phone|company|mobile|contact|business/i.test(h));

      // Detect header column indices
      let nameIdx = -1;
      let phoneIdx = -1;
      let companyIdx = -1;
      let categoryIdx = -1;
      let cityIdx = -1;
      let areaIdx = -1;

      if (hasHeader) {
        headerCols.forEach((h, idx) => {
          if (nameIdx === -1 && /business name|contact name|^name$/i.test(h)) nameIdx = idx;
          if (phoneIdx === -1 && /phone|mobile|whatsapp|number/i.test(h)) phoneIdx = idx;
          if (companyIdx === -1 && /company|business/i.test(h) && idx !== nameIdx) companyIdx = idx;
          if (categoryIdx === -1 && /category|industry/i.test(h)) categoryIdx = idx;
          if (cityIdx === -1 && /city|location/i.test(h)) cityIdx = idx;
          if (areaIdx === -1 && /area|address/i.test(h)) areaIdx = idx;
        });
      }

      const dataLines = hasHeader ? lines.slice(1) : lines;

      dataLines.forEach((line, idx) => {
        const cols = parseCsvLine(line);
        if (cols.length === 0 || !cols.some(Boolean)) return;

        let name = '';
        let phone = '';
        let company = '';

        if (hasHeader && phoneIdx !== -1) {
          name = nameIdx !== -1 ? cols[nameIdx] : `Lead ${idx + 1}`;
          phone = cols[phoneIdx] || '';
          if (companyIdx !== -1 && cols[companyIdx]) {
            company = cols[companyIdx];
          } else if (categoryIdx !== -1 && cols[categoryIdx]) {
            const loc = [cols[cityIdx], cols[areaIdx]].filter(Boolean).join(', ');
            company = loc ? `${cols[categoryIdx]} (${loc})` : cols[categoryIdx];
          }
        } else if (cols.length >= 3) {
          name = cols[0];
          company = cols[1];
          phone = cols[2];
        } else if (cols.length === 2) {
          name = cols[0];
          phone = cols[1];
        } else {
          phone = cols[0];
          name = `Lead ${idx + 1}`;
        }

        // Clean phone digits
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 6) return;

        const id = `import_${Date.now()}_${idx}`;
        newContacts.push({
          id,
          name: name || `Contact ${cleanPhone}`,
          initials: getInitials(name || cleanPhone),
          avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
          company: company || 'No Company',
          phone: cleanPhone,
          status: 'New',
        });
      });

      if (newContacts.length > 0 && onImportContacts) {
        onImportContacts(newContacts);
        // Auto-select newly imported contacts
        onSelectAll(newContacts.map(c => c.id));
      }

      if (fileRef.current) fileRef.current.value = '';
    };

    reader.readAsText(file);
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageContacts = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageIds = pageContacts.map(c => c.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  const handleSelectAll = () => {
    if (allPageSelected) {
      pageIds.forEach(id => selectedIds.has(id) && onToggle(id));
    } else {
      const missing = pageIds.filter(id => !selectedIds.has(id));
      onSelectAll(missing);
    }
  };

  return (
    <div className="campaign-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 className="campaign-section-title">Select Contacts</h2>
          <p className="campaign-section-subtitle">Choose recipients for this campaign</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {selectedIds.size > 0 && (
            <>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                fontSize: '0.8125rem',
                fontWeight: 600
              }}>
                {selectedIds.size} selected
              </span>
              <button
                onClick={onClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <X size={14} /> Clear
              </button>
            </>
          )}

          {hasActiveSession && onLoadSessionContacts && (
            <button
              onClick={onLoadSessionContacts}
              disabled={isLoadingSessionContacts}
              className="campaign-btn-secondary"
              title="Load saved contacts from active WhatsApp session"
            >
              {isLoadingSessionContacts ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <PhoneCall size={14} />
              )}
              Load WhatsApp Contacts
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="campaign-btn-primary"
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}
          >
            <UserPlus size={14} /> Add Contact
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="campaign-btn-secondary"
          >
            <Upload size={14} /> Import CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={handleCsvUpload}
            aria-label="Import contacts from CSV"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Search & Quick Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search 50 leads by name, company, or phone..."
            aria-label="Search contacts"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="campaign-input"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="campaign-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
        >
          <UserPlus size={15} /> + Add Contact
        </button>
      </div>

      {/* Table */}
      <div className="campaign-table-container">
        <table className="campaign-table">
          <thead>
            <tr>
              <th style={{ width: 40, padding: '0.75rem 1rem' }}>
                <input
                  type="checkbox"
                  aria-label="Select all contacts on this page"
                  checked={allPageSelected}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </th>
              <th>Name</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageContacts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {search ? `No contacts matching "${search}"` : 'No contacts in this list.'}
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="campaign-btn-primary"
                      style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', marginTop: '0.25rem' }}
                    >
                      <UserPlus size={14} /> + Add Contact Now
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              pageContacts.map(contact => (
                <tr
                  key={contact.id}
                  onClick={() => onToggle(contact.id)}
                  className={selectedIds.has(contact.id) ? 'selected-row' : ''}
                  style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                >
                  <td style={{ width: 40, padding: '0.75rem 1rem' }}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${contact.name}`}
                      checked={selectedIds.has(contact.id)}
                      onChange={() => onToggle(contact.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: contact.avatarColor,
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          flexShrink: 0
                        }}
                      >
                        {contact.initials}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{contact.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{contact.company}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{contact.phone}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[contact.status] ?? ''}`}>
                      {contact.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1rem',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)'
      }}>
        <span>Showing {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            disabled={safePage <= 1}
            onClick={() => setPage(p => p - 1)}
            className="campaign-btn-secondary"
            style={{ padding: '0.375rem 0.5rem' }}
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pg = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(totalPages - 4, safePage - 2)) + i;
            return (
              <button
                key={pg}
                onClick={() => setPage(pg)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: pg === safePage ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: pg === safePage ? '#FFFFFF' : 'var(--text-primary)',
                  transition: 'background 0.15s ease'
                }}
              >
                {pg}
              </button>
            );
          })}
          <button
            disabled={safePage >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="campaign-btn-secondary"
            style={{ padding: '0.375rem 0.5rem' }}
            aria-label="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSingleContact}
      />
    </div>
  );
}
