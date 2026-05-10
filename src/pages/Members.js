import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Members() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'member' });
  const canAddMembers = ['admin', 'manager'].includes(user?.role);

  useEffect(() => {
    api.get('org/members/').then(r => { setMembers(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const resetForm = () => {
    setForm({ username: '', email: '', password: '', role: 'member' });
    setError('');
  };

  const submitMember = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await api.post('org/members/', form);
      setMembers(prev => [res.data, ...prev]);
      setShowAddModal(false);
      resetForm();
    } catch (e) {
      const err = e.response?.data;
      if (typeof err === 'object' && !err.error) setError(Object.values(err).flat().join(' '));
      else setError(err?.error || 'Could not add team member');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" style={{marginTop:40}}/>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">👥 Team Members</div>
          <div className="page-subtitle">{user?.org?.name} · {members.length} members</div>
        </div>
        {canAddMembers && (
          <button className="btn btn-blue" onClick={() => setShowAddModal(true)}>
            + Add Team Member
          </button>
        )}
      </div>

      <div className="org-banner">
        <div>
          <div className="org-badge">🏢 {user?.org?.name}</div>
          <div style={{fontSize:20,fontWeight:700}}>{members.length} Team Members</div>
          <div style={{opacity:0.8,fontSize:14,marginTop:4}}>{user?.org?.type} organisation</div>
        </div>
        <div style={{fontSize:64}}>👥</div>
      </div>

      <div className="card-grid card-grid-3">
        {members.map(m => (
          <div key={m.id} className="card" style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:48,height:48,borderRadius:'50%',background:'var(--blue2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'var(--blue)'}}>
                {m.username[0].toUpperCase()}
              </div>
              <div>
                <div style={{fontWeight:600,fontSize:15}}>{m.username}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>{m.email}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span className={`badge ${m.role==='admin'?'badge-high':m.role==='manager'?'badge-medium':'badge-low'}`}>{m.role}</span>
              <span style={{fontSize:12,color:'var(--muted)'}}>Joined {new Date(m.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowAddModal(false)}>
          <div className="modal">
            <div className="modal-title">Add Team Member</div>
            {error && <div className="error-msg" style={{background:'rgba(220,38,38,0.08)', color:'var(--coral)', border:'1px solid rgba(220,38,38,0.2)'}}>{error}</div>}
            <div className="form-group">
              <label style={{fontSize:13, fontWeight:600, color:'var(--text)', display:'block', marginBottom:8}}>Username</label>
              <input
                className="form-input"
                style={{background:'var(--s2)',border:'1px solid var(--border)',color:'var(--text)'}}
                value={form.username}
                onChange={e=>set('username', e.target.value)}
                placeholder="username"
              />
            </div>
            <div className="form-group">
              <label style={{fontSize:13, fontWeight:600, color:'var(--text)', display:'block', marginBottom:8}}>Email</label>
              <input
                className="form-input"
                type="email"
                style={{background:'var(--s2)',border:'1px solid var(--border)',color:'var(--text)'}}
                value={form.email}
                onChange={e=>set('email', e.target.value)}
                placeholder="member@company.com"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label style={{fontSize:13, fontWeight:600, color:'var(--text)', display:'block', marginBottom:8}}>Password</label>
                <input
                  className="form-input"
                  type="password"
                  style={{background:'var(--s2)',border:'1px solid var(--border)',color:'var(--text)'}}
                  value={form.password}
                  onChange={e=>set('password', e.target.value)}
                  placeholder="Min 6 chars"
                />
              </div>
              <div className="form-group">
                <label style={{fontSize:13, fontWeight:600, color:'var(--text)', display:'block', marginBottom:8}}>Role</label>
                <select
                  className="form-input form-select"
                  style={{background:'var(--s2)',border:'1px solid var(--border)',color:'var(--text)'}}
                  value={form.role}
                  onChange={e=>set('role', e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setShowAddModal(false); resetForm(); }} disabled={saving}>Cancel</button>
              <button className="btn btn-blue" onClick={submitMember} disabled={saving}>
                {saving ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
