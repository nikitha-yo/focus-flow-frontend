import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from 'recharts';
import MeetingScheduler from '../components/MeetingScheduler';

const BAR_COLORS = ['#c0392b', '#2563eb', '#16a34a', '#d97706'];

export default function Dashboard() {
  const { user, isOrg } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [meetSeedParticipants, setMeetSeedParticipants] = useState([]);

  useEffect(() => {
    api.get('dashboard/').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isOrg) return;
    api.get('org/members/').then(r => setMembers(r.data)).catch(() => setMembers([]));
  }, [isOrg]);

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
          <div className="dashboard-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setMeetSeedParticipants([]);
                setMeetingOpen(true);
              }}
            >
              📅 Schedule Meeting
            </button>
          </div>
        )}
      </div>

      {isOrg && stats.org && (
        <div className="org-banner">
          <div>
            <div className="org-badge">🏢 {user?.org?.name}</div>
            <div style={{fontSize:22,fontWeight:700,marginBottom:4,color:'#fff'}}>{stats.org.total_members} Team Members</div>
            <div className="org-banner-label" style={{color:'rgba(255,255,255,0.65)'}}>{stats.org.org_tasks_completed}/{stats.org.org_tasks_total} org tasks completed</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="org-banner-stat">{stats.org.org_tasks_total > 0 ? Math.round(stats.org.org_tasks_completed/stats.org.org_tasks_total*100) : 0}%</div>
            <div className="org-banner-label">Team completion rate</div>
          </div>
        </div>
      )}

      <div className="card-grid card-grid-4" style={{marginBottom:24}}>
        <div className="stat-card red">
          <div className="icon-pill red">✅</div>
          <div className="stat-value">{stats.tasks.completed}</div>
          <div className="stat-label">Tasks Completed</div>
          <span className="chip red">All done</span>
        </div>
        <div className="stat-card blue">
          <div className="icon-pill blue">📋</div>
          <div className="stat-value">{stats.tasks.pending}</div>
          <div className="stat-label">Tasks Pending</div>
          <span className="chip blue">Clear</span>
        </div>
        <div className="stat-card green">
          <div className="icon-pill green">⏱️</div>
          <div className="stat-value">{stats.focus.total_focus_mins}</div>
          <div className="stat-label">Focus Minutes</div>
          <span className="chip green">Start session</span>
        </div>
        <div className="stat-card amber">
          <div className="icon-pill amber">🔥</div>
          <div className="stat-value">{stats.streak.current_streak}</div>
          <div className="stat-label">Day Streak</div>
          <span className="chip amber">Keep it up!</span>
        </div>
      </div>

      <div className="card-grid card-grid-2">
        <div className="chart-wrapper chart-bare">
          <div className="chart-title">Activity Overview</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#f0f0f4" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize:12}} stroke="#999" />
              <YAxis tick={{fontSize:12}} stroke="#999" />
              <Tooltip />
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="chart-title">Performance Snapshot</div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <ProgressBar label="Completion Rate" value={stats.tasks.completion_rate} fillClass="red" />
            <ProgressBar label="Focus Sessions" value={Math.min(stats.focus.total_sessions * 10, 100)} fillClass="blue" />
            <ProgressBar label="Streak Progress" value={Math.min(stats.streak.current_streak * 10, 100)} fillClass="amber" />
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

      <MeetingScheduler
        isOpen={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        members={members}
        initialParticipantIds={meetSeedParticipants}
      />
    </div>
  );
}

function ProgressBar({ label, value, fillClass }) {
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
        <span style={{fontSize:13,color:'var(--muted)'}}>{label}</span>
        <span style={{fontSize:13,fontWeight:600}}>{Math.round(value)}%</span>
      </div>
      <div className="progress-track">
        <div className={`progress-fill ${fillClass}`} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
      </div>
    </div>
  );
}
