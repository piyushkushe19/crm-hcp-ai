/**
 * InteractionsPage – full list of all HCP interactions with search/filter.
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInteractions } from '../store/slices/interactionsSlice';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import InteractionCard from '../components/interactions/InteractionCard';
import { Search, Filter, Users } from 'lucide-react';

export default function InteractionsPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.interactions);

  const [search, setSearch] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('All');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => { dispatch(fetchInteractions()); }, [dispatch]);

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      i.hcp_name?.toLowerCase().includes(q) ||
      i.hospital?.toLowerCase().includes(q) ||
      i.products?.toLowerCase().includes(q);

    const matchSentiment = filterSentiment === 'All' || i.sentiment === filterSentiment;
    const matchType = filterType === 'All' || i.interaction_type === filterType;

    return matchSearch && matchSentiment && matchType;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header
          title="All Interactions"
          subtitle={`${items.length} total interactions logged`}
        />
        <main className="page-content">

          {/* Filters */}
          <div className="filter-bar card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
            <div className="filter-search">
              <Search size={15} className="filter-search-icon" />
              <input
                className="filter-input"
                placeholder="Search by HCP name, hospital, product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-selects">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Filter:</span>
              </div>
              <select className="filter-select" value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)}>
                <option>All</option>
                <option>Positive</option>
                <option>Neutral</option>
                <option>Negative</option>
              </select>
              <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option>All</option>
                <option>Visit</option>
                <option>Call</option>
                <option>Email</option>
                <option>Conference</option>
              </select>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={28} /></div>
              <h4>No interactions found</h4>
              <p>{search ? 'Try a different search term.' : 'Log your first interaction to get started.'}</p>
            </div>
          ) : (
            <div className="interactions-list">
              {filtered.map((i) => <InteractionCard key={i.id} interaction={i} />)}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-search {
          position: relative;
          flex: 1;
          min-width: 240px;
        }

        .filter-search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .filter-input {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.125rem;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 0.875rem;
          outline: none;
          background: var(--bg-surface);
          color: var(--text-primary);
          transition: border-color var(--transition-fast);
        }

        .filter-input:focus { border-color: var(--brand-primary); }

        .filter-selects {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-select {
          padding: 0.5rem 0.75rem;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 0.8125rem;
          color: var(--text-secondary);
          background: var(--bg-surface);
          outline: none;
          cursor: pointer;
        }

        .interactions-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
      `}</style>
    </div>
  );
}
