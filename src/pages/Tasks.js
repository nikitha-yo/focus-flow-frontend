import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

const PRIORITIES = ['high','medium','low'];
const CATEGORIES = ['study','work','personal'];
const STATUSES = ['pending','in_progress','completed'];

export default function Tasks() {
  const { user, isOrg } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title:'', description:'', category:'personal', priority:'medium', due_date:'', assigned_to:'' });
  const [editTask, setEditTask] = useState(null);

  const load = async () => {
    const res = await api.get('tasks/');
    setTasks(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (isOrg && ['admin','manager'].includes(user?.role)) {
      api.get('org/members/').then(r => setMembers(r.data)).catch(()=>{});
    }
  }, []);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const openAdd = () => { setEditTask(null); setForm({title:'',description:'',category:'personal',priority:'medium',due_date:'',assigned_to:''}); setShowModal(true); };
  const openEdit = (t) => { setEditTask(t); setForm({title:t.title,description:t.description||'',category:t.category,priority:t.priority,due_date:t.due_date||'',assigned_to:t.assigned_to||''}); setShowModal(true); };

  const save = async () => {
    const payload = { ...form };
    if (!payload.due_date) delete payload.due_date;
    if (!payload.assigned_to) delete payload.assigned_to;
    try {
      if (editTask) await api.patch(`tasks/${editTask.id}/`, payload);
      else await api.post('tasks/', payload);
      setShowModal(false);
      load();
    } catch(e) { alert(JSON.stringify(e.response?.data)); }
  };

  const toggle = async (t) => {
    const newStatus = t.status === 'completed' ? 'pending' : 'completed';
    await api.patch(`tasks/${t.id}/`, { status: newStatus });
    load();
  };

  const del = async (id) => {
    if (window.confirm('Delete this task?')) { await api.delete(`tasks/${id}/`); load(); }
  };

  const filtered = filter==='all' ? tasks : tasks.filter(t => t.status===filter || t.priority===filter || t.category===filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{isOrg ? 'Team Tasks' : 'My Tasks'}</div>
          <div className="page-subtitle">{tasks.length} tasks total · {tasks.filter(t=>t.status==='completed').length} completed</div>
        </div>
        <button className="btn btn-teal" onClick={openAdd}>+ Add Task</button>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {['all','pending','in_progress','completed','high','medium','low'].map(f => (
          <button key={f} className={`btn btn-sm ${filter===f?'btn-teal':'btn-ghost'}`} onClick={() => setFilter(f)} style={{textTransform:'capitalize'}}>
            {f==='all'?'All':f.replace('_',' ')}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner" style={{marginTop:40}}/> : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No tasks found</div>
          <div>Add your first task to get started!</div>
        </div>
      ) : filtered.map(t => (
        <div key={t.id} className="task-item">
          <div className={`task-check ${t.status==='completed'?'done':''}`} onClick={() => toggle(t)}>
            {t.status==='completed' && '✓'}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div className={`task-title ${t.status==='completed'?'done':''}`}>{t.title}</div>
            <div className="task-meta">
              {t.category} · {t.due_date && `Due ${t.due_date}`}
              {isOrg && t.assigned_by_name && ` · Assigned by ${t.assigned_by_name}`}
            </div>
          </div>
          <span className={`badge badge-${t.priority}`}>{t.priority}</span>
          <span className={`badge badge-${t.status}`} style={{marginLeft:6}}>{t.status.replace('_',' ')}</span>
          <button className="btn btn-sm btn-ghost" style={{marginLeft:8}} onClick={() => openEdit(t)}>✏️</button>
          <button className="btn btn-sm btn-danger" style={{marginLeft:4}} onClick={() => del(t.id)}>🗑️</button>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">{editTask ? 'Edit Task' : 'Add New Task'}</div>
            <div className="form-group"><label className="form-label" style={{color:'var(--muted)'}}>Title *</label>
              <input className="form-input" style={{background:'var(--s2)',border:'1px solid var(--border)',color:'var(--text)'}} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Task title"/>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label" style={{color:'var(--muted)'}}>Category</label>
                <select className="form-input form-select" style={{background:'var(--s2)',border:'1px solid var(--border)',color:'var(--text)'}} value={form.category} onChange={e=>set('category',e.target.value)}>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label" style={{color:'var(--muted)'}}>Priority</label>
                <select className="form-input form-select" style={{background:'var(--s2)',border:'1px solid var(--border)',color:'var(--text)'}} value={form.priority} onChange={e=>set('priority',e.target.value)}>
                  {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            {editTask && <div className="form-group"><label className="form-label" style={{color:'var(--muted)'}}>Status</label>
              <select className="form-input form-select" style={{background:'var(--s2)',border:'1px solid var(--border)',color:'var(--text)'}} value={form.status||editTask.status} onChange={e=>set('status',e.target.value)}>
                {STATUSES.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>}
            <div className="form-group"><label className="form-label" style={{color:'var(--muted)'}}>Due Date</label>
              <input className="form-input" type="date" style={{background:'var(--s2)',border:'1px solid var(--border)',color:'var(--text)'}} value={form.due_date} onChange={e=>set('due_date',e.target.value)}/>
            </div>
            {isOrg && members.length>0 && (
              <div className="form-group"><label className="form-label" style={{color:'var(--muted)'}}>Assign To</label>
                <select className="form-input form-select" style={{background:'var(--s2)',border:'1px solid var(--border)',color:'var(--text)'}} value={form.assigned_to} onChange={e=>set('assigned_to',e.target.value)}>
                  <option value="">-- Self --</option>
                  {members.map(m=><option key={m.id} value={m.id}>{m.username} ({m.role})</option>)}
                </select>
              </div>
            )}
            <div className="form-group"><label className="form-label" style={{color:'var(--muted)'}}>Description</label>
              <textarea className="form-input" rows={3} style={{background:'var(--s2)',border:'1px solid var(--border)',color:'var(--text)',resize:'vertical'}} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Optional notes..."/>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-teal" onClick={save}>{editTask?'Update':'Add Task'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
