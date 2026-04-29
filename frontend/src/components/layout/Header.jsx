/**
 * Header – top bar with page title, search hint, and notification bell.
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Bell, Search, Activity } from 'lucide-react';

export default function Header({ title = 'Dashboard', subtitle }) {
  const user = useSelector((s) => s.auth.user);

  return (
    <header className="crm-header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>

      <div className="header-right">
        <div className="header-search">
          <Search size={15} className="search-icon" />
          <span className="search-placeholder">Quick search…</span>
          <kbd>⌘K</kbd>
        </div>

        <button className="header-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notif-dot" />
        </button>

        <div className="header-divider" />

        <div className="header-user">
          <div className="header-avatar">{user?.avatar || 'AJ'}</div>
          <div className="header-user-info">
            <span className="header-user-name">{user?.full_name || 'Field Rep'}</span>
            <span className="header-user-role">{user?.role || 'Sales'}</span>
          </div>
        </div>
      </div>

      <style>{`
        .crm-header {
          position: fixed;
          top: 0;
          left: var(--sidebar-width);
          right: 0;
          height: var(--header-height);
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          z-index: 50;
          backdrop-filter: blur(8px);
        }

        .header-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .header-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-search {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          background: var(--bg-surface-2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          min-width: 200px;
        }

        .search-icon { color: var(--text-muted); }

        .search-placeholder {
          font-size: 0.8125rem;
          color: var(--text-muted);
          flex: 1;
        }

        .header-search kbd {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          padding: 0.125rem 0.375rem;
          background: var(--border-color);
          border-radius: 4px;
          color: var(--text-muted);
        }

        .header-icon-btn {
          position: relative;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          width: 36px; height: 36px;
          border-radius: var(--radius-md);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background var(--transition-fast);
        }

        .header-icon-btn:hover {
          background: var(--bg-surface-2);
          color: var(--text-primary);
        }

        .notif-dot {
          position: absolute;
          top: 6px; right: 6px;
          width: 7px; height: 7px;
          background: var(--brand-danger);
          border-radius: 50%;
          border: 2px solid white;
        }

        .header-divider {
          width: 1px;
          height: 24px;
          background: var(--border-color);
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .header-user:hover { background: var(--bg-surface-2); }

        .header-avatar {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
          border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 0.6875rem; font-weight: 700;
        }

        .header-user-info {
          display: flex;
          flex-direction: column;
        }

        .header-user-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .header-user-role {
          font-size: 0.6875rem;
          color: var(--text-muted);
        }
      `}</style>
    </header>
  );
}
