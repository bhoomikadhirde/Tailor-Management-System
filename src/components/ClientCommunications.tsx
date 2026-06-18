import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Settings, 
  History, 
  Save, 
  CheckCircle, 
  Sparkles,
  Users,
  BadgeAlert,
  Info
} from 'lucide-react';
import { Client, MessageTemplate, CommunicationLog } from '../types';

interface ClientCommunicationsProps {
  clients: Client[];
}

export default function ClientCommunications({ clients }: ClientCommunicationsProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [history, setHistory] = useState<CommunicationLog[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('order_completion');
  const [editedContent, setEditedContent] = useState<string>('');
  
  // Manual dispatch states
  const [targetClientId, setTargetClientId] = useState<string>('');
  const [manualTemplateId, setManualTemplateId] = useState<string>('upcoming_promotions');
  const [customMsgCheck, setCustomMsgCheck] = useState<boolean>(false);
  const [customMsgText, setCustomMsgText] = useState<string>('');
  
  // Notification status state
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchTemplates();
    fetchHistory();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/communications/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
        const active = data.find((t: MessageTemplate) => t.id === selectedTemplateId);
        if (active) setEditedContent(active.content);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/communications/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleTemplateSelectChange = (id: string) => {
    setSelectedTemplateId(id);
    const active = templates.find(t => t.id === id);
    if (active) setEditedContent(active.content);
  };

  const handleSaveTemplate = async () => {
    setIsSavingTemplate(true);
    showStatus('Updating configuration templates...', 'success');
    try {
      const updated = templates.map(t => t.id === selectedTemplateId ? { ...t, content: editedContent } : t);
      const res = await fetch('/api/communications/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setTemplates(updated);
        showStatus('Atelier communications template saved successfully.', 'success');
      } else {
        showStatus('Failed to update templates in the back-office database.', 'error');
      }
    } catch (err) {
      showStatus('Network connection error.', 'error');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleManualSend = async () => {
    if (!targetClientId) {
      showStatus('Please select a registered client profile as the recipient.', 'error');
      return;
    }
    
    setIsSending(true);
    showStatus('Engaging dispatch systems...', 'success');

    try {
      const res = await fetch('/api/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: targetClientId,
          templateId: customMsgCheck ? undefined : manualTemplateId,
          customMessage: customMsgCheck ? customMsgText : undefined
        })
      });

      if (res.ok) {
        showStatus('Notification triggered and simulated successfully.', 'success');
        setCustomMsgText('');
        setTargetClientId('');
        fetchHistory();
      } else {
        showStatus('Failed to dispatch the tailoring ledger notification.', 'error');
      }
    } catch (err) {
      showStatus('Connection timeout during courier transit.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  // Helper keyword preview replacement
  const getPreviewText = () => {
    const demoClient = clients[0] || { name: 'Arthur Pendelton', phone: '+1 555-0988', email: 'arthur@example.com' };
    return editedContent
      .replace(/{clientName}/g, demoClient.name)
      .replace(/{clothingType}/g, 'Pure Tweed Double-Breasted Suit')
      .replace(/{orderNumber}/g, 'ORD-2026-1015')
      .replace(/{total}/g, '1200')
      .replace(/{amountPaid}/g, '800')
      .replace(/{balance}/g, '400')
      .replace(/{dueDate}/g, new Date().toLocaleDateString());
  };

  // Filter history logs
  const filteredHistory = history.filter(log => {
    const q = searchQuery.toLowerCase();
    return (
      log.clientName.toLowerCase().includes(q) ||
      log.message.toLowerCase().includes(q) ||
      log.event.toLowerCase().includes(q) ||
      log.channel.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 p-1 sm:p-2">
      {/* Brand Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-natural-border pb-5">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-natural-text uppercase">
            Communication Atelier
          </h2>
          <p className="text-xs text-natural-muted mt-1 max-w-2xl font-sans">
            Customize notification templates, monitor simulated transactional SMS & digital mail, and maintain an automated audit ledger trail of client alerts.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-natural-muted px-3 py-1.5 bg-white border border-natural-border rounded-xl">
          <Sparkles className="h-4 w-4 text-natural-accent" />
          <span>Real-time Trigger Hub</span>
        </div>
      </div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm shadow-xs ${
            statusMessage.type === 'success' 
              ? 'bg-natural-bg border-natural-secondary/40 text-natural-muted' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-natural-accent animate-ping" />
          <span>{statusMessage.text}</span>
        </motion.div>
      )}

      {/* Grid containing Templates and Direct Send */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Template customizer - Left Side (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-natural-border shadow-xs overflow-hidden flex flex-col relative">
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-natural-accent/20" />
          
          <div className="p-6 border-b border-natural-border bg-natural-bg/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Settings className="h-5 w-5 text-natural-accent" />
              <h3 className="font-serif font-bold text-lg text-natural-text uppercase tracking-tight">
                Message Customization Console
              </h3>
            </div>
            <div className="w-24 h-5 opacity-20 border-b-2 border-dashed border-natural-accent" />
          </div>

          <div className="p-6 space-y-6 flex-1">
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-natural-muted uppercase tracking-widest">
                Choose Event Template
              </label>
              <div className="grid grid-cols-3 gap-2">
                {templates.map((temp) => (
                  <button
                    key={temp.id}
                    onClick={() => handleTemplateSelectChange(temp.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedTemplateId === temp.id
                        ? 'border-natural-accent bg-natural-panel text-natural-text font-semibold'
                        : 'border-natural-border bg-white text-natural-muted hover:border-natural-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[9px] font-bold text-[var(--color-natural-accent)] opacity-85">
                        {temp.channel}
                      </span>
                      {temp.channel === 'EMAIL' ? (
                        <Mail className="h-3.5 w-3.5 text-natural-accent/60" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5 text-natural-accent/60" />
                      )}
                    </div>
                    <p className="text-[11px] leading-tight truncate">{temp.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Template editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase tracking-widest">
                  Content Template
                </label>
                <span className="text-[10px] font-mono text-natural-accent/70 bg-natural-panel/60 px-2 py-0.5 rounded-md">
                  Supports markdown
                </span>
              </div>
              
              <div className="relative rounded-xl border border-natural-border overflow-hidden">
                {/* Chalk board Stitched Border Background */}
                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={6}
                  className="w-full p-4 bg-white/70 font-mono text-xs text-natural-text focus:outline-none focus:ring-0 resize-none z-10 relative"
                  placeholder="Enter custom draft text here. Dynamic variables such as {clientName} will be expanded."
                />
              </div>

              {/* Merge codes */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['clientName', 'clothingType', 'orderNumber', 'total', 'amountPaid', 'balance', 'dueDate'].map((code) => (
                  <button
                    key={code}
                    onClick={() => setEditedContent(c => c + ` {${code}}`)}
                    className="text-[10px] font-mono text-natural-muted hover:text-natural-accent border border-natural-border hover:border-natural-accent bg-natural-bg/50 px-2 py-1 rounded-md transition-all"
                  >
                    {`{${code}}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic replacement preview to verify matching variables */}
            <div className="rounded-xl bg-natural-panel/70 p-4 border border-natural-border relative">
              <h4 className="text-[10px] font-mono font-bold text-natural-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Info className="h-3 w-3 text-natural-accent" />
                Live Dispatch Simulation Preview
              </h4>
              <p className="text-xs font-serif text-natural-text whitespace-pre-wrap leading-relaxed italic bg-white/50 p-3 rounded-lg border border-natural-border/60">
                {getPreviewText() || 'Double-check variable braces balance...'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-natural-panel/50 border-t border-natural-border flex items-center justify-between">
            <span className="text-[11px] font-mono text-natural-muted">
              Auto-dispatched when status flags change to completion.
            </span>
            <button
              onClick={handleSaveTemplate}
              disabled={isSavingTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-natural-accent hover:bg-natural-accent/90 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-55 cursor-pointer shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>{isSavingTemplate ? 'Recording...' : 'Commit Changes'}</span>
            </button>
          </div>
        </div>

        {/* Campaign / Direct dispatch courier helper (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-natural-border shadow-xs overflow-hidden flex flex-col relative">
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-natural-secondary/20" />
          
          <div className="p-6 border-b border-natural-border bg-natural-bg/40">
            <div className="flex items-center gap-2.5">
              <Send className="h-4.5 w-4.5 text-natural-secondary" />
              <h3 className="font-serif font-bold text-lg text-natural-text uppercase tracking-tight">
                Courier Desk Dispatch
              </h3>
            </div>
          </div>

          <div className="p-6 space-y-5 flex-1 bg-grid/5">
            {/* Recipient client select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-natural-muted uppercase tracking-widest">
                Target Profile Recipient
              </label>
              <select
                value={targetClientId}
                onChange={(e) => setTargetClientId(e.target.value)}
                className="w-full bg-white border border-natural-border rounded-xl px-3.5 py-2.5 text-xs text-natural-text focus:outline-none focus:border-natural-accent font-sans"
              >
                <option value="">-- Choose registered customer profile --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email || c.phone || 'No communications detail'})
                  </option>
                ))}
              </select>
            </div>

            {/* Customized message selection */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-natural-muted uppercase tracking-widest">
                  Content Pipeline
                </span>
                <label className="inline-flex items-center gap-1.5 text-[11px] text-natural-muted cursor-pointer selection:bg-transparent">
                  <input
                    type="checkbox"
                    checked={customMsgCheck}
                    onChange={(e) => setCustomMsgCheck(e.target.checked)}
                    className="rounded border-natural-border text-natural-accent focus:ring-0"
                  />
                  <span>Write customized body</span>
                </label>
              </div>

              {!customMsgCheck ? (
                <div className="space-y-2">
                  <label className="block text-[11px] font-sans text-natural-muted">
                    Pick a predefined template configuration:
                  </label>
                  <select
                    value={manualTemplateId}
                    onChange={(e) => setManualTemplateId(e.target.value)}
                    className="w-full bg-white border border-natural-border rounded-xl px-3.5 py-2.5 text-xs text-natural-text focus:outline-none focus:border-natural-accent font-sans"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.label} ({t.channel})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <textarea
                    value={customMsgText}
                    onChange={(e) => setCustomMsgText(e.target.value)}
                    rows={5}
                    className="w-full p-3 font-mono text-xs border border-natural-border rounded-xl bg-white focus:outline-none focus:border-natural-accent"
                    placeholder="Write custom SMS or Email alert here..."
                  />
                </div>
              )}
            </div>

            {/* Informational helpful note */}
            <div className="rounded-xl border border-dashed border-natural-border/80 bg-natural-panel/40 p-4 text-[11px] text-natural-muted leading-relaxed">
              <p className="font-bold uppercase tracking-wider font-mono text-[9px] mb-1 text-natural-accent">
                ◆ Stitched Audit Controls
              </p>
              Simulated dispatches are stamped onto the ledger below immediately with automated timeline audit marks.
            </div>
          </div>

          <div className="p-4 bg-natural-panel/40 border-t border-natural-border">
            <button
              onClick={handleManualSend}
              disabled={isSending || !targetClientId}
              className="w-full flex items-center justify-center gap-2 py-3 bg-natural-accent hover:bg-natural-accent/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Send className="h-4 w-4" />
              <span>{isSending ? 'Simulating transit...' : 'Send Custom Notification'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Communications History Audit Trail (12 Cols) */}
      <div className="bg-white rounded-2xl border border-natural-border shadow-xs overflow-hidden leading-tight flex flex-col relative mt-8">
        <div className="absolute top-0 right-0 left-0 h-[3px] bg-natural-accent" />
        
        <div className="p-6 border-b border-natural-border bg-natural-bg/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <History className="h-5 w-5 text-natural-accent" />
            <div>
              <h3 className="font-serif font-bold text-lg text-natural-text uppercase tracking-tight">
                Atelier Communications Audit Trail
              </h3>
              <p className="text-[11px] text-natural-muted mt-0.5">
                Stitched logs of outbox notifications processed via status changed events.
              </p>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search dispatch logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-natural-border focus:border-natural-accent bg-white rounded-xl text-xs text-natural-text w-full sm:w-64 focus:outline-none placeholder-natural-muted"
            />
          </div>
        </div>

        {/* Scrollable table ledger */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-natural-border bg-natural-panel/40 text-[10px] font-mono font-bold text-natural-muted uppercase tracking-wider">
                <th className="py-3 px-6">Channel</th>
                <th className="py-3 px-6">Client Profile</th>
                <th className="py-3 px-6">Event Context</th>
                <th className="py-3 px-6">Alert Outgoing Text Message</th>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-border/50 text-xs text-natural-text">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-natural-muted font-serif italic bg-natural-bg/20">
                    No communication logs found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-natural-panel/20 transition-colors">
                    <td className="py-4 px-6 font-mono text-[10px]">
                      <span className={`px-2 py-1 rounded-md border font-bold ${
                        log.channel === 'EMAIL'
                          ? 'bg-blue-50/60 border-blue-200 text-blue-700'
                          : 'bg-green-50/60 border-green-200 text-green-700'
                      }`}>
                        {log.channel}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      <div>
                        {log.clientName}
                        <p className="text-[10px] font-mono text-natural-muted font-normal mt-0.5">
                          {log.clientPhone || log.clientEmail || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-[10px]">
                      <div>
                        <span className="capitalize">{log.event.replace(/_/g, ' ')}</span>
                        {log.orderNumber && (
                          <p className="text-natural-accent font-bold mt-0.5">{log.orderNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-sm">
                      <p className="line-clamp-2 text-[11px] leading-relaxed text-natural-muted hover:line-clamp-none transition-all cursor-pointer whitespace-pre-line font-serif italic">
                        "{log.message}"
                      </p>
                    </td>
                    <td className="py-4 px-6 text-natural-muted font-mono text-[10px]">
                      {new Date(log.sentAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-natural-muted font-medium text-[11px]">
                        <CheckCircle className="h-4.5 w-4.5 text-natural-secondary shrink-0" />
                        <span>{log.status}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
