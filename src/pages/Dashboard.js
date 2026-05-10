import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
  const { user, isOrg } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('dashboard/').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding:32}}><div className="spinner"/></div>;
  if (!stats) return null;

  const chartData = [
    { name:'Tasks', value: stats.tasks.total },
    { name:'Done', value: stats.tasks.completed },
    { name:'Pending', value: stats.tasks.pending },
    { name:'Sessions', value: stats.focus.total_sessions },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, {user?.username}! 👋</div>
          <div className="page-subtitle">{new Date().toLocaleDateString('en-US', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>
        </div>
        {isOrg && (
          <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(37,99,235,0.08)',border:'1px solid rgba(37,99,235,0.2)',borderRadius:10,padding:'8px 16px'}}>
            <span style={{fontSize:18}}>🏢</span>
            <div><div style={{fontSize:13,fontWeight:600,color:'var(--blue)'}}>{user?.org?.name}</div>
            <div style={{fontSize:11,color:'var(--muted)'}}>Role: {user?.role}</div></div>
          </div>
        )}
      </div>

      {isOrg && stats.org && (
        <div className="org-banner">
          <div>
            <div className="org-badge">🏢 {user?.org?.name}</div>
            <div style={{fontSize:22,fontWeight:700,marginBottom:4}}>{stats.org.total_members} Team Members</div>
            <div style={{opacity:0.8,fontSize:14}}>{stats.org.org_tasks_completed}/{stats.org.org_tasks_total} org tasks completed</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:40,fontWeight:800}}>{stats.org.org_tasks_total > 0 ? Math.round(stats.org.org_tasks_completed/stats.org.org_tasks_total*100) : 0}%</div>
            <div style={{opacity:0.7,fontSize:13}}>Team completion rate</div>
          </div>
        </div>
      )}

      <div className="card-grid card-grid-4" style={{marginBottom:24}}>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.tasks.completed}</div>
          <div className="stat-label">Tasks Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.tasks.pending}</div>
          <div className="stat-label">Tasks Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{stats.focus.total_focus_mins}</div>
          <div className="stat-label">Focus Minutes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value" style={{color:'#f97316'}}>{stats.streak.current_streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
      </div>

      <div className="card-grid card-grid-2">
        <div className="chart-wrapper">
          <div className="chart-title">Activity Overview</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{fontSize:12}} />
              <YAxis tick={{fontSize:12}} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--teal)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="chart-title">Performance Snapshot</div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <ProgressBar label="Completion Rate" value={stats.tasks.completion_rate} color="var(--teal)" />
            <ProgressBar label="Focus Sessions" value={Math.min(stats.focus.total_sessions * 10, 100)} color="var(--blue)" />
            <ProgressBar label="Streak Progress" value={Math.min(stats.streak.current_streak * 10, 100)} color="#f97316" />
          </div>
          {stats.last_mood && (
            <div style={{marginTop:20,padding:'12px 16px',background:'var(--s2)',borderRadius:10,border:'1px solid var(--border)'}}>
              <div style={{fontSize:12,color:'var(--muted)',marginBottom:4}}>Last Mood Check-in</div>
              <div style={{fontWeight:600,textTransform:'capitalize'}}>{stats.last_mood.mood} · Energy {stats.last_mood.energy_level}/5</div>
              <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>{stats.last_mood.recommendation}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color }) {
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
        <span style={{fontSize:13,color:'var(--muted)'}}>{label}</span>
        <span style={{fontSize:13,fontWeight:600}}>{Math.round(value)}%</span>
      </div>
      <div style={{height:8,background:'var(--s3)',borderRadius:4}}>
        <div style={{height:'100%',width:`${value}%`,background:color,borderRadius:4,transition:'width 0.5s'}}/>
      </div>
    </div>
  );
}
