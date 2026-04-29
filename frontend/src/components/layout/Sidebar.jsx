/**
 * Sidebar – fixed left navigation for the CRM dashboard.
 * Highlights active route, handles logout.
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import {
  LayoutDashboard, ClipboardList, PlusSquare,
  Bot, LogOut, Activity, Stethoscope,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/log-interaction', icon: PlusSquare, label: 'Log Interaction' },
  { to: '/interactions', icon: ClipboardList, label: 'All Interactions' },
  { to: '/demo', icon: Bot, label: 'AI Tools Demo' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(addToast({ type: 'info', message: 'Logged out successfully' }));
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* ── Brand ─────────────────────────────────────────── */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Stethoscope size={20} />
        </div>
        <div>
          <div className="sidebar-brand-name">MedCRM</div>
          <div className="sidebar-brand-sub">HCP Intelligence</div>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── User Footer ────────────────────────────────────── */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.avatar || 'AJ'}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.full_name || 'Field Rep'}</div>
            <div className="sidebar-user-role">{user?.role || 'Sales Rep'}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          background: var(--bg-sidebar);
          height: 100vh;
          position: fixed;
          left: 0; top: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow: hidden;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1.25rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .sidebar-logo {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          color: white; flex-shrink: 0;
        }

        .sidebar-brand-name {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.01em;
        }

        .sidebar-brand-sub {
          font-size: 0.6875rem;
          color: rgba(255,255,255,0.35);
          font-weight: 400;
          margin-top: 1px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          overflow-y: auto;
        }

        .sidebar-section-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0 0.5rem;
          margin-bottom: 0.5rem;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.875rem;
          border-radius: var(--radius-md);
          color: rgba(255,255,255,0.5);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all var(--transition-base);
          text-decoration: none;
        }

        .sidebar-link:hover {
          background: var(--bg-sidebar-hover);
          color: rgba(255,255,255,0.85);
        }

        .sidebar-link.active {
          background: rgba(26,86,219,0.25);
          color: #93c5fd;
          border-left: 3px solid var(--brand-primary-light);
          padding-left: calc(0.875rem - 3px);
        }

        .sidebar-footer {
          padding: 0.875rem 1rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex: 1;
          min-width: 0;
        }

        .sidebar-avatar {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
          border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 0.6875rem; font-weight: 700;
          flex-shrink: 0;
        }

        .sidebar-user-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-role {
          font-size: 0.6875rem;
          color: rgba(255,255,255,0.3);
        }

        .sidebar-logout {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          padding: 0.375rem;
          border-radius: var(--radius-sm);
          display: flex;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .sidebar-logout:hover {
          background: rgba(239,68,68,0.15);
          color: #fca5a5;
        }
      `}</style>
    </aside>
  );
}
