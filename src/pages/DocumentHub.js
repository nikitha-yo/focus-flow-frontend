import React, { useEffect, useMemo, useRef, useState } from 'react';
import { File, FileSpreadsheet, FileText, FolderOpen } from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

const MOCK_DRIVE_NAMES = ['Q4 OKRs.docx', 'Team Budget FY26.xlsx', 'Product roadmap.pdf', 'All-hands recap.docx'];

function iconFor(ft) {
  if (ft === 'pdf') return { Icon: File, bg: '#fee2e2', color: '#b91c1c' };
  if (ft === 'docx') return { Icon: FileText, bg: '#dbeafe', color: '#1d4ed8' };
  return { Icon: FileSpreadsheet, bg: '#dcfce7', color: '#15803d' };
}

export default function DocumentHub() {
  const { isOrg } = useAuth();
  const [members, setMembers] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all'); // all | pdf | docx | xlsx
  const fileInputRef = useRef(null);

  const [driveOpen, setDriveOpen] = useState(false);
  const [drivePhase, setDrivePhase] = useState('idle');
  const [mockImports, setMockImports] = useState([]); // fake Drive rows (frontend-only)

  const loadDocs = () => {
    api
      .get('documents/')
      .then((r) => setDocs(r.data))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocs();
  }, []);

  useEffect(() => {
    if (!isOrg) {
      setMembers([]);
      return;
    }
    api
      .get('org/members/')
      .then((r) => setMembers(r.data))
      .catch(() => setMembers([]));
  }, [isOrg]);

  const merged = useMemo(() => [...docs, ...mockImports], [docs, mockImports]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return merged.filter((d) => {
      if (tab !== 'all' && d.file_type !== tab) return false;
      if (q && !String(d.title).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [merged, query, tab]);

  const openDriveFlow = () => {
    setDriveOpen(true);
    setDrivePhase('loading');
    setTimeout(() => setDrivePhase('done'), 1500);
  };

  const closeDrive = () => {
    setDriveOpen(false);
    setDrivePhase('idle');
  };

  const importMocks = () => {
    const next = MOCK_DRIVE_NAMES.map((title, idx) => {
      const ft = title.endsWith('.pdf') ? 'pdf' : title.endsWith('.docx') ? 'docx' : 'xlsx';
      return {
        mockKey: `drive-${idx}`,
        title,
        file_type: ft,
        file_url: null,
        uploaded_by_name: 'Google Drive',
        uploaded_at: new Date().toISOString(),
      };
    });
    setMockImports((prev) => [...next, ...prev]);
    closeDrive();
  };

  const onUploadPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', file.name);
    try {
      const res = await api.post('documents/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDocs((prev) => [res.data, ...prev]);
    } catch {
      /* ignore */
    }
  };


  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pdf', label: 'PDF' },
    { id: 'docx', label: 'DOCX' },
    { id: 'xlsx', label: 'XLSX' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Document Hub</div>
          <div className="page-subtitle">Upload, search, and share org documents</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" className="btn-secondary" onClick={openDriveFlow}>
            Connect Google Drive
          </button>
          <button type="button" className="btn-primary" onClick={() => fileInputRef.current?.click()}>
            Upload Document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".pdf,.docx,.xlsx"
            onChange={onUploadPick}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <input
          type="search"
          className="form-input"
          placeholder="Search by filename..."
          style={{ flex: '1 1 220px', maxWidth: 360, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)' }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`btn btn-sm ${tab === t.id ? 'filter-active' : 'btn-ghost'}`}
              onClick={() => setTab(t.id)}
              style={{ textTransform: 'none' }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <div className="empty-state card" style={{ background: 'var(--s1)' }}>
          <div className="empty-icon"><FolderOpen size={28} /></div>
          <div className="empty-title">No matches</div>
          <div>Upload a PDF, DOCX, or XLSX file to get started.</div>
        </div>
      ) : (
        <div className="card-grid card-grid-3">
          {filtered.map((d) => {
            const sty = iconFor(d.file_type);
            const FileIcon = sty.Icon;
            const iso = d.uploaded_at ? new Date(d.uploaded_at).toLocaleString() : '—';
            return (
              <div key={d.id || d.mockKey} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: sty.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      color: sty.color,
                      flexShrink: 0,
                    }}
                  >
                    <FileIcon size={23} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div title={d.title} style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                      {d.uploaded_by_name} · {iso}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 'auto' }}>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    disabled={!d.file_url}
                    title={!d.file_url ? 'Mock import — preview not available' : 'Preview'}
                    onClick={() => d.file_url && window.open(d.file_url, '_blank')}
                  >
                    Preview
                  </button>
                  {d.file_url ? (
                    <a href={d.file_url} download={d.title || 'document'} target="_blank" rel="noreferrer" className="btn-secondary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                      Download
                    </a>
                  ) : (
                    <span className="btn-secondary btn-sm" style={{ opacity: 0.45, cursor: 'not-allowed' }} title="Not available for mock imports">
                      Download
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {driveOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && drivePhase !== 'loading' && closeDrive()} role="presentation">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-title">{drivePhase === 'done' ? 'Google Drive' : 'Connect Google Drive'}</div>
            {drivePhase === 'loading' && (
              <>
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--muted)' }}>Connecting to Google Drive…</div>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </>
            )}
            {drivePhase === 'done' && (
              <>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>Connected! 12 files found</div>
                <ul style={{ paddingLeft: 18, marginBottom: 14, color: 'var(--text)' }}>
                  {MOCK_DRIVE_NAMES.map((name) => (
                    <li key={name} style={{ marginBottom: 6 }}>
                      {name}
                    </li>
                  ))}
                </ul>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeDrive}>
                    Close
                  </button>
                  <button type="button" className="btn-primary" onClick={importMocks}>
                    Import suggestions
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
