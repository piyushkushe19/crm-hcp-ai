/**
 * AIChatLogger – Tab B of the Log Interaction screen.
 * ChatGPT-style UI that sends natural language to the LangGraph agent
 * and displays extracted CRM fields live. User can then save to DB.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchInteractions } from '../../store/slices/interactionsSlice';
import { addToast } from '../../store/slices/uiSlice';
import api from '../../utils/api';
import {
  Send, Bot, User, Sparkles, CheckCircle,
  AlertTriangle, Zap, Save, RotateCcw,
} from 'lucide-react';

const EXAMPLE_PROMPTS = [
  "I met Dr. Sharma today at Apollo Hospital. We discussed the Metformin XR launch. He was very interested and requested a follow-up next Tuesday.",
  "Called Dr. Priya Nair from Fortis Pune. She agreed to try our Atorvastatin 40mg. Positive sentiment. Need to courier samples by Friday.",
  "Conference at Mumbai Oncology Summit. Met Dr. Patel. He raised concerns about side-effect profile. Schedule re-engagement in 3 months.",
];

function TypingDots() {
  return (
    <div className="typing-dots">
      <span /><span /><span />
    </div>
  );
}

function ExtractedCard({ data }) {
  if (!data) return null;

  const sentimentColor = {
    Positive: 'badge-success',
    Negative: 'badge-danger',
    Neutral: 'badge-warning',
  }[data.sentiment] || 'badge-neutral';

  const priorityColor = {
    High: 'badge-danger',
    Medium: 'badge-warning',
    Low: 'badge-info',
  }[data.priority_level] || 'badge-neutral';

  const fields = [
    { label: 'HCP Name', value: data.hcp_name, icon: '👨‍⚕️' },
    { label: 'Hospital', value: data.hospital, icon: '🏥' },
    { label: 'Specialty', value: data.specialty, icon: '🔬' },
    { label: 'Type', value: data.interaction_type, icon: '📋' },
    { label: 'Products', value: data.products, icon: '💊' },
    { label: 'Follow-up', value: data.follow_up_required ? `Yes – ${data.follow_up_date || 'TBD'}` : 'No', icon: '📅' },
  ];

  return (
    <div className="extracted-card slide-in">
      <div className="extracted-header">
        <Sparkles size={16} className="extracted-icon" />
        <span>Extracted CRM Data</span>
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          <span className={`badge ${sentimentColor}`}>{data.sentiment}</span>
          <span className={`badge ${priorityColor}`}>{data.priority_level} Priority</span>
        </div>
      </div>

      <div className="extracted-grid">
        {fields.map(({ label, value, icon }) =>
          value ? (
            <div key={label} className="extracted-field">
              <span className="ef-icon">{icon}</span>
              <div>
                <div className="ef-label">{label}</div>
                <div className="ef-value">{value}</div>
              </div>
            </div>
          ) : null
        )}
      </div>

      {data.summary && (
        <div className="extracted-summary">
          <div className="ef-label">Summary</div>
          <p>{data.summary}</p>
        </div>
      )}

      {data.next_best_action && (
        <div className="nba-box">
          <Zap size={14} className="nba-icon" />
          <div>
            <div className="ef-label">Next Best Action</div>
            <p>{data.next_best_action}</p>
          </div>
        </div>
      )}

      {data.compliance_issues && data.compliance_issues.length > 0 && (
        <div className="compliance-box">
          <AlertTriangle size={14} />
          <div>
            <div className="ef-label">Compliance Flags</div>
            <ul>{data.compliance_issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIChatLogger({ onSuccess }) {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI CRM assistant. Describe your interaction with an HCP in natural language and I'll extract all the structured data for you.",
      extracted: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastExtracted, setLastExtracted] = useState(null);
  const [saving, setSaving] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat-log', { message: userText, save: false });
      const extracted = data.extracted;
      setLastExtracted(extracted);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I've extracted the following CRM data from your description. Review and save when ready.",
          extracted,
        },
      ]);
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to process. Check your API connection.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${errMsg}`, extracted: null },
      ]);
      dispatch(addToast({ type: 'error', message: errMsg }));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSave = async () => {
    if (!lastExtracted?.hcp_name) {
      dispatch(addToast({ type: 'error', message: 'No interaction data to save. Chat first.' }));
      return;
    }

    setSaving(true);
    try {
      await api.post('/ai/chat-log', {
        message: messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '',
        save: true,
      });
      dispatch(addToast({ type: 'success', message: 'Interaction saved to CRM!' }));
      dispatch(fetchInteractions());
      setLastExtracted(null);
      onSuccess?.();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: 'Failed to save interaction' }));
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-logger fade-in">
      {/* Example Prompts */}
      <div className="prompt-chips">
        <span className="chips-label">Try an example:</span>
        {EXAMPLE_PROMPTS.map((p, i) => (
          <button key={i} className="prompt-chip" onClick={() => sendMessage(p)}>
            {p.slice(0, 55)}…
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
            <div className="msg-avatar">
              {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className="msg-body">
              <div className="msg-bubble">{msg.content}</div>
              {msg.extracted && <ExtractedCard data={msg.extracted} />}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg chat-msg-assistant">
            <div className="msg-avatar"><Bot size={16} /></div>
            <div className="msg-body">
              <div className="msg-bubble"><TypingDots /></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Save Action Bar */}
      {lastExtracted && (
        <div className="save-bar fade-in">
          <CheckCircle size={16} className="save-bar-icon" />
          <span>Ready to save <strong>{lastExtracted.hcp_name || 'interaction'}</strong> to CRM</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setLastExtracted(null)}>
              <RotateCcw size={14} /> Discard
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={14} />}
              {saving ? 'Saving…' : 'Save Interaction'}
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your HCP interaction… (Enter to send, Shift+Enter for new line)"
          rows={3}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          {loading ? <span className="spinner" style={{ width: 18, height: 18, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : <Send size={18} />}
        </button>
      </div>

      <style>{`
        .chat-logger {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100%;
        }

        .prompt-chips {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .chips-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          white-space: nowrap;
        }

        .prompt-chip {
          font-size: 0.75rem;
          padding: 0.25rem 0.625rem;
          background: rgba(26,86,219,0.06);
          border: 1px solid rgba(26,86,219,0.2);
          border-radius: var(--radius-full);
          color: var(--brand-primary);
          cursor: pointer;
          font-family: var(--font-body);
          transition: all var(--transition-fast);
          text-align: left;
        }

        .prompt-chip:hover {
          background: rgba(26,86,219,0.12);
          border-color: var(--brand-primary);
        }

        .chat-window {
          flex: 1;
          min-height: 380px;
          max-height: 480px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1rem;
          background: var(--bg-surface-2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
        }

        .chat-msg {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .chat-msg-user { flex-direction: row-reverse; }

        .msg-avatar {
          width: 32px; height: 32px;
          border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 0.875rem;
        }

        .chat-msg-assistant .msg-avatar {
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
          color: white;
        }

        .chat-msg-user .msg-avatar {
          background: var(--text-primary);
          color: white;
        }

        .msg-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 80%;
        }

        .chat-msg-user .msg-body { align-items: flex-end; }

        .msg-bubble {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-lg);
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .chat-msg-assistant .msg-bubble {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          border-bottom-left-radius: var(--radius-sm);
        }

        .chat-msg-user .msg-bubble {
          background: var(--brand-primary);
          color: white;
          border-bottom-right-radius: var(--radius-sm);
        }

        /* Typing dots */
        .typing-dots { display: flex; gap: 4px; align-items: center; height: 18px; }
        .typing-dots span {
          width: 7px; height: 7px; background: var(--text-muted);
          border-radius: 50%;
          animation: dotBounce 1.2s ease infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }

        /* Extracted Card */
        .extracted-card {
          background: var(--bg-surface);
          border: 1.5px solid rgba(26,86,219,0.2);
          border-radius: var(--radius-lg);
          overflow: hidden;
          width: 100%;
          max-width: 480px;
        }

        .extracted-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(26,86,219,0.05);
          border-bottom: 1px solid rgba(26,86,219,0.1);
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--brand-primary);
        }

        .extracted-icon { color: var(--brand-primary); flex-shrink: 0; }

        .extracted-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }

        .extracted-field {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
          padding: 0.625rem 1rem;
          border-bottom: 1px solid var(--border-color);
          border-right: 1px solid var(--border-color);
        }

        .extracted-field:nth-child(even) { border-right: none; }

        .ef-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
        .ef-label { font-size: 0.6875rem; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
        .ef-value { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); margin-top: 1px; }

        .extracted-summary {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .nba-box {
          display: flex;
          gap: 0.625rem;
          padding: 0.75rem 1rem;
          background: rgba(16,185,129,0.05);
          border-bottom: 1px solid rgba(16,185,129,0.15);
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .nba-icon { color: var(--brand-success); flex-shrink: 0; margin-top: 2px; }

        .compliance-box {
          display: flex;
          gap: 0.625rem;
          padding: 0.75rem 1rem;
          background: rgba(239,68,68,0.05);
          font-size: 0.8125rem;
          color: #b91c1c;
        }

        .compliance-box ul { margin: 0.25rem 0 0; padding-left: 1rem; }

        /* Save bar */
        .save-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          color: #065f46;
        }

        .save-bar-icon { color: var(--brand-success); flex-shrink: 0; }

        /* Chat input */
        .chat-input-area {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-lg);
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--text-primary);
          resize: none;
          outline: none;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          line-height: 1.5;
        }

        .chat-input:focus {
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 3px rgba(26,86,219,0.1);
        }

        .chat-send-btn {
          width: 48px; height: 48px;
          background: var(--brand-primary);
          border: none;
          border-radius: var(--radius-lg);
          color: white;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .chat-send-btn:hover:not(:disabled) {
          background: var(--brand-primary-dark);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26,86,219,0.4);
        }

        .chat-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
