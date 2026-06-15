import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import api from '../api';
import MemberSelect from './MemberSelect';

const PLATFORMS = [
  { id: 'meet', label: 'Google Meet', color: '#1a73e8' },
  { id: 'zoom', label: 'Zoom', color: '#2D8CFF' },
  { id: 'teams', label: 'Microsoft Teams', color: '#6264A7' },
];

const DURATIONS = [
  { label: '15 min', min: 15 },
  { label: '30 min', min: 30 },
  { label: '45 min', min: 45 },
  { label: '1 hour', min: 60 },
  { label: '1.5 hours', min: 90 },
  { label: '2 hours', min: 120 },
];

function makeLink(platform) {
  const rand = () => Math.random().toString(36).substring(2, 11);
  if (platform === 'meet') return `https://meet.google.com/${rand().slice(0, 3)}-${rand().slice(0, 4)}-${rand().slice(0, 3)}`;
  if (platform === 'zoom') return `https://zoom.us/j/${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${rand()}%40thread.v2/0?context={"Tid"%3a"mock"}`;
}

export default function MeetingScheduler({ isOpen, onClose, members, initialParticipantIds = [] }) {
  const [platform, setPlatform] = useState('meet');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [durationMin, setDurationMin] = useState(30);
  const [participants, setParticipants] = useState([]);
  const [agenda, setAgenda] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setPlatform('meet');
    setTitle('');
    const d = new Date();
    setDate(d.toISOString().slice(0, 10));
    setTime('10:00');
    setDurationMin(30);
    setParticipants([...(initialParticipantIds ?? [])]);
    setAgenda('');
    setGeneratedLink('');
    setToast('');
     
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const durationLabel = DURATIONS.find((x) => x.min === durationMin)?.label || `${durationMin} min`;

  const handleGenerate = () => {
    setGeneratedLink(makeLink(platform));
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setToast('Copied!');
      setTimeout(() => setToast(''), 2000);
    } catch {
      setToast('Copy failed');
      setTimeout(() => setToast(''), 2000);
    }
  };

  const handleSendInvite = async () => {
    const linkForInvite = generatedLink || makeLink(platform);
    const scheduled_at = date && time ? new Date(`${date}T${time}`).toISOString() : new Date().toISOString();
    try {
      await api.post('meetings/', {
        title: title || 'Meeting',
        platform,
        scheduled_at,
        duration_minutes: durationMin,
        participants,
        agenda,
        meeting_link: linkForInvite,
      });
    } catch {
      /* still open compose mock flow */
    }
    const plainBody = `You're invited to ${title || 'a meeting'} on ${date} at ${time} for ${durationLabel}. Join here: ${linkForInvite}\n\nAgenda: ${agenda || '(none)'}`;
    const htmlBody = plainBody.replace(/\n/g, '<br/>');
    onClose();
  };

  return (
    <>
      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--text)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 600,
            boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
          }}
        >
          {toast}
        </div>
      )}
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="presentation">
        <div className="modal" style={{ maxWidth: 560 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="modal-title" style={{ marginBottom: 0 }}>
              Schedule a Meeting
            </div>
            <button type="button" className="logout-btn" onClick={onClose} aria-label="Close" style={{ color: 'var(--muted)', fontSize: 24 }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
            {PLATFORMS.map((p) => (
              <button
                type="button"
                key={p.id}
                className={`meet-platform-opt ${platform === p.id ? 'is-selected' : ''}`}
                onClick={() => setPlatform(p.id)}
                style={{
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: p.color, marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.id === 'meet' ? 'Video' : p.id === 'zoom' ? 'Video' : 'Video'}</div>
                {platform === p.id && (
                  <span style={{ position: 'absolute', top: 8, right: 8, color: p.color, fontWeight: 800 }} title="Selected">
                    <Check size={15} strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Meeting title</label>
            <input
              className="form-input"
              style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekly sync"
            />
          </div>

          <div className="form-row" style={{ marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Date</label>
              <input
                className="form-input"
                type="date"
                style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Time</label>
              <input
                className="form-input"
                type="time"
                style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Duration</label>
            <select
              className="form-input form-select"
              style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            >
              {DURATIONS.map((d) => (
                <option key={d.min} value={d.min}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <MemberSelect label="Participants" members={members} value={participants} onChange={setParticipants} placeholder="Add participants…" />

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Agenda</label>
            <textarea
              className="form-input"
              rows={3}
              style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', resize: 'vertical' }}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Discussion topics…"
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <button type="button" className="btn-secondary" onClick={handleGenerate}>
              Generate Link
            </button>
            {generatedLink && (
              <>
                <input
                  readOnly
                  className="form-input"
                  style={{ flex: 1, minWidth: 200, background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={generatedLink}
                />
                <button type="button" className="btn-primary btn-sm" onClick={handleCopy}>
                  Copy
                </button>
              </>
            )}
          </div>

          <div className="modal-actions modal-actions-split">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleSendInvite}>
              Send Invite
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
