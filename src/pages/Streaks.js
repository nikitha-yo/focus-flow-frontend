import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Crown,
  Diamond,
  Flame,
  Medal,
  Rocket,
  Sparkles,
  Sprout,
  Target,
  Timer,
  Trophy,
} from 'lucide-react';
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
          <div className="page-title">Streaks & Achievements</div>
          <div className="page-subtitle">Gamify your productivity — build habits, earn badges</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="chart-title">Consistency grid</div>
        <div className="streak-heatmap">
          {Array.from({ length: 28 }, (_, i) => {
            const cycle = ['l2', '', 'l4', 'l1', '', 'l3', 'l2'];
            const level = cycle[i % 7];
            return <div key={i} className={level ? `streak-heatmap-cell ${level}` : 'streak-heatmap-cell'} />;
          })}
        </div>
      </div>

      <div className="card-grid card-grid-4" style={{marginBottom:24}}>
        <div className="stat-card amber" style={{textAlign:'center'}}>
          <div className="icon-pill amber" style={{ margin: '0 auto 8px' }}><Flame size={24} /></div>
          <div className="stat-value" style={{fontSize:36}}>{streak.current_streak}</div>
          <div className="stat-label">Current Streak (days)</div>
          <span className="chip amber">On fire</span>
        </div>
        <div className="stat-card blue" style={{textAlign:'center'}}>
          <div className="icon-pill blue" style={{ margin: '0 auto 8px' }}><Trophy size={24} /></div>
          <div className="stat-value">{streak.longest_streak}</div>
          <div className="stat-label">Longest Streak</div>
        </div>
        <div className="stat-card green" style={{textAlign:'center'}}>
          <div className="icon-pill green" style={{ margin: '0 auto 8px' }}><Timer size={24} /></div>
          <div className="stat-value">{streak.total_sessions}</div>
          <div className="stat-label">Total Focus Sessions</div>
        </div>
        <div className="stat-card red" style={{textAlign:'center'}}>
          <div className="icon-pill red" style={{ margin: '0 auto 8px' }}><CheckCircle2 size={24} /></div>
          <div className="stat-value">{streak.total_tasks_completed}</div>
          <div className="stat-label">Tasks Completed</div>
        </div>
      </div>

      <div className="card">
        <div className="chart-title icon-heading"><Medal size={18} /> Achievements</div>
        <div className="card-grid card-grid-3" style={{gap:12}}>
          {[
            { Icon:Sprout, title:'First Step', desc:'Complete your first task', unlocked: streak.total_tasks_completed >= 1 },
            { Icon:Flame, title:'On Fire', desc:'3-day streak', unlocked: streak.current_streak >= 3 },
            { Icon:Award, title:'Consistent', desc:'7-day streak', unlocked: streak.longest_streak >= 7 },
            { Icon:Target, title:'Focused Mind', desc:'5 focus sessions', unlocked: streak.total_sessions >= 5 },
            { Icon:Sparkles, title:'Productivity Pro', desc:'Complete 25 tasks', unlocked: streak.total_tasks_completed >= 25 },
            { Icon:Crown, title:'Champion', desc:'30-day streak', unlocked: streak.longest_streak >= 30 },
            { Icon:BookOpen, title:'Learner', desc:'10 focus sessions', unlocked: streak.total_sessions >= 10 },
            { Icon:Rocket, title:'Rocket Mode', desc:'50 tasks completed', unlocked: streak.total_tasks_completed >= 50 },
            { Icon:Diamond, title:'Diamond', desc:'100 tasks completed', unlocked: streak.total_tasks_completed >= 100 },
          ].map((a,i) => (
            <div key={i} className={`streak-milestone ${a.unlocked ? 'unlocked' : ''}`} style={{opacity:a.unlocked?1:0.45,transition:'all 0.2s'}}>
              <div className="achievement-icon"><a.Icon size={23} /></div>
              <div style={{fontWeight:600,fontSize:14}}>{a.title}</div>
              <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>{a.desc}</div>
              {a.unlocked && <span className="chip green" style={{ marginTop: 8 }}>Unlocked</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
