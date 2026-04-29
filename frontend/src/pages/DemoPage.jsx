/**
 * DemoPage – interactive showcase of all 5 LangGraph tools.
 * Each panel lets you test a specific agent tool with custom input.
 */

import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import api from '../utils/api';
import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';
import {
  ClipboardEdit, FilePen, UserSearch,
  Lightbulb, ShieldAlert, Play, ChevronRight,
} from 'lucide-react';

const TOOLS = [
  {
    id: 'log',
    icon: ClipboardEdit,
    color: '#1a56db',
    bg: 'rgba(26,86,219,0.08)',
    title: 'Log Interaction Tool',
    description: 'Extracts structured CRM fields from natural language.',
    placeholder: 'I visited Dr. Sharma at Apollo Hospital today. We discussed Metformin XR. He was interested and wants follow-up next Monday.',
  },
  {
    id: 'edit',
    icon: FilePen,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    title: 'Edit Interaction Tool',
    description: 'Detects what fields need updating in an existing record.',
    placeholder: 'Change the sentiment to Positive and add that Dr. Sharma requested a sample kit.',
  },
  {
    id: 'lookup',
    icon: UserSearch,
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    title: 'HCP Profile Lookup Tool',
    description: 'Retrieves and summarises previous interaction history for an HCP.',
    placeholder: 'Show me the profile and history for Dr. Priya Nair from Fortis.',
  },
  {
    id: 'nba',
    icon: Lightbulb,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    title: 'Next Best Action Tool',
    description: 'AI suggests the optimal follow-up action for the rep.',
    placeholder: 'Dr. Patel showed hesitation about side effects but is open to alternatives. What should I do?',
  },
  {
    id: 'compliance',
    icon: ShieldAlert,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    title: 'Compliance Checker Tool',
    description: 'Flags non-compliant or potentially risky pharma language.',
    placeholder: 'Our drug is guaranteed to cure diabetes better than any competitor product. You must prescribe it.',
  },
];

function ToolPanel({ tool }) {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const Icon = tool.icon;

  const runTool = async () => {
    const text = input.trim() || tool.placeholder;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post(`/ai/demo-tool/${tool.id}`, { message: text });
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Tool execution failed';
      dispatch(addToast({ type: 'error', message: msg }));
      setResult({ error: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <div className="tool-icon-wrap" style={{ background: tool.bg, color: tool.color }}>
          <Icon size={20} />
        </div>
        <div>
          <h4 className="tool-name">{tool.title}</h4>
          <p className="tool-desc">{tool.description}</p>
        </div>
      </div>

      <textarea
        className="tool-input"
        placeholder={tool.placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
      />

      <button className="btn btn-primary btn-sm tool-run-btn" onClick={runTool} disabled={loading}>
        {loading
          ? <span className="spinner" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
          : <Play size={13} />}
        {loading ? 'Running…' : 'Run Tool'}
        {!loading && <ChevronRight size={13} />}
      </button>

      {result && (
        <div className="tool-result fade-in">
          <div className="result-label">Agent Output</div>
          <pre className="result-json">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default function DemoPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header
          title="AI Tools Demo"
          subtitle="Test all 5 LangGraph agent tools live with custom inputs."
        />
        <main className="page-content">
          <div className="demo-intro card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>🧠</span>
              <div>
                <h3 style={{ margin: '0 0 0.375rem' }}>LangGraph HCPInteractionAgent</h3>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  The agent receives your input, detects intent, routes to the correct tool, executes it using Groq (gemma2-9b-it), and returns structured output. Each panel below demonstrates one of the 5 available tools.
                </p>
              </div>
            </div>
          </div>

          <div className="tools-grid">
            {TOOLS.map((tool) => <ToolPanel key={tool.id} tool={tool} />)}
          </div>
        </main>
      </div>

      <style>{`
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
          gap: 1.25rem;
        }

        .tool-panel {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
          transition: box-shadow var(--transition-base);
        }

        .tool-panel:hover { box-shadow: var(--shadow-md); }

        .tool-header {
          display: flex;
          gap: 0.875rem;
          align-items: flex-start;
        }

        .tool-icon-wrap {
          width: 44px; height: 44px;
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .tool-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.25rem;
        }

        .tool-desc {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.4;
        }

        .tool-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 0.8125rem;
          color: var(--text-primary);
          resize: none;
          outline: none;
          background: var(--bg-surface-2);
          transition: border-color var(--transition-fast);
          line-height: 1.5;
        }

        .tool-input:focus { border-color: var(--brand-primary); background: var(--bg-surface); }

        .tool-run-btn { align-self: flex-start; }

        .tool-result {
          background: var(--bg-sidebar);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .result-label {
          padding: 0.5rem 0.875rem;
          font-size: 0.6875rem;
          font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .result-json {
          padding: 0.875rem;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #93c5fd;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
          margin: 0;
          max-height: 280px;
          overflow-y: auto;
          line-height: 1.6;
        }

        @media (max-width: 900px) {
          .tools-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
