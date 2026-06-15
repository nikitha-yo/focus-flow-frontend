import React, { useMemo, useState, useRef, useEffect } from 'react';

const inputMix = {
  background: 'var(--s2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  borderRadius: 10,
  padding: '8px 10px',
  fontSize: 14,
  width: '100%',
  outline: 'none',
  fontFamily: '"DM Sans",sans-serif',
};

export default function MemberSelect({ label, members, value = [], onChange, placeholder = 'Add people…', disabledIds = [] }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const boxRef = useRef(null);

  const selectedMembers = useMemo(
    () => members.filter((m) => value.includes(m.id)),
    [members, value]
  );

  const available = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return members.filter((m) => {
      if (value.includes(m.id)) return false;
      if (disabledIds.includes(m.id)) return false;
      if (!q) return true;
      return (
        m.username.toLowerCase().includes(q) ||
        (m.email && String(m.email).toLowerCase().includes(q))
      );
    });
  }, [members, value, disabledIds, filter]);

  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const add = (id) => {
    onChange([...value, id]);
    setFilter('');
    setOpen(true);
  };

  const remove = (id) => {
    onChange(value.filter((x) => x !== id));
  };

  return (
    <div style={{ marginBottom: 14 }} ref={boxRef}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>{label}</label>
      )}
      <div
        style={{
          ...inputMix,
          minHeight: 44,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          cursor: 'text',
          position: 'relative',
        }}
        onClick={() => setOpen(true)}
      >
        {selectedMembers.map((m) => (
          <span
            key={m.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--blue2)',
              color: 'var(--blue)',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {m.username}
            <button
              type="button"
              aria-label={`Remove ${m.username}`}
              onClick={(e) => {
                e.stopPropagation();
                remove(m.id);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--blue)',
                fontSize: 16,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={selectedMembers.length ? '' : placeholder}
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          style={{
            flex: 1,
            minWidth: 120,
            border: 'none',
            background: 'transparent',
            fontSize: 14,
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        {open && available.length > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '100%',
              marginTop: 4,
              maxHeight: 200,
              overflowY: 'auto',
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              boxShadow: '0 12px 32px rgba(15,23,42,0.12)',
              zIndex: 20,
            }}
          >
            {available.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => add(m.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--text)',
                }}
              >
                <div style={{ fontWeight: 600 }}>{m.username}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.email}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
