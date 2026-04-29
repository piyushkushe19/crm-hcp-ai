/**
 * LogInteractionPage – main task screen with two tabs:
 *   Tab A: Structured Form
 *   Tab B: AI Chat Logging
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StructuredForm from '../components/interactions/StructuredForm';
import AIChatLogger from '../components/chat/AIChatLogger';
import { ClipboardList, Bot } from 'lucide-react';

export default function LogInteractionPage() {
  const [activeTab, setActiveTab] = useState('form');
  const navigate = useNavigate();

  const handleSuccess = () => {
    setTimeout(() => navigate('/interactions'), 1200);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header
          title="Log Interaction"
          subtitle="Record a new HCP interaction via structured form or AI chat."
        />
        <main className="page-content">
          <div className="log-page-inner">

            {/* Tab Navigation */}
            <div className="tabs-nav" style={{ marginBottom: '1.5rem' }}>
              <button
                className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
                onClick={() => setActiveTab('form')}
              >
                <ClipboardList size={16} />
                Structured Form
              </button>
              <button
                className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <Bot size={16} />
                AI Chat Logging
                <span className="tab-ai-badge">✨ AI</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="card tab-content-card">
              {activeTab === 'form' && (
                <StructuredForm onSuccess={handleSuccess} />
              )}
              {activeTab === 'chat' && (
                <AIChatLogger onSuccess={handleSuccess} />
              )}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .log-page-inner { max-width: 860px; }

        .tab-content-card {
          padding: 2rem;
        }

        .tab-ai-badge {
          font-size: 0.6875rem;
          background: rgba(26,86,219,0.1);
          color: var(--brand-primary);
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-full);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
