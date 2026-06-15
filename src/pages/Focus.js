import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

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
  const [sessions, setSessions] = useState([]);
  const interval = useRef(null);
  const mode = MODES[modeIdx];
  const total = mode.mins * 60;
  const progress = (total - secs) / total;

  useEffect(() => {
    api.get('focus-sessions/').then(r => setSessions(r.data)).catch(()=>{});
    return () => clearInterval(interval.current);
  }, []);

  useEffect(() => {
    setSecs(mode.mins * 60);
    setRunning(false);
    clearInterval(interval.current);
  }, [modeIdx]);

  const start = async () => {
    if (!running) {
      setRunning(true);
      if (!sessionId) {
        try {
          const res = await api.post('focus-sessions/', { duration_mins: mode.mins, task_label: taskLabel });
          setSessionId(res.data.id);
        } catch {}
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
    setSecs(mode.mins * 60); setSessionId(null); setDistractions(0);
  };

  const finish = async () => {
    if (sessionId) {
      try { await api.patch(`focus-sessions/${sessionId}/`, { completed: true, distractions }); } catch {}
      setSessionId(null);
      api.get('focus-sessions/').then(r => setSessions(r.data)).catch(()=>{});
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
              <button type="button" key={i} className={`btn btn-sm ${modeIdx===i?'btn-teal':'btn-ghost'}`} onClick={() => setModeIdx(i)}>{m.label}</button>
            ))}
          </div>

          <div style={{marginBottom:16}}>
            <input style={{background:'var(--s2)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 14px',fontSize:14,color:'var(--text)',width:'100%',outline:'none',fontFamily:'inherit'}}
              placeholder="What are you working on?" value={taskLabel} onChange={e=>setTaskLabel(e.target.value)} disabled={running}/>
          </div>

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
            </div>
          </div>

          <div className="timer-controls">
            {!running ? <button type="button" className="btn-primary" onClick={start}>▶ Start</button>
              : <button type="button" className="btn-secondary" onClick={pause}>⏸ Pause</button>}
            <button type="button" className="btn-secondary" onClick={reset}>↺ Reset</button>
            {running && <button type="button" className="btn-secondary" onClick={() => setDistractions(d=>d+1)}>😵 +Distraction ({distractions})</button>}
          </div>
        </div>

        <div className="card">
          <div className="chart-title">Recent Sessions</div>
          {sessions.length === 0 ? (
            <div className="empty-state" style={{padding:24}}>
              <div className="empty-icon">⏱️</div>
              <div className="empty-title">No sessions yet</div>
              <div style={{fontSize:13}}>Start your first focus session!</div>
            </div>
          ) : sessions.slice(0,10).map(s => (
            <div key={s.id} className="task-item" style={{ marginBottom: 8 }}>
              <span style={{fontSize:20}}>{s.completed ? '✅' : '⏸️'}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500}}>{s.task_label || 'Focus Session'}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>{s.duration_mins} min · {s.distractions} distractions</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                {s.completed && <span className="session-chip-done">Completed</span>}
                <span style={{fontSize:11,color:'var(--muted)'}}>{new Date(s.start_time).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{marginTop:16}}>
        <div className="chart-title">💡 Focus Tips</div>
        <div className="card-grid card-grid-3">
          {[
            {icon:'🧘', title:'Box Breathing', desc:'4 counts in, 4 hold, 4 out, 4 hold. Reduces stress before sessions.'},
            {icon:'📵', title:'Phone Away', desc:'Place your phone in another room. Even having it face-down hurts focus.'},
            {icon:'🎯', title:'One Task', desc:'Write ONE clear goal before each Pomodoro. Multitasking kills deep work.'},
          ].map((t,i) => (
            <div key={i} style={{background:'var(--s2)',borderRadius:12,padding:16}}>
              <div style={{fontSize:28,marginBottom:8}}>{t.icon}</div>
              <div style={{fontWeight:600,marginBottom:4,fontSize:14}}>{t.title}</div>
              <div style={{fontSize:13,color:'var(--muted)'}}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
