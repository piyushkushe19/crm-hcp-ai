/**
 * InteractionCard – displays a single HCP interaction in the list view.
 * Shows edit and delete actions.
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteInteraction, editInteraction } from '../../store/slices/interactionsSlice';
import { addToast } from '../../store/slices/uiSlice';
import { format } from 'date-fns';
import {
  Trash2, Pencil, X, Check, ChevronDown, ChevronUp,
  Calendar, Building2, Pill, TrendingUp,
} from 'lucide-react';

const SENTIMENT_CONFIG = {
  Positive: { cls: 'badge-success', dot: '#10b981' },
  Neutral:  { cls: 'badge-warning', dot: '#f59e0b' },
  Negative: { cls: 'badge-danger',  dot: '#ef4444' },
};

const TYPE_ICONS = {
  Visit: '🏃', Call: '📞', Email: '📧', Conference: '🎤',
};

const PRIORITY_CLS = {
  High: 'badge-danger', Medium: 'badge-warning', Low: 'badge-info',
};

export default function InteractionCard({ interaction }) {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(interaction.notes || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const sentiment = SENTIMENT_CONFIG[interaction.sentiment] || SENTIMENT_CONFIG.Neutral;

  const handleDelete = async () => {
    if (!window.confirm(`Delete interaction with ${interaction.hcp_name}?`)) return;
    setDeleting(true);
    try {
      await dispatch(deleteInteraction(interaction.id)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Interaction deleted' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Delete failed' }));
      setDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await dispatch(editInteraction({ id: interaction.id, updates: { notes: editNotes } })).unwrap();
      dispatch(addToast({ type: 'success', message: 'Notes updated' }));
      setEditing(false);
    } catch {
      dispatch(addToast({ type: 'error', message: 'Update failed' }));
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return format(new Date(d), 'dd MMM yyyy'); } catch { return '—'; }
  };

  return (
    <div className={`ic-card fade-in ${expanded ? 'ic-card-expanded' : ''}`}>
      {/* ── Card Header ───────────────────────────────────── */}
      <div className="ic-header" onClick={() => setExpanded((p) => !p)}>
        <div className="ic-type-badge">{TYPE_ICONS[interaction.interaction_type] || '📋'}</div>

        <div className="ic-main">
          <div className="ic-top-row">
            <h4 className="ic-name">{interaction.hcp_name}</h4>
            <div className="ic-badges">
              <span className={`badge ${sentiment.cls}`}>
                <span className="sentiment-dot" style={{ background: sentiment.dot }} />
                {interaction.sentiment}
              </span>
              {interaction.priority_level && (
                <span className={`badge ${PRIORITY_CLS[interaction.priority_level] || 'badge-neutral'}`}>
                  {interaction.priority_level}
                </span>
              )}
              {interaction.source === 'ai_chat' && (
                <span className="badge badge-purple">✨ AI</span>
              )}
            </div>
          </div>

          <div className="ic-meta-row">
            {interaction.hospital && (
              <span className="ic-meta"><Building2 size={12} />{interaction.hospital}</span>
            )}
            {interaction.specialty && (
              <span className="ic-meta">🔬 {interaction.specialty}</span>
            )}
            <span className="ic-meta"><Calendar size={12} />{fmtDate(interaction.datetime || interaction.created_at)}</span>
          </div>
        </div>

        <div className="ic-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(!editing); setExpanded(true); }} title="Edit notes">
            <Pencil size={14} />
          </button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-danger)' }} onClick={handleDelete} disabled={deleting} title="Delete">
            {deleting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
          </button>
          <span className="ic-expand-btn">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
        </div>
      </div>

      {/* ── Expanded Details ───────────────────────────────── */}
      {expanded && (
        <div className="ic-body slide-in">
          <div className="ic-detail-grid">
            {interaction.summary && (
              <div className="ic-detail-full">
                <div className="ic-detail-label">Summary</div>
                <p className="ic-detail-text">{interaction.summary}</p>
              </div>
            )}

            {interaction.products && (
              <div className="ic-detail-item">
                <Pill size={14} className="ic-detail-icon" />
                <div>
                  <div className="ic-detail-label">Products</div>
                  <div className="ic-detail-value">{interaction.products}</div>
                </div>
              </div>
            )}

            {interaction.follow_up_required && (
              <div className="ic-detail-item">
                <TrendingUp size={14} className="ic-detail-icon" />
                <div>
                  <div className="ic-detail-label">Follow-up Date</div>
                  <div className="ic-detail-value">{fmtDate(interaction.follow_up_date)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Notes (editable) */}
          <div className="ic-notes-area">
            <div className="ic-detail-label" style={{ marginBottom: '0.5rem' }}>Notes</div>
            {editing ? (
              <div className="edit-notes">
                <textarea
                  className="form-textarea"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                />
                <div className="edit-btns">
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
                    <X size={13} /> Cancel
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveEdit} disabled={saving}>
                    {saving ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <Check size={13} />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="ic-detail-text">{interaction.notes || <em style={{ color: 'var(--text-muted)' }}>No notes. Click edit to add.</em>}</p>
            )}
          </div>
        </div>
      )}

      <style>{`
        .ic-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: box-shadow var(--transition-base), border-color var(--transition-base);
        }

        .ic-card:hover { box-shadow: var(--shadow-md); border-color: #cbd5e1; }
        .ic-card-expanded { border-color: rgba(26,86,219,0.2); }

        .ic-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          cursor: pointer;
        }

        .ic-type-badge {
          width: 40px; height: 40px;
          background: var(--bg-surface-2);
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.125rem;
          flex-shrink: 0;
        }

        .ic-main { flex: 1; min-width: 0; }

        .ic-top-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.25rem;
        }

        .ic-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .ic-badges { display: flex; gap: 0.375rem; align-items: center; flex-wrap: wrap; }

        .sentiment-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        .ic-meta-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ic-meta {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .ic-actions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .ic-expand-btn { color: var(--text-muted); display: flex; }

        .ic-body {
          padding: 1.25rem;
          border-top: 1px solid var(--border-color);
          background: var(--bg-surface-2);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .ic-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .ic-detail-full { grid-column: 1 / -1; }

        .ic-detail-item {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
        }

        .ic-detail-icon { color: var(--text-muted); margin-top: 2px; flex-shrink: 0; }
        .ic-detail-label { font-size: 0.6875rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
        .ic-detail-value { font-size: 0.875rem; color: var(--text-primary); font-weight: 500; }
        .ic-detail-text { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }

        .ic-notes-area { }

        .edit-notes { display: flex; flex-direction: column; gap: 0.5rem; }
        .edit-btns { display: flex; gap: 0.5rem; justify-content: flex-end; }
      `}</style>
    </div>
  );
}
