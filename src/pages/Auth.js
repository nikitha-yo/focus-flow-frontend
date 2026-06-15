import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Auth() {
  const [tab, setTab] = useState('signin');
  const [userType, setUserType] = useState('individual');
  const [form, setForm] = useState({ username:'', email:'', password:'', role:'member', org_id:'', org_name:'', org_type:'corporate', org_admin_email:'' });
  const [orgs, setOrgs] = useState([]);
  const [orgsLoaded, setOrgsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const loadOrgs = async () => {
    if (!orgsLoaded) {
      try { const res = await api.get('organisations/'); setOrgs(res.data); setOrgsLoaded(true); } catch{}
    }
  };

  const handleTypeChange = (type) => { setUserType(type); if (type === 'org') loadOrgs(); setError(''); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (tab === 'signin') {
        const res = await api.post('auth/login/', { email: form.email, password: form.password });
        login(res.data.user, res.data.access, res.data.refresh);
        navigate('/dashboard');
      } else {
        let orgId = null;
        if (userType === 'org') {
          if (form.org_id) { orgId = form.org_id; }
          else {
            const orgRes = await api.post('organisations/', { name: form.org_name, type: form.org_type, admin_email: form.org_admin_email || form.email });
            orgId = orgRes.data.id;
          }
        }
        const res = await api.post('auth/register/', { username: form.username, email: form.email, password: form.password, role: userType==='individual'?'individual':form.role, org_id: orgId });
        login(res.data.user, res.data.access, res.data.refresh);
        navigate('/dashboard');
      }
    } catch (e) {
      const err = e.response?.data;
      if (typeof err === 'object' && !err.error) setError(Object.values(err).flat().join(' '));
      else setError(err?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const isOrg = userType === 'org';

  return (
    <div className="auth-split">
      <aside className="auth-brand-panel">
        <div className="auth-brand-inner">
          <div className="auth-brand-logo-row">
            <div className="auth-brand-logo-mark">🔥</div>
            <div className="auth-brand-title">FocusFlow</div>
          </div>
          <p className="auth-brand-tagline">Stay focused. Stay balanced.</p>
          <div className="auth-brand-pills">
            <span className="auth-brand-pill">Mood Tracking</span>
            <span className="auth-brand-pill">Focus Sessions</span>
            <span className="auth-brand-pill">Team Insights</span>
          </div>
        </div>
        <div className="auth-brand-accent-bar" />
      </aside>
      <div className="auth-form-panel">
        <div className={`auth-signin-card ${error ? 'auth-has-error' : ''}`}>
          <div className="auth-tabs-inline">
            <button type="button" className={`auth-tab-inline ${tab==='signin'?'active':''}`} onClick={() => {setTab('signin');setError('');}}>Sign In</button>
            <button type="button" className={`auth-tab-inline ${tab==='signup'?'active':''}`} onClick={() => {setTab('signup');setError('');}}>Sign Up</button>
          </div>
          {error && <div className="error-msg auth-error-msg">{error}</div>}

          {tab === 'signin' ? (
            <>
              <h1 className="auth-card-title">Welcome back</h1>
              <p className="auth-card-sub">Sign in to your workspace</p>
              <div className="form-group">
                <label className="form-label-muted">Email</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label-muted">Password</label>
                <input type="password" placeholder="••••••••" value={form.password} onChange={e=>set('password',e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
              </div>
              <div className="auth-forgot-row">
                <span className="auth-forgot-link">Forgot password?</span>
              </div>
              <button type="button" className="btn-primary auth-btn-block" onClick={handleSubmit} disabled={loading}>{loading?'Signing in...':'Sign In'}</button>
              <div className="auth-divider">— or —</div>
              <button type="button" className="btn-secondary auth-btn-block" onClick={() => {setTab('signup'); setError('');}}>Create an account</button>
            </>
          ) : (
            <>
              <h1 className="auth-card-title">Create an account</h1>
              <p className="auth-card-sub">Start your productivity journey</p>
              <div className="auth-type-select">
                <button type="button" className={`type-btn ${!isOrg?'active':''}`} onClick={() => handleTypeChange('individual')}>
                  <div className="icon">👤</div><div className="label">Individual</div><div className="desc">Personal productivity</div>
                </button>
                <button type="button" className={`type-btn org-btn ${isOrg?'active':''}`} onClick={() => handleTypeChange('org')}>
                  <div className="icon">🏢</div><div className="label">Organisation</div><div className="desc">Team workspace</div>
                </button>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label-muted">Username</label>
                  <input placeholder="username" value={form.username} onChange={e=>set('username',e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label-muted">Email</label>
                  <input type="email" placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label-muted">Password</label>
                <input type="password" placeholder="Min 6 chars" value={form.password} onChange={e=>set('password',e.target.value)} />
              </div>
              {isOrg && (<>
                <div className="form-group">
                  <label className="form-label-muted">Your Role</label>
                  <select value={form.role} onChange={e=>set('role',e.target.value)}>
                    <option value="admin">Admin</option><option value="manager">Manager</option><option value="member">Member</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label-muted">Join Existing Organisation</label>
                  <select value={form.org_id} onChange={e=>set('org_id',e.target.value)}>
                    <option value="">-- Create New Organisation --</option>
                    {orgs.map(o=><option key={o.id} value={o.id}>{o.name} ({o.type})</option>)}
                  </select>
                </div>
                {!form.org_id && (<>
                  <div className="form-group">
                    <label className="form-label-muted">Organisation Name</label>
                    <input placeholder="Acme Corp / MG University" value={form.org_name} onChange={e=>set('org_name',e.target.value)} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label-muted">Type</label>
                      <select value={form.org_type} onChange={e=>set('org_type',e.target.value)}>
                        <option value="corporate">Corporate</option><option value="university">University</option><option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label-muted">Admin Email</label>
                      <input type="email" placeholder="admin@org.com" value={form.org_admin_email} onChange={e=>set('org_admin_email',e.target.value)} />
                    </div>
                  </div>
                </>)}
              </>)}
              <button type="button" className="btn-primary auth-btn-block" onClick={handleSubmit} disabled={loading}>
                {loading?'Creating account...':`Sign Up as ${isOrg?'Organisation Member':'Individual'}`}
              </button>
              <div className="auth-divider">— or —</div>
              <button type="button" className="btn-secondary auth-btn-block" onClick={() => {setTab('signin'); setError('');}}>
                Already have an account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
