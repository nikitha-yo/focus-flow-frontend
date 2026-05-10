import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Members() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('org/members/').then(r => { setMembers(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{marginTop:40}}/>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">👥 Team Members</div>
          <div className="page-subtitle">{user?.org?.name} · {members.length} members</div>
        </div>
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
    </div>
  );
}
