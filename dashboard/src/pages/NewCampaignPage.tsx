import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Megaphone, Smartphone, AlertCircle, Edit2, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_CONTACTS } from '../data/mockContacts';
import { ContactsSection } from '../components/campaign/ContactsSection';
import { MessageTemplateSection } from '../components/campaign/MessageTemplateSection';
import { ScheduleSection } from '../components/campaign/ScheduleSection';
import { CampaignSummaryPanel } from '../components/campaign/CampaignSummaryPanel';
import { StepTracker } from '../components/campaign/StepTracker';
import { BatchProgressModal } from '../components/campaign/BatchProgressModal';
import { useSessionsQuery } from '../hooks/queries';
import { messageApi, contactApi, type BatchStatusResponse, type SendBulkPayload } from '../services/api';
import { campaignStorage } from '../services/campaignStorage';
import type { Contact, MessageTemplate, ScheduleForm, CampaignRecord } from '../types/campaign';
import './NewCampaignPage.css';

const DEFAULT_TEMPLATE: MessageTemplate = {
  id: 't1',
  name: 'Website Outreach',
  body: "Hi {{name}},\n\nI came across {{company}} and was really impressed by what you're building.\n\nWe help businesses like yours grow faster with targeted outreach — would love to show you how.\n\nAre you open to a quick 15-min call this week?\n\nBest,\nThe Team",
};

const DEFAULT_SCHEDULE: ScheduleForm = {
  mode: 'now',
  date: '',
  time: '',
  timezone: 'Asia/Kolkata (IST, UTC+5:30)',
};

function formatChatId(phone: string): string {
  if (phone.includes('@')) return phone;
  const digits = phone.replace(/[^0-9]/g, '');
  return `${digits}@c.us`;
}

export function NewCampaignPage() {
  const navigate = useNavigate();
  const { id: routeCampaignId } = useParams<{ id?: string }>();
  const { data: sessions = [], isLoading: isLoadingSessions } = useSessionsQuery();

  const [campaignId, setCampaignId] = useState<string>(() => routeCampaignId || `camp_${Date.now().toString(36)}`);
  const [campaignName, setCampaignName] = useState<string>('New Outreach Campaign');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [contactsList, setContactsList] = useState<Contact[]>(MOCK_CONTACTS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState<MessageTemplate>(DEFAULT_TEMPLATE);
  const [schedule, setSchedule] = useState<ScheduleForm>(DEFAULT_SCHEDULE);
  const [delayBetweenMessages, setDelayBetweenMessages] = useState<number>(3000);
  const [randomizeDelay, setRandomizeDelay] = useState<boolean>(true);

  // Bulk dispatch states
  const [isSending, setIsSending] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<BatchStatusResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoadingSessionContacts, setIsLoadingSessionContacts] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const pollTimerRef = useRef<number | null>(null);

  // Load existing campaign if editing
  useEffect(() => {
    if (routeCampaignId) {
      const existing = campaignStorage.getById(routeCampaignId);
      if (existing) {
        setCampaignId(existing.id);
        setCampaignName(existing.name);
        setTemplate(existing.template);
        setSchedule(existing.schedule);
        if (existing.recipientIds && existing.recipientIds.length > 0) {
          setSelectedIds(new Set(existing.recipientIds));
        }
        if (existing.pacing) {
          setDelayBetweenMessages(existing.pacing.delayBetweenMessages);
          setRandomizeDelay(existing.pacing.randomizeDelay);
        }
        if (existing.sessionId) {
          setSelectedSessionId(existing.sessionId);
        }
        if (existing.batchId) {
          setActiveBatchId(existing.batchId);
        }
      }
    }
  }, [routeCampaignId]);

  // Auto-select ready session or first session
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const readySession = sessions.find(s => s.status === 'ready');
      setSelectedSessionId(readySession ? readySession.id : sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

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

  // Cleanup polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const isSessionReady = selectedSession?.status === 'ready';

  const toggleContact = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setSelectedIds(new Set()), []);

  const handleImportContacts = useCallback((imported: Contact[]) => {
    setContactsList(prev => {
      const existingPhones = new Set(prev.map(c => c.phone.replace(/[^0-9]/g, '')));
      const uniqueNew = imported.filter(c => !existingPhones.has(c.phone.replace(/[^0-9]/g, '')));
      return [...uniqueNew, ...prev];
    });
  }, []);

  const handleLoadSessionContacts = async () => {
    if (!selectedSessionId) return;
    setIsLoadingSessionContacts(true);
    try {
      const waContacts = await contactApi.list(selectedSessionId);
      const converted: Contact[] = waContacts.map(c => ({
        id: `wa_${c.id}`,
        name: c.name || c.pushName || `Contact ${c.number}`,
        initials: (c.name || c.pushName || c.number).slice(0, 2).toUpperCase(),
        avatarColor: '#10B981',
        company: 'WhatsApp Contact',
        phone: c.number || c.id.replace('@c.us', ''),
        status: 'Contacted',
      }));

      handleImportContacts(converted);
    } catch (err) {
      console.error('Failed to load session contacts:', err);
    } finally {
      setIsLoadingSessionContacts(false);
    }
  };

  const saveCampaignState = (status: CampaignRecord['status'], batchIdVal?: string, statsVal?: CampaignRecord['stats']) => {
    const record: CampaignRecord = {
      id: campaignId,
      name: campaignName || 'WhatsApp Campaign',
      description: `Targeting ${selectedIds.size} contacts • Template: ${template.name}`,
      status,
      template,
      recipientCount: selectedIds.size,
      recipientIds: Array.from(selectedIds),
      schedule,
      pacing: {
        delayBetweenMessages,
        randomizeDelay,
      },
      sessionId: selectedSessionId,
      sessionName: selectedSession?.name || selectedSessionId,
      batchId: batchIdVal || activeBatchId || undefined,
      stats: statsVal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    campaignStorage.save(record);
  };

  const handleSaveDraft = () => {
    saveCampaignState('draft');
    navigate('/campaigns');
  };

  const pollBatchProgress = useCallback((sessionId: string, batchId: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    const check = async () => {
      try {
        const status = await messageApi.getBatchStatus(sessionId, batchId);
        setBatchStatus(status);

        const total = status.progress?.total || 0;
        const sentCount = status.progress?.sent || 0;
        const failedCount = status.progress?.failed || 0;
        const pendingCount = status.progress?.pending || 0;
        const rate = total > 0 ? Number(((sentCount / total) * 100).toFixed(1)) : 0;

        if (status.status === 'completed' || status.status === 'cancelled' || status.status === 'failed') {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setIsSending(false);

          saveCampaignState(status.status as CampaignRecord['status'], batchId, {
            total,
            sent: sentCount,
            failed: failedCount,
            pending: pendingCount,
            deliveryRate: rate,
          });
        }
      } catch (err) {
        console.error('Batch polling error:', err);
      }
    };

    void check();
    pollTimerRef.current = window.setInterval(check, 1500);
  }, [campaignId, campaignName, template, selectedIds, schedule, delayBetweenMessages, randomizeDelay, selectedSessionId, selectedSession]);

  const handleSend = async () => {
    if (selectedIds.size === 0) return;
    if (!selectedSessionId) {
      setSendError('Please select a WhatsApp session to dispatch the campaign.');
      return;
    }

    setSendError(null);
    setIsSending(true);

    const selectedContacts = contactsList.filter(c => selectedIds.has(c.id));

    const payload: SendBulkPayload = {
      batchId: `camp_${Date.now().toString(36)}`,
      messages: selectedContacts.map(c => ({
        chatId: formatChatId(c.phone),
        type: 'text',
        content: {
          text: template.body,
        },
        variables: {
          name: c.name,
          company: c.company || '',
          phone: c.phone || '',
        },
      })),
      options: {
        delayBetweenMessages,
        randomizeDelay,
        stopOnError: false,
      },
    };

    try {
      const response = await messageApi.sendBulk(selectedSessionId, payload);
      setActiveBatchId(response.batchId);
      setSent(true);
      setIsModalOpen(true);

      // Save as processing in storage
      saveCampaignState('processing', response.batchId, {
        total: selectedContacts.length,
        sent: 0,
        failed: 0,
        pending: selectedContacts.length,
        deliveryRate: 0,
      });

      // Initial batch status state
      setBatchStatus({
        batchId: response.batchId,
        status: 'pending',
        progress: {
          total: selectedContacts.length,
          sent: 0,
          failed: 0,
          pending: selectedContacts.length,
          cancelled: 0,
        },
        results: [],
      });

      // Start live polling
      pollBatchProgress(selectedSessionId, response.batchId);
    } catch (err: unknown) {
      setIsSending(false);
      const msg = err instanceof Error ? err.message : 'Failed to launch bulk campaign';
      setSendError(msg);
    }
  };

  const handleCancelBatch = async () => {
    if (!selectedSessionId || !activeBatchId) return;
    setIsCancelling(true);
    try {
      const updated = await messageApi.cancelBatch(selectedSessionId, activeBatchId);
      setBatchStatus(updated);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      saveCampaignState('cancelled', activeBatchId);
    } catch (err) {
      console.error('Failed to cancel batch:', err);
    } finally {
      setIsCancelling(false);
      setIsSending(false);
    }
  };

  // Derive current step from state
  const step = selectedIds.size === 0 ? 1 : template.body.trim().length < 10 ? 2 : 3;

  return (
    <div className="campaigns-page">
      <div className="campaigns-page-inner">

        {/* Page header */}
        <div className="campaigns-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/campaigns')}
              className="campaign-back-btn"
              title="Back to Campaigns"
              aria-label="Back to Campaigns"
            >
              <ArrowLeft size={18} />
            </button>
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
            <div>
              {isEditingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={e => setCampaignName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                    autoFocus
                    className="campaign-input"
                    style={{ fontSize: '1.125rem', fontWeight: 700, padding: '0.25rem 0.5rem' }}
                    aria-label="Campaign Name"
                  />
                  <button
                    onClick={() => setIsEditingName(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                    aria-label="Save Name"
                  >
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h1 className="campaign-header-title">{campaignName}</h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                    aria-label="Edit Campaign Name"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
              <p className="campaign-header-desc">Create and send a WhatsApp bulk campaign</p>
            </div>
          </div>

          {/* Session Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.75rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
            }}>
              <Smartphone size={16} style={{ color: isSessionReady ? '#10B981' : 'var(--text-muted)' }} />
              <select
                aria-label="Sender WhatsApp Session"
                value={selectedSessionId}
                onChange={e => setSelectedSessionId(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {sessions.length === 0 ? (
                  <option value="">No sessions available</option>
                ) : (
                  sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.phone || s.status})
                    </option>
                  ))
                )}
              </select>
              {isSessionReady && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                  }}
                  title="Session Ready & Connected"
                />
              )}
            </div>
          </div>
        </div>

        {/* Warning if no ready session */}
        {!isLoadingSessions && !isSessionReady && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#D97706',
            fontSize: '0.8125rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>
                The selected session is <strong>{selectedSession?.status || 'disconnected'}</strong>. Messages will queue and send once the session is connected.
              </span>
            </div>
            <button
              onClick={() => navigate('/sessions')}
              style={{
                background: 'none',
                border: 'none',
                color: '#D97706',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Manage Sessions
            </button>
          </div>
        )}

        {/* Error Alert */}
        {sendError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            fontSize: '0.8125rem',
          }}>
            <AlertCircle size={16} />
            <span>{sendError}</span>
          </div>
        )}

        {/* Step tracker */}
        <div className="campaigns-step-tracker campaign-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
          <StepTracker current={step} />
        </div>

        {/* Main grid */}
        <div className="campaigns-grid">
          {/* Left column — form sections */}
          <div className="campaigns-form-col">
            <ContactsSection
              contacts={contactsList}
              selectedIds={selectedIds}
              onToggle={toggleContact}
              onSelectAll={selectAll}
              onClear={clearAll}
              onImportContacts={handleImportContacts}
              onLoadSessionContacts={handleLoadSessionContacts}
              isLoadingSessionContacts={isLoadingSessionContacts}
              hasActiveSession={isSessionReady}
            />
            <MessageTemplateSection
              template={template}
              onChange={setTemplate}
            />
            <ScheduleSection
              schedule={schedule}
              onChange={setSchedule}
              onSaveDraft={handleSaveDraft}
              onSend={handleSend}
              recipientCount={selectedIds.size}
              isSending={isSending}
              delayBetweenMessages={delayBetweenMessages}
              onDelayChange={setDelayBetweenMessages}
              randomizeDelay={randomizeDelay}
              onRandomizeDelayChange={setRandomizeDelay}
            />
          </div>

          {/* Right column — summary */}
          <div className="campaigns-summary-col">
            <CampaignSummaryPanel
              templateName={template.name}
              template={template}
              recipientCount={selectedIds.size}
              schedule={schedule}
              sent={sent}
              activeBatchStatus={batchStatus}
              onOpenProgress={() => setIsModalOpen(true)}
              sessionName={selectedSession?.name || selectedSessionId}
            />
          </div>
        </div>
      </div>

      {/* Real-time Dispatch Progress Modal */}
      <BatchProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        batchStatus={batchStatus}
        onCancelBatch={handleCancelBatch}
        isCancelling={isCancelling}
        sessionName={selectedSession?.name || selectedSessionId || 'Default Session'}
      />
    </div>
  );
}

