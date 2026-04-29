/**
 * Dashboard – overview of CRM stats, recent interactions, and quick actions.
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchInteractions, seedInteractions } from '../store/slices/interactionsSlice';
import { addToast } from '../store/slices/uiSlice';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import InteractionCard from '../components/interactions/InteractionCard';
import { PlusSquare, TrendingUp, Users, CheckCircle, AlertCircle, Database } from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((s) => s.interactions);

  useEffect(() => { dispatch(fetchInteractions()); }, [dispatch]);

  const stats = {
    total: items.length,
    positive: items.filter((i) => i.sentiment === 'Positive').length,
    followUp: items.filter((i) => i.follow_up_required).length,
    highPriority: items.filter((i) => i.priority_level === 'High').length,
  };

  const handleSeed = async () => {
    try {
      await dispatch(seedInteractions()).unwrap();
      await dispatch(fetchInteractions());
      dispatch(addToast({ type: 'success', message: '5 sample interactions loaded!' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err || 'Seed failed' }));
    }
  };

  const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>
        <Icon size={20} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Dashboard" subtitle="Welcome back! Here's your HCP interaction overview." />
        <main className="page-content">

          {/* Actions Row */}
          <div className="dash-actions">
            <button className="btn btn-primary" onClick={() => navigate('/log-interaction')}>
              <PlusSquare size={16} /> Log Interaction
            </button>
            {items.length === 0 && (
              <button className="btn btn-secondary" onClick={handleSeed}>
                <Database size={16} /> Load Sample Data
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard label="Total Interactions" value={stats.total} icon={Users} color="#1a56db" bg="rgba(26,86,219,0.1)" />
            <StatCard label="Positive Sentiment" value={stats.positive} icon={TrendingUp} color="#10b981" bg="rgba(16,185,129,0.1)" />
            <StatCard label="Follow-ups Pending" value={stats.followUp} icon={CheckCircle} color="#f59e0b" bg="rgba(245,158,11,0.1)" />
            <StatCard label="High Priority" value={stats.highPriority} icon={AlertCircle} color="#ef4444" bg="rgba(239,68,68,0.1)" />
          </div>

          {/* Recent Interactions */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Recent Interactions</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/interactions')}>
                View All
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="spinner" style={{ width: 32, height: 32 }} />
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Users size={28} /></div>
                <h4>No interactions yet</h4>
                <p>Log your first HCP interaction or load sample data.</p>
                <button className="btn btn-primary" onClick={handleSeed}>
                  <Database size={15} /> Load Sample Data
                </button>
              </div>
            ) : (
              <div className="interactions-list">
                {items.slice(0, 3).map((i) => (
                  <InteractionCard key={i.id} interaction={i} />
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      <style>{`
        .dash-actions {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .stats-grid { grid-template-columns: 1fr; } }

        .stat-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
          transition: box-shadow var(--transition-base);
        }

        .stat-card:hover { box-shadow: var(--shadow-md); }

        .stat-icon {
          width: 48px; height: 48px;
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .stat-value {
          font-family: var(--font-display);
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .interactions-list { display: flex; flex-direction: column; gap: 0.75rem; }
      `}</style>
    </div>
  );
}
