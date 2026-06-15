import React, { useEffect, useState } from 'react';
import api from '../api';

export default function DocumentPickerModal({ isOpen, onClose, onConfirm, initialSelection = [], title = 'Choose documents' }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(() => new Set(initialSelection.map((x) => x.id).filter(Boolean)));

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setSelectedIds(new Set((initialSelection || []).map((x) => x.id).filter(Boolean)));
    api
      .get('documents/')
      .then((r) => setDocs(r.data))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
     
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const chosen = docs.filter((d) => selectedIds.has(d.id));
    onConfirm(chosen);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="presentation">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="modal-title" style={{ marginBottom: 0 }}>
            {title}
          </div>
          <button type="button" className="logout-btn" onClick={onClose} aria-label="Close" style={{ color: 'var(--muted)', fontSize: 22 }}>
            ×
          </button>
        </div>
        {loading ? (
          <div className="spinner" style={{ margin: '24px auto' }} />
        ) : docs.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <div className="empty-icon">📭</div>
            <div className="empty-title">No documents yet</div>
            <div>Upload files from Document Hub first.</div>
          </div>
        ) : (
          <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {docs.map((d) => (
              <label
                key={d.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  background: selectedIds.has(d.id) ? 'var(--blue2)' : 'var(--s1)',
                }}
              >
                <input type="checkbox" checked={selectedIds.has(d.id)} onChange={() => toggle(d.id)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {d.file_type?.toUpperCase()} · {d.uploaded_by_name}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
        <div className="modal-actions modal-actions-split">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleConfirm} disabled={loading}>
            Attach selected
          </button>
        </div>
      </div>
    </div>
  );
}
