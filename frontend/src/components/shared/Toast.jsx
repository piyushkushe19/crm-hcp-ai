/**
 * Toast – renders global notification toasts from Redux uiSlice.
 * Auto-dismisses after 4 seconds.
 */

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../store/slices/uiSlice';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={16} />,
  error: <XCircle size={16} />,
  info: <Info size={16} />,
};

function Toast({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  return (
    <div className={`toast toast-${toast.type}`}>
      <span className={`toast-icon toast-icon-${toast.type}`}>
        {ICONS[toast.type] || ICONS.info}
      </span>
      <span className="toast-msg">{toast.message}</span>
      <button className="toast-close" onClick={() => dispatch(removeToast(toast.id))}>
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useSelector((s) => s.ui.toasts);

  if (!toasts.length) return null;

  return (
    <>
      <div className="toast-container">
        {toasts.map((t) => <Toast key={t.id} toast={t} />)}
      </div>
      <style>{`
        .toast-icon { display: flex; }
        .toast-icon-success { color: var(--brand-success); }
        .toast-icon-error { color: #fca5a5; }
        .toast-icon-info { color: #93c5fd; }
        .toast-msg { flex: 1; font-size: 0.875rem; font-weight: 500; }
        .toast-close {
          background: transparent; border: none; color: rgba(255,255,255,0.4);
          cursor: pointer; padding: 0.125rem; display: flex; border-radius: 4px;
          transition: color var(--transition-fast);
        }
        .toast-close:hover { color: white; }
      `}</style>
    </>
  );
}
