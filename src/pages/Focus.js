import React, { useState, useEffect, useRef } from 'react';
import {
  Ban,
  Brain,
  CheckCircle2,
  CirclePause,
  Lightbulb,
  Pause,
  Play,
  RefreshCcw,
  Sparkles,
  Timer,
  Wind,
} from 'lucide-react';
import api from '../api';
import { FOCUS_MOODS as MOODS, getMoodMeta } from '../ui/moods';

const MODES = [
  { label:'Focus', mins:25, color:'var(--color-maroon)' },
  { label:'Short Break', mins:5, color:'var(--color-blue)' },
  { label:'Long Break', mins:15, color:'var(--color-amber)' },
];

export default function Focus() {
  const [modeIdx, setModeIdx] = useState(0);
  const [secs, setSecs] = useState(25*60);
  const [running, setRunning] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [taskLabel, setTaskLabel] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [mood, setMood] = useState('');
  const [sessions, setSessions] = useState([]);
  const [moodInsights, setMoodInsights] = useState(null);
  const [showBreathingRecommendation, setShowBreathingRecommendation] = useState(false);
  const interval = useRef(null);
  const mode = MODES[modeIdx];
  const total = mode.mins * 60;
  const progress = (total - secs) / total;

  useEffect(() => {
    fetchSessions();
    return () => clearInterval(interval.current);
  }, []);

  useEffect(() => {
    setSecs(mode.mins * 60);
    setRunning(false);
    clearInterval(interval.current);
  }, [modeIdx]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('focus-sessions/');
      setSessions(res.data);
      calculateMoodInsights(res.data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const calculateMoodInsights = (sessionsData) => {
    const completedSessions = sessionsData.filter(s => s.completed && s.mood);
    if (completedSessions.length === 0) return;

    const moodData = {};
    completedSessions.forEach(s => {
      if (!moodData[s.mood]) {
        moodData[s.mood] = { count: 0, totalMins: 0, totalDistractions: 0 };
      }
      moodData[s.mood].count += 1;
      moodData[s.mood].totalMins += s.duration_mins;
      moodData[s.mood].totalDistractions += s.distractions;
    });

    const moods = Object.keys(moodData).sort((a, b) => moodData[b].totalMins - moodData[a].totalMins);
    const mostProductive = moods[0];
    const leastProductive = moods[moods.length - 1];

    const avgFocusByMood = {};
    Object.keys(moodData).forEach(m => {
      avgFocusByMood[m] = Math.round(moodData[m].totalMins / moodData[m].count);
    });

    setMoodInsights({
      mostProductive,
      leastProductive,
      avgFocusByMood,
    });
  };

  const start = async () => {
    if (!running && mood) {
      setRunning(true);
      if (!sessionId) {
        try {
          const res = await api.post('focus-sessions/', { 
            duration_mins: mode.mins, 
            task_label: taskLabel,
            mood: mood 
          });
          setSessionId(res.data.id);
          if (mood === 'stressed') {
            setShowBreathingRecommendation(true);
          }
        } catch (err) {
          console.error('Error creating session:', err);
          setRunning(false);
        }
      }
      interval.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) { clearInterval(interval.current); setRunning(false); finish(); return 0; }
          return s - 1;
        });
      }, 1000);
    }
  };

  const pause = () => { setRunning(false); clearInterval(interval.current); };

  const reset = () => {
    setRunning(false); clearInterval(interval.current);
    setSecs(mode.mins * 60); setSessionId(null); setDistractions(0); setShowBreathingRecommendation(false);
  };

  const finish = async () => {
    if (sessionId) {
      try { 
        await api.patch(`focus-sessions/${sessionId}/`, { completed: true, distractions }); 
      } catch (err) {
        console.error('Error completing session:', err);
      }
      setSessionId(null);
      await fetchSessions();
    }
  };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const r = 96; const circ = 2 * Math.PI * r;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Pomodoro Focus Timer</div>
          <div className="page-subtitle">Stay focused, take breaks, build deep work habits</div>
        </div>
      </div>

      <div className="card-grid card-grid-2">
        <div className="card" style={{textAlign:'center'}}>
          <div style={{display:'flex',gap:8,marginBottom:24,justifyContent:'center'}}>
            {MODES.map((m,i) => (
              <button type="button" key={i} className={`btn btn-sm ${modeIdx===i?'btn-teal':'btn-ghost'}`} onClick={() => setModeIdx(i)} disabled={running}>{m.label}</button>
            ))}
          </div>

          <div style={{marginBottom:16}}>
            <input style={{background:'var(--s2)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 14px',fontSize:14,color:'var(--text)',width:'100%',outline:'none',fontFamily:'inherit'}}
              placeholder="What are you working on?" value={taskLabel} onChange={e=>setTaskLabel(e.target.value)} disabled={running}/>
          </div>

          {/* Mood Selector */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:'var(--muted)'}}>Select your mood before starting</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:8}}>
              {MOODS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  disabled={running}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: `2px solid ${mood === m.id ? m.color : 'var(--border)'}`,
                    background: mood === m.id ? m.softColor : 'var(--s2)',
                    color: 'var(--text)',
                    cursor: running ? 'default' : 'pointer',
                    opacity: running ? 0.5 : 1,
                  }}
                  title={m.label}
                >
                  <span className="mood-choice-icon" style={{color:m.color}}><m.Icon size={20} /></span>
                  <span className="mood-choice-label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Breathing Recommendation for Stressed */}
          {showBreathingRecommendation && mood === 'stressed' && (
            <div style={{background:'#F4433630',borderRadius:8,padding:12,marginBottom:16,border:'1px solid #F44336'}}>
              <div className="icon-heading" style={{fontSize:13,fontWeight:600,marginBottom:6,color:'#F44336'}}><Wind size={17} /> Breathing Recommendation</div>
              <div style={{fontSize:12,color:'var(--text)',marginBottom:8}}>You're feeling stressed. Try a quick breathing exercise before starting:</div>
              <button type="button" className="btn-primary" style={{width:'100%'}} onClick={() => setShowBreathingRecommendation(false)}>
                <Wind size={16} /> Start Breathing Exercise
              </button>
            </div>
          )}

          <div className="timer-circle" style={{margin:'0 auto 16px'}}>
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r={r} fill="none" stroke="#f0f0f4" strokeWidth="10"/>
              <circle cx="110" cy="110" r={r} fill="none" stroke={mode.color} strokeWidth="10"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
                strokeLinecap="round" style={{transition:'stroke-dashoffset 0.5s',transform:'rotate(-90deg)',transformOrigin:'center'}}/>
            </svg>
            <div style={{position:'absolute',textAlign:'center'}}>
              <div className="timer-display">{fmt(secs)}</div>
              <div className="timer-label">{mode.label}</div>
              {mood && <div className="timer-mood" style={{color:getMoodMeta(mood).color}}>{getMoodMeta(mood).label}</div>}
            </div>
          </div>

          <div className="timer-controls">
            {!running ? <button type="button" className="btn-primary" onClick={start} disabled={!mood}><Play size={16} /> Start</button>
              : <button type="button" className="btn-secondary" onClick={pause}><Pause size={16} /> Pause</button>}
            <button type="button" className="btn-secondary" onClick={reset}><RefreshCcw size={16} /> Reset</button>
            {running && <button type="button" className="btn-secondary" onClick={() => setDistractions(d=>d+1)}><Ban size={16} /> Distraction ({distractions})</button>}
          </div>
        </div>

        <div className="card">
          <div className="chart-title">Recent Sessions</div>
          {sessions.length === 0 ? (
            <div className="empty-state" style={{padding:24}}>
              <div className="empty-icon"><Timer size={28} /></div>
              <div className="empty-title">No sessions yet</div>
              <div style={{fontSize:13}}>Start your first focus session!</div>
            </div>
          ) : sessions.slice(0,10).map(s => (
            <div key={s.id} className="task-item" style={{ marginBottom: 8 }}>
              <span className={`session-status-icon ${s.completed ? 'complete' : 'paused'}`}>
                {s.completed ? <CheckCircle2 size={18} /> : <CirclePause size={18} />}
              </span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500}}>{s.task_label || 'Focus Session'}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>{s.duration_mins} min · {s.distractions} distractions</div>
                {s.mood && (
                  <div style={{fontSize:12,marginTop:4}}>
                    <span style={{
                      display:'inline-flex',
                      alignItems:'center',
                      gap:5,
                      padding:'2px 8px',
                      borderRadius:4,
                      background: MOODS.find(m => m.id === s.mood)?.color + '20',
                      color: MOODS.find(m => m.id === s.mood)?.color,
                      fontWeight:500
                    }}>
                      {React.createElement(getMoodMeta(s.mood).Icon, { size: 13 })} {getMoodMeta(s.mood).label}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                {s.completed && <span className="session-chip-done">Completed</span>}
                <span style={{fontSize:11,color:'var(--muted)'}}>{new Date(s.start_time).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mood Productivity Insights */}
      {moodInsights && (
        <div className="card" style={{marginTop:16}}>
          <div className="chart-title icon-heading"><Brain size={18} /> Mood Productivity Insights</div>
          <div className="card-grid card-grid-3">
            <div style={{background:'#4CAF5015',borderRadius:12,padding:16,border:'1px solid #4CAF50'}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,fontWeight:600}}>MOST PRODUCTIVE MOOD</div>
              <div className="insight-icon" style={{color:getMoodMeta(moodInsights.mostProductive).color,background:getMoodMeta(moodInsights.mostProductive).softColor}}>
                {React.createElement(getMoodMeta(moodInsights.mostProductive).Icon, { size: 21 })}
              </div>
              <div style={{fontSize:14,fontWeight:600}}>
                {MOODS.find(m => m.id === moodInsights.mostProductive)?.label}
              </div>
              <div style={{fontSize:12,color:'var(--muted)',marginTop:8}}>
                {moodInsights.avgFocusByMood[moodInsights.mostProductive]} min avg focus time
              </div>
            </div>
            
            <div style={{background:'#F4433630',borderRadius:12,padding:16,border:'1px solid #F44336'}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,fontWeight:600}}>LEAST PRODUCTIVE MOOD</div>
              <div className="insight-icon" style={{color:getMoodMeta(moodInsights.leastProductive).color,background:getMoodMeta(moodInsights.leastProductive).softColor}}>
                {React.createElement(getMoodMeta(moodInsights.leastProductive).Icon, { size: 21 })}
              </div>
              <div style={{fontSize:14,fontWeight:600}}>
                {MOODS.find(m => m.id === moodInsights.leastProductive)?.label}
              </div>
              <div style={{fontSize:12,color:'var(--muted)',marginTop:8}}>
                {moodInsights.avgFocusByMood[moodInsights.leastProductive]} min avg focus time
              </div>
            </div>

            <div style={{background:'#2196F315',borderRadius:12,padding:16,border:'1px solid #2196F3'}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,fontWeight:600}}>ALL MOODS AVERAGE</div>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:12}}>
                {Object.entries(moodInsights.avgFocusByMood).map(([m, avgMins]) => (
                  <div key={m} style={{fontSize:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span className="icon-heading">
                      {React.createElement(getMoodMeta(m).Icon, { size: 14, color: getMoodMeta(m).color })}
                      {getMoodMeta(m).label}
                    </span>
                    <span style={{fontWeight:600}}>{avgMins} min</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{marginTop:16}}>
        <div className="chart-title icon-heading"><Lightbulb size={18} /> Focus Tips</div>
        <div className="card-grid card-grid-3">
          {[
            {Icon:Wind, title:'Box Breathing', desc:'4 counts in, 4 hold, 4 out, 4 hold. Reduces stress before sessions.'},
            {Icon:Ban, title:'Phone Away', desc:'Place your phone in another room. Even having it face-down hurts focus.'},
            {Icon:Sparkles, title:'One Task', desc:'Write ONE clear goal before each Pomodoro. Multitasking kills deep work.'},
          ].map((t,i) => (
            <div key={i} style={{background:'var(--s2)',borderRadius:12,padding:16}}>
              <div className="insight-icon"><t.Icon size={21} /></div>
              <div style={{fontWeight:600,marginBottom:4,fontSize:14}}>{t.title}</div>
              <div style={{fontSize:13,color:'var(--muted)'}}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
