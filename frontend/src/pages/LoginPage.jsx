/**
 * Login page – credential form, dispatches loginUser thunk.
 * Demo credentials shown for easy access.
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';
import { Stethoscope, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ username: 'admin', password: 'password123' });
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
    return () => dispatch(clearError());
  }, [token, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo"><Stethoscope size={28} /></div>
          <div>
            <div className="login-brand-name">MedCRM</div>
            <div className="login-brand-tag">HCP Intelligence Platform</div>
          </div>
        </div>

        <div className="login-hero">
          <h1>AI-powered CRM<br />for Field Reps</h1>
          <p>Log HCP interactions in seconds using natural language. Let AI extract, structure, and analyse your data automatically.</p>
        </div>

        <div className="login-features">
          {['Log by voice or text', 'AI extracts CRM fields', 'Compliance checking built-in', 'Next best action suggestions'].map((f) => (
            <div key={f} className="login-feature">
              <div className="feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your CRM account</p>
          </div>

          {error && (
            <div className="login-error">
              <Lock size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  className="form-input login-input"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  className="form-input login-input"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg login-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="demo-hint">
            <span>Demo credentials:</span>
            <code>admin / password123</code>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          background: var(--bg-app);
        }

        .login-left {
          flex: 1;
          background: var(--bg-sidebar);
          padding: 3rem;
          display: flex;
          flex-direction: column;
          gap: 3rem;
          min-height: 100vh;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }

        .login-logo {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          color: white;
        }

        .login-brand-name {
          font-family: var(--font-display);
          font-size: 1.375rem;
          font-weight: 700;
          color: white;
        }

        .login-brand-tag {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
        }

        .login-hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1rem;
        }

        .login-hero h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        .login-hero p {
          font-size: 1rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
          max-width: 360px;
        }

        .login-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .login-feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.6);
        }

        .feature-dot {
          width: 8px; height: 8px;
          background: var(--brand-accent);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .login-right {
          width: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--border-color);
        }

        .login-card-header {
          margin-bottom: 2rem;
        }

        .login-card-header h2 { font-size: 1.5rem; margin-bottom: 0.375rem; }
        .login-card-header p { font-size: 0.875rem; color: var(--text-muted); margin: 0; }

        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: var(--radius-md);
          color: #991b1b;
          font-size: 0.875rem;
          margin-bottom: 1.25rem;
        }

        .login-form { display: flex; flex-direction: column; gap: 1.25rem; }

        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .login-input { padding-left: 2.5rem !important; }
        .pwd-toggle { position: absolute; right: 0.875rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; }

        .login-btn { margin-top: 0.5rem; }

        .demo-hint {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.8125rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .demo-hint code {
          font-family: var(--font-mono);
          background: var(--bg-surface-2);
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          color: var(--brand-primary);
        }

        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { width: 100%; }
        }
      `}</style>
    </div>
  );
}
