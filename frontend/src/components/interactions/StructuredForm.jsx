/**
 * StructuredForm – Tab A of the Log Interaction screen.
 * Full CRM form with all required fields. Submits via Redux → FastAPI.
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logInteraction } from '../../store/slices/interactionsSlice';
import { addToast } from '../../store/slices/uiSlice';
import { Save, RotateCcw } from 'lucide-react';

const INITIAL_STATE = {
  hcp_name: '',
  specialty: '',
  hospital: '',
  interaction_type: 'Visit',
  datetime: '',
  summary: '',
  products: '',
  sentiment: 'Neutral',
  follow_up_required: false,
  follow_up_date: '',
  priority_level: 'Medium',
  notes: '',
  source: 'form',
};

const SPECIALTIES = [
  'Cardiology', 'Diabetology', 'Oncology', 'Nephrology',
  'Psychiatry', 'Neurology', 'Orthopedics', 'General Practice',
  'Pulmonology', 'Gastroenterology', 'Other',
];

export default function StructuredForm({ onSuccess }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.hcp_name.trim()) errs.hcp_name = 'HCP Name is required';
    if (!form.hospital.trim()) errs.hospital = 'Hospital is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        datetime: form.datetime ? new Date(form.datetime).toISOString() : null,
        follow_up_date: form.follow_up_date ? new Date(form.follow_up_date).toISOString() : null,
      };
      await dispatch(logInteraction(payload)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Interaction logged successfully!' }));
      setForm(INITIAL_STATE);
      onSuccess?.();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err || 'Failed to save interaction' }));
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, error, children }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="structured-form fade-in">
      {/* Section: HCP Details */}
      <div className="form-section">
        <div className="form-section-title">
          <span className="section-num">01</span>
          HCP Details
        </div>
        <div className="form-grid">
          <Field label="HCP Name *" error={errors.hcp_name}>
            <input
              className={`form-input ${errors.hcp_name ? 'input-error' : ''}`}
              name="hcp_name"
              value={form.hcp_name}
              onChange={handleChange}
              placeholder="Dr. Rahul Sharma"
            />
          </Field>

          <Field label="Specialty">
            <select className="form-select" name="specialty" value={form.specialty} onChange={handleChange}>
              <option value="">Select specialty…</option>
              {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Hospital / Clinic *" error={errors.hospital}>
            <input
              className={`form-input ${errors.hospital ? 'input-error' : ''}`}
              name="hospital"
              value={form.hospital}
              onChange={handleChange}
              placeholder="Apollo Hospital, Mumbai"
            />
          </Field>

          <Field label="Interaction Type">
            <select className="form-select" name="interaction_type" value={form.interaction_type} onChange={handleChange}>
              {['Visit', 'Call', 'Email', 'Conference'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {/* Section: Interaction Details */}
      <div className="form-section">
        <div className="form-section-title">
          <span className="section-num">02</span>
          Interaction Details
        </div>
        <div className="form-grid">
          <Field label="Date & Time">
            <input className="form-input" type="datetime-local" name="datetime" value={form.datetime} onChange={handleChange} />
          </Field>

          <Field label="Products Discussed">
            <input className="form-input" name="products" value={form.products} onChange={handleChange} placeholder="Metformin XR, GlucoShield" />
          </Field>

          <Field label="Sentiment">
            <select className="form-select" name="sentiment" value={form.sentiment} onChange={handleChange}>
              {['Positive', 'Neutral', 'Negative'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Priority Level">
            <select className="form-select" name="priority_level" value={form.priority_level} onChange={handleChange}>
              {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>

          <div className="form-group form-full">
            <label className="form-label">Discussion Summary</label>
            <textarea
              className="form-textarea"
              name="summary"
              value={form.summary}
              onChange={handleChange}
              placeholder="Describe what was discussed during this interaction…"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Section: Follow-up */}
      <div className="form-section">
        <div className="form-section-title">
          <span className="section-num">03</span>
          Follow-up
        </div>

        <div className="followup-row">
          <label className="toggle-label">
            <input
              type="checkbox"
              name="follow_up_required"
              checked={form.follow_up_required}
              onChange={handleChange}
              className="toggle-checkbox"
            />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-text">Follow-up Required</span>
          </label>

          {form.follow_up_required && (
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Follow-up Date</label>
              <input
                className="form-input"
                type="date"
                name="follow_up_date"
                value={form.follow_up_date}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Additional Notes</label>
          <textarea
            className="form-textarea"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any additional notes or observations…"
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={() => setForm(INITIAL_STATE)}>
          <RotateCcw size={16} /> Reset
        </button>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? <span className="spinner" /> : <Save size={16} />}
          {loading ? 'Saving…' : 'Log Interaction'}
        </button>
      </div>

      <style>{`
        .structured-form { display: flex; flex-direction: column; gap: 1.5rem; }

        .form-section {
          background: var(--bg-surface-2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }

        .form-section-title {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.9375rem;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }

        .section-num {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--brand-primary);
          background: rgba(26,86,219,0.08);
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-weight: 600;
        }

        .field-error {
          font-size: 0.75rem;
          color: var(--brand-danger);
          margin-top: 0.125rem;
        }

        .input-error { border-color: var(--brand-danger) !important; }

        .followup-row {
          display: flex;
          align-items: flex-start;
          gap: 2rem;
          flex-wrap: wrap;
        }

        /* Toggle Switch */
        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding-top: 0.25rem;
        }

        .toggle-checkbox { display: none; }

        .toggle-track {
          width: 44px; height: 24px;
          background: var(--border-color);
          border-radius: 12px;
          position: relative;
          transition: background var(--transition-base);
        }

        .toggle-checkbox:checked + .toggle-track {
          background: var(--brand-primary);
        }

        .toggle-thumb {
          position: absolute;
          width: 18px; height: 18px;
          background: white;
          border-radius: 50%;
          top: 3px; left: 3px;
          transition: transform var(--transition-base);
          box-shadow: var(--shadow-xs);
        }

        .toggle-checkbox:checked + .toggle-track .toggle-thumb {
          transform: translateX(20px);
        }

        .toggle-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding-top: 0.5rem;
        }
      `}</style>
    </form>
  );
}
