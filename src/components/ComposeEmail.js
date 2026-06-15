import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import MemberSelect from './MemberSelect';
import DocumentPickerModal from './DocumentPickerModal';

const toolbarBtn = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--s2)',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text)',
  fontFamily: '"DM Sans",sans-serif',
};

export default function ComposeEmail({
  isOpen,
  onClose,
  members = [],
  initialToIds = [],
  initialCcIds = [],
  initialSubject = '',
  initialBody = '',
  initialAttachments = [],
}) {
  const [to, setTo] = useState([]);
  const [cc, setCc] = useState([]);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setTo([...(initialToIds ?? [])]);
    setCc([...(initialCcIds ?? [])]);
    setSubject(initialSubject ?? '');
    setAttachments(Array.isArray(initialAttachments) ? [...initialAttachments] : []);
    setError('');
    const html = initialBody ?? '';
    setBodyHtml(html);
    requestAnimationFrame(() => {
      if (editorRef.current) editorRef.current.innerHTML = html;
    });
     
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps -- hydrate once each time modal opens

  if (!isOpen) return null;

  const exec = (cmd) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, null);
    if (editorRef.current) setBodyHtml(editorRef.current.innerHTML);
  };

  const syncBody = () => {
    if (editorRef.current) setBodyHtml(editorRef.current.innerHTML);
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async (status) => {
    syncBody();
    const html = editorRef.current?.innerHTML || bodyHtml;
    setError('');
    setBusy(true);
    try {
      const realIds = attachments.filter((a) => a && a.id).map((a) => a.id);
      const mockTitles = attachments.filter((a) => a && !a.id && a.title).map((a) => a.title);
      let finalBody = html || '';
      if (mockTitles.length) {
        finalBody += `<p><em>Referenced files:</em> ${mockTitles.map((t) => String(t).replace(/</g, '')).join(', ')}</p>`;
      }
      await api.post('emails/', {
        to,
        cc,
        subject,
        body: finalBody,
        attachments: realIds,
        status,
      });
      onClose();
    } catch (e) {
      const err = e.response?.data;
      if (typeof err === 'object' && err && !err.error) setError(Object.values(err).flat().join(' ') || 'Request failed');
      else setError(err?.error || err?.detail || 'Could not save email');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="presentation">
        <div className="modal" style={{ maxWidth: 640, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="modal-title" style={{ marginBottom: 0 }}>
              Compose Email
            </div>
            <button type="button" className="logout-btn" onClick={onClose} aria-label="Close" style={{ color: 'var(--muted)', fontSize: 24 }}>
              ×
            </button>
          </div>

          {error && (
            <div
              className="error-msg"
              style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--coral)', border: '1px solid rgba(220,38,38,0.2)', marginBottom: 12 }}
            >
              {error}
            </div>
          )}

          <div style={{ overflowY: 'auto', paddingRight: 4 }}>
            <MemberSelect label="To" members={members} value={to} onChange={setTo} placeholder="Add recipients…" />
            <MemberSelect label="CC" members={members} value={cc} onChange={setCc} placeholder="Carbon copy…" />

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Subject</label>
              <input
                className="form-input"
                style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line"
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Body</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <button type="button" style={toolbarBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')}>
                  Bold
                </button>
                <button type="button" style={toolbarBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')}>
                  Italic
                </button>
                <button type="button" style={toolbarBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec('underline')}>
                  Underline
                </button>
                <button type="button" style={toolbarBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec('insertUnorderedList')}>
                  Bullets
                </button>
              </div>
              <div
                ref={editorRef}
                className="form-input"
                contentEditable
                suppressContentEditableWarning
                onInput={syncBody}
                onBlur={syncBody}
                style={{
                  background: 'var(--s2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  minHeight: 160,
                  textAlign: 'left',
                  overflowY: 'auto',
                }}
              />
            </div>

            <button type="button" className="btn-secondary btn-sm" style={{ marginBottom: 10 }} onClick={() => setPickerOpen(true)}>
              📎 Attach Files
            </button>

            {attachments.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {attachments.map((a, i) => (
                  <span
                    key={`${a.id || 'mock'}-${i}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--s3)',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {a.title || 'File'}
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions modal-actions-split" style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <button type="button" className="btn-secondary" onClick={() => submit('draft')} disabled={busy}>
              {busy ? 'Working…' : 'Save Draft'}
            </button>
            <button type="button" className="btn-primary" onClick={() => submit('sent')} disabled={busy}>
              {busy ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      <DocumentPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialSelection={attachments}
        onConfirm={(chosen) => {
          setAttachments((prev) => {
            const map = new Map(prev.map((p) => [p.id || p.title, p]));
            chosen.forEach((c) => map.set(c.id, c));
            return Array.from(map.values());
          });
        }}
      />
    </>
  );
}
