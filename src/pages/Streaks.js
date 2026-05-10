import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Streaks() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('dashboard/').then(r => setStats(r.data)).catch(()=>{}); }, []);
  if (!stats) return <div className="spinner" style={{marginTop:40}}/>;
  const { streak } = stats;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🔥 Streaks & Achievements</div>
          <div className="page-subtitle">Gamify your productivity — build habits, earn badges</div>
        </div>
      </div>

      <div className="card-grid card-grid-4" style={{marginBottom:24}}>
        <div className="stat-card" style={{textAlign:'center'}}>
          <div style={{fontSize:48}}>🔥</div>
          <div className="stat-value" style={{color:'#f97316',fontSize:36}}>{streak.current_streak}</div>
          <div className="stat-label">Current Streak (days)</div>
        </div>
        <div className="stat-card" style={{textAlign:'center'}}>
          <div style={{fontSize:48}}>🏆</div>
          <div className="stat-value" style={{color:'#f59e0b'}}>{streak.longest_streak}</div>
          <div className="stat-label">Longest Streak</div>
        </div>
        <div className="stat-card" style={{textAlign:'center'}}>
          <div style={{fontSize:48}}>⏱️</div>
          <div className="stat-value" style={{color:'var(--teal)'}}>{streak.total_sessions}</div>
          <div className="stat-label">Total Focus Sessions</div>
        </div>
        <div className="stat-card" style={{textAlign:'center'}}>
          <div style={{fontSize:48}}>✅</div>
          <div className="stat-value" style={{color:'var(--blue)'}}>{streak.total_tasks_completed}</div>
          <div className="stat-label">Tasks Completed</div>
        </div>
      </div>

      <div className="card">
        <div className="chart-title">🏅 Achievements</div>
        <div className="card-grid card-grid-3" style={{gap:12}}>
          {[
            { icon:'🌱', title:'First Step', desc:'Complete your first task', unlocked: streak.total_tasks_completed >= 1 },
            { icon:'🔥', title:'On Fire', desc:'3-day streak', unlocked: streak.current_streak >= 3 },
            { icon:'💪', title:'Consistent', desc:'7-day streak', unlocked: streak.longest_streak >= 7 },
            { icon:'🎯', title:'Focused Mind', desc:'5 focus sessions', unlocked: streak.total_sessions >= 5 },
            { icon:'⚡', title:'Productivity Pro', desc:'Complete 25 tasks', unlocked: streak.total_tasks_completed >= 25 },
            { icon:'🏆', title:'Champion', desc:'30-day streak', unlocked: streak.longest_streak >= 30 },
            { icon:'📚', title:'Learner', desc:'10 focus sessions', unlocked: streak.total_sessions >= 10 },
            { icon:'🚀', title:'Rocket Mode', desc:'50 tasks completed', unlocked: streak.total_tasks_completed >= 50 },
            { icon:'💎', title:'Diamond', desc:'100 tasks completed', unlocked: streak.total_tasks_completed >= 100 },
          ].map((a,i) => (
            <div key={i} style={{padding:16,borderRadius:14,border:`2px solid ${a.unlocked?'var(--teal)':'var(--border)'}`,background:a.unlocked?'var(--teal2)':'var(--s2)',opacity:a.unlocked?1:0.5,transition:'all 0.2s'}}>
              <div style={{fontSize:32,marginBottom:8}}>{a.icon}</div>
              <div style={{fontWeight:600,fontSize:14,color:a.unlocked?'var(--teal)':'var(--text)'}}>{a.title}</div>
              <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>{a.desc}</div>
              {a.unlocked && <div style={{fontSize:11,color:'var(--teal)',fontWeight:600,marginTop:6}}>✓ Unlocked!</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
