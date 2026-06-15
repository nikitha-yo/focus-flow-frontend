import React, { useEffect, useState } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';

const COLORS = ['#c0392b', '#2563eb', '#16a34a', '#d97706', '#dc2626'];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [moods, setMoods] = useState([]);

  useEffect(() => {
    api.get('dashboard/').then(r => setStats(r.data));
    api.get('tasks/').then(r => setTasks(r.data));
    api.get('focus-sessions/').then(r => setSessions(r.data));
    api.get('mood-logs/').then(r => setMoods(r.data));
  }, []);

  if (!stats) return <div className="spinner" style={{marginTop:40}}/>;

  const catData = ['study','work','personal'].map(c => ({ name:c, value: tasks.filter(t=>t.category===c).length }));
  const priorityData = ['high','medium','low'].map(p => ({ name:p, value: tasks.filter(t=>t.priority===p).length }));
  const statusData = [
    { name:'Pending', value: tasks.filter(t=>t.status==='pending').length },
    { name:'In Progress', value: tasks.filter(t=>t.status==='in_progress').length },
    { name:'Completed', value: tasks.filter(t=>t.status==='completed').length },
  ];
  const moodCounts = {};
  moods.forEach(m => { moodCounts[m.mood] = (moodCounts[m.mood]||0)+1; });
  const moodData = Object.entries(moodCounts).map(([k,v]) => ({ name:k, value:v }));
  const focusByDay = sessions.slice(0,7).map((s,i) => ({ day:`Day ${i+1}`, mins: s.duration_mins, done: s.completed?1:0 }));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">📈 Analytics Dashboard</div>
          <div className="page-subtitle">Your productivity insights and performance trends</div>
        </div>
      </div>

      <div className="card-grid card-grid-4" style={{marginBottom:24}}>
        <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-value">{stats.tasks.completion_rate}%</div><div className="stat-label">Completion Rate</div></div>
        <div className="stat-card"><div className="stat-icon">⏱️</div><div className="stat-value">{stats.focus.total_focus_mins}</div><div className="stat-label">Total Focus Mins</div></div>
        <div className="stat-card"><div className="stat-icon">🔥</div><div className="stat-value">{stats.streak.longest_streak}</div><div className="stat-label">Best Streak</div></div>
        <div className="stat-card"><div className="stat-icon">😊</div><div className="stat-value">{moods.length}</div><div className="stat-label">Mood Check-ins</div></div>
      </div>

      <div className="card-grid card-grid-2" style={{marginBottom:16}}>
        <div className="chart-wrapper chart-bare">
          <div className="chart-title">Tasks by Category</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                {catData.map((e,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-wrapper chart-bare">
          <div className="chart-title">Tasks by Status</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#f4f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#999' }} stroke="#ccc" />
              <YAxis tick={{ fontSize: 12, fill: '#999' }} stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusData.map((e,i) => <Cell key={i} fill={COLORS[i % 4]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-grid card-grid-2">
        <div className="chart-wrapper chart-bare">
          <div className="chart-title">Focus Sessions Timeline</div>
          {focusByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={focusByDay} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid stroke="#f4f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#999' }} stroke="#ccc" />
                <YAxis tick={{ fontSize: 12, fill: '#999' }} stroke="#ccc" />
                <Tooltip />
                <Line type="monotone" dataKey="mins" stroke="#c0392b" strokeWidth={2} dot={{ fill: '#c0392b', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{padding:24}}><div>No sessions yet</div></div>}
        </div>
        <div className="chart-wrapper chart-bare">
          <div className="chart-title">Mood Distribution</div>
          {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={moodData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {moodData.map((e,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip/><Legend/>
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{padding:24}}><div>No mood data yet</div></div>}
        </div>
      </div>
    </div>
  );
}
