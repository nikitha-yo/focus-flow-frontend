import React, { useEffect, useState } from 'react';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Flame,
  Megaphone,
  Pin,
  Timer,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from 'recharts';
import MeetingScheduler from '../components/MeetingScheduler';

const BAR_COLORS = ['#c0392b', '#2563eb', '#16a34a', '#d97706'];
const PRIORITY_COLORS = {
  high: '#c0392b',
  medium: '#d97706',
  low: '#16a34a',
};

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
          <div className="page-title">Welcome back, {user?.username}</div>
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
              <CalendarDays size={16} /> Schedule Meeting
            </button>
          </div>
        )}
      </div>

      {isOrg && stats.org && (
        <div className="org-banner">
          <div>
            <div className="org-badge"><Building2 size={14} /> {user?.org?.name}</div>
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
          <div className="icon-pill red"><CheckCircle2 size={21} /></div>
          <div className="stat-value">{stats.tasks.completed}</div>
          <div className="stat-label">Tasks Completed</div>
          <span className="chip red">All done</span>
        </div>
        <div className="stat-card blue">
          <div className="icon-pill blue"><ClipboardList size={21} /></div>
          <div className="stat-value">{stats.tasks.pending}</div>
          <div className="stat-label">Tasks Pending</div>
          <span className="chip blue">Clear</span>
        </div>
        <div className="stat-card green">
          <div className="icon-pill green"><Timer size={21} /></div>
          <div className="stat-value">{stats.focus.total_focus_mins}</div>
          <div className="stat-label">Focus Minutes</div>
          <span className="chip green">Start session</span>
        </div>
        <div className="stat-card amber">
          <div className="icon-pill amber"><Flame size={21} /></div>
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
        </div>
      </div>

      {isOrg && stats.announcements && stats.announcements.length > 0 && (
        <div style={{marginTop:24}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div className="chart-title icon-heading"><Megaphone size={18} /> Latest Announcements</div>
            <button type="button" className="btn-link" onClick={() => window.location.href = '/announcements'} style={{fontSize:13,color:'var(--color-maroon)',fontWeight:600,textDecoration:'none'}}>View All →</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:16}}>
            {stats.announcements.map(announcement => (
              <div
                key={announcement.id}
                className="card"
                style={{
                  borderLeft:`4px solid ${PRIORITY_COLORS[announcement.priority] || '#999'}`,
                  padding:0,
                  overflow:'hidden'
                }}
              >
                <div style={{padding:16}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span className="inline-icon" style={{color:'var(--color-maroon)'}}>
                        {announcement.announcement_type === 'meeting' ? <CalendarDays size={18} /> : <Pin size={18} />}
                      </span>
                      <div>
                        <div style={{fontSize:14,fontWeight:700}}>{announcement.title}</div>
                      </div>
                    </div>
                    <span style={{background:PRIORITY_COLORS[announcement.priority],color:'#fff',padding:'2px 8px',borderRadius:3,fontSize:11,fontWeight:600,whiteSpace:'nowrap'}}>
                      {announcement.priority === 'high' ? 'High' : announcement.priority === 'medium' ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div style={{fontSize:13,color:'var(--text)',lineHeight:1.4,marginBottom:10,maxHeight:60,overflow:'hidden',textOverflow:'ellipsis',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                    {announcement.message}
                  </div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>
                    {new Date(announcement.created_at).toLocaleDateString()} · By {announcement.created_by_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
