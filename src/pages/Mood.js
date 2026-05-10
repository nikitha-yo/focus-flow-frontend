import React, { useEffect, useState } from 'react';
import api from '../api';

const MOODS = [
  { key:'energized', emoji:'⚡', label:'Energized' },
  { key:'focused', emoji:'🎯', label:'Focused' },
  { key:'happy', emoji:'😊', label:'Happy' },
  { key:'tired', emoji:'😴', label:'Tired' },
  { key:'stressed', emoji:'😰', label:'Stressed' },
];

export default function Mood() {
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState('');
  const [energy, setEnergy] = useState(3);
  const [saving, setSaving] = useState(false);
  const [rec, setRec] = useState('');

  useEffect(() => { api.get('mood-logs/').then(r => setLogs(r.data)).catch(()=>{}); }, []);

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await api.post('mood-logs/', { mood: selected, energy_level: energy });
      setRec(res.data.recommendation);
      setLogs(l => [res.data, ...l]);
      setSelected('');
    } catch {}
    setSaving(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Mood Tracker</div>
          <div className="page-subtitle">Log your mood, get personalized productivity recommendations</div>
        </div>
      </div>

      <div className="card-grid card-grid-2">
        <div className="card">
          <div className="chart-title">How are you feeling now?</div>
          <div className="mood-grid" style={{marginBottom:24}}>
            {MOODS.map(m => (
              <button key={m.key} className={`mood-btn ${selected===m.key?'active':''}`} onClick={() => setSelected(m.key)}>
                <div className="mood-emoji">{m.emoji}</div>
                <div className="mood-name">{m.label}</div>
              </button>
            ))}
          </div>

          <div style={{marginBottom:20}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:13,fontWeight:500}}>Energy Level</span>
              <span style={{fontSize:13,fontWeight:600,color:'var(--teal)'}}>{energy}/5</span>
            </div>
            <input type="range" min="1" max="5" value={energy} onChange={e=>setEnergy(+e.target.value)} style={{width:'100%',accentColor:'var(--teal)'}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--muted)',marginTop:4}}>
              <span>Exhausted</span><span>Peak</span>
            </div>
          </div>

          <button className="btn btn-teal" style={{width:'100%'}} onClick={save} disabled={!selected||saving}>
            {saving ? 'Saving...' : 'Log Mood & Get Recommendation'}
          </button>

          {rec && (
            <div style={{marginTop:16,padding:16,background:'var(--teal2)',borderRadius:12,border:'1px solid rgba(15,123,94,0.2)'}}>
              <div style={{fontWeight:600,marginBottom:6,color:'var(--teal)'}}>💡 Recommendation</div>
              <div style={{fontSize:14}}>{rec}</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="chart-title">Mood History</div>
          {logs.length === 0 ? (
            <div className="empty-state" style={{padding:24}}>
              <div className="empty-icon">😊</div>
              <div className="empty-title">No mood logs yet</div>
            </div>
          ) : logs.slice(0,12).map(l => {
            const m = MOODS.find(x=>x.key===l.mood) || {emoji:'😐'};
            return (
              <div key={l.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <span style={{fontSize:24}}>{m.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500,textTransform:'capitalize'}}>{l.mood}</div>
                  <div style={{fontSize:12,color:'var(--muted)'}}>{l.recommendation?.slice(0,60)}...</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{new Date(l.logged_at).toLocaleDateString()}</div>
                  <div style={{fontSize:12,fontWeight:600}}>⚡{l.energy_level}/5</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
