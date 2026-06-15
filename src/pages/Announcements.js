import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  FileText,
  Megaphone,
  Pencil,
  Pin,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

const PRIORITY_COLORS = {
  high: '#c0392b',
  medium: '#d97706',
  low: '#16a34a',
};

const PRIORITY_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const FILTERS = {
  all: { label: 'All', Icon: Pin },
  announcements: { label: 'Announcements', Icon: FileText },
  meetings: { label: 'Meetings', Icon: CalendarDays },
  high: { label: 'High Priority', Icon: AlertTriangle },
};

export default function Announcements() {
  const { user, isOrg } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium',
    expiry_date: '',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('announcements/');
      setAnnouncements(res.data);
    } catch {
      setAnnouncements([]);
    }
    setLoading(false);
  };

  const getFilteredAnnouncements = () => {
    let filtered = announcements;
    if (filter === 'announcements') {
      filtered = filtered.filter(a => a.announcement_type === 'announcement');
    } else if (filter === 'meetings') {
      filtered = filtered.filter(a => a.announcement_type === 'meeting');
    } else if (filter === 'high') {
      filtered = filtered.filter(a => a.priority === 'high');
    }
    return filtered;
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const payload = { ...formData };
      if (!payload.expiry_date) delete payload.expiry_date;
      
      if (editingId) {
        await api.put(`announcements/${editingId}/`, payload);
      } else {
        await api.post('announcements/', payload);
      }
      setFormData({ title: '', message: '', priority: 'medium', expiry_date: '' });
      setIsCreating(false);
      setEditingId(null);
      fetchAnnouncements();
    } catch (err) {
      alert('Error saving announcement: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.delete(`announcements/${id}/`);
        fetchAnnouncements();
      } catch (err) {
        alert('Error deleting announcement');
      }
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority,
      expiry_date: announcement.expiry_date ? announcement.expiry_date.slice(0, 10) : '',
    });
    setEditingId(announcement.id);
    setIsCreating(true);
  };

  const canManage = user?.role === 'admin' || user?.role === 'manager';
  const filtered = getFilteredAnnouncements();

  if (loading) return <div style={{padding:32}}><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Announcements</div>
          <div className="page-subtitle">Organization updates and meeting notifications</div>
        </div>
        {canManage && (
          <div className="dashboard-header-actions">
            {!isCreating && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setFormData({ title: '', message: '', priority: 'medium', expiry_date: '' });
                  setEditingId(null);
                  setIsCreating(true);
                }}
              >
                <Plus size={16} /> New Announcement
              </button>
            )}
          </div>
        )}
      </div>

      {isCreating && (
        <div className="card" style={{ marginBottom: 24, padding: '24px', border: '2px solid var(--color-maroon)' }}>
          <div className="chart-title" style={{ marginBottom: 16 }}>
            <span className="icon-heading"><Pencil size={18} /> {editingId ? 'Edit Announcement' : 'Create New Announcement'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }}>
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="Announcement message"
                rows="4"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }}>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }}>
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleCreate}
              >
                {editingId ? <><Save size={16} /> Update</> : <><Check size={16} /> Create</>}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  setFormData({ title: '', message: '', priority: 'medium', expiry_date: '' });
                }}
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {Object.keys(FILTERS).map(f => {
          const FilterIcon = FILTERS[f].Icon;
          return (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              fontWeight: 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: filter === f ? 'var(--color-maroon)' : 'var(--s2)',
              color: filter === f ? '#fff' : 'var(--text)',
              transition: 'all 0.2s',
            }}
          >
            <FilterIcon size={15} /> {FILTERS[f].label}
          </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: 48 }}>
          <div className="empty-icon"><Megaphone size={28} /></div>
          <div className="empty-title">No announcements yet</div>
          <div className="empty-description">
            {filter !== 'all' ? 'No announcements match your filter' : 'Announcements will appear here'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(announcement => (
            <div
              key={announcement.id}
              className="card"
              style={{
                position: 'relative',
                borderLeft: `4px solid ${PRIORITY_COLORS[announcement.priority] || '#999'}`,
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <span className="inline-icon" style={{ color: 'var(--color-maroon)' }}>
                      {announcement.announcement_type === 'meeting' ? <CalendarDays size={19} /> : <Pin size={19} />}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#000' }}>
                        {announcement.title}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      background: PRIORITY_COLORS[announcement.priority],
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {PRIORITY_LABELS[announcement.priority]}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text)',
                    lineHeight: 1.5,
                    marginBottom: 12,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {announcement.message}
                </div>

                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                  <div>By {announcement.created_by_name}</div>
                  <div>{new Date(announcement.created_at).toLocaleDateString()} at {new Date(announcement.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  {announcement.expiry_date && (
                    <div>Expires: {new Date(announcement.expiry_date).toLocaleDateString()}</div>
                  )}
                </div>

                {canManage && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => handleEdit(announcement)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(announcement.id)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        background: '#c0392b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
