import React, { useEffect, useState } from 'react';
import { Lightbulb, Smile } from 'lucide-react';
import api from '../api';
import { getMoodMeta, MOODS } from '../ui/moods';

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
                <div className="mood-icon" style={{color:m.color,background:m.softColor}}>
                  <m.Icon size={22} />
                </div>
                <div className="mood-name">{m.label}</div>
              </button>
            ))}
          </div>

          <div style={{marginBottom:20}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:13,fontWeight:500}}>Energy Level</span>
              <span style={{fontSize:13,fontWeight:600,color:'var(--color-maroon)'}}>{energy}/5</span>
            </div>
            <input type="range" min="1" max="5" value={energy} onChange={e=>setEnergy(+e.target.value)} style={{width:'100%',accentColor:'var(--color-maroon)'}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--muted)',marginTop:4}}>
              <span>Exhausted</span><span>Peak</span>
            </div>
          </div>

          <button type="button" className="btn-primary" style={{width:'100%'}} onClick={save} disabled={!selected||saving}>
            {saving ? 'Saving...' : 'Log Mood & Get Recommendation'}
          </button>

          {rec && (
            <div className="mood-rec-box">
              <div className="icon-heading" style={{fontWeight:600,marginBottom:6,color:'var(--color-maroon)'}}><Lightbulb size={17} /> Recommendation</div>
              <div style={{fontSize:14}}>{rec}</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="chart-title">Mood History</div>
          {logs.length === 0 ? (
            <div className="empty-state" style={{padding:24}}>
              <div className="empty-icon"><Smile size={28} /></div>
              <div className="empty-title">No mood logs yet</div>
            </div>
          ) : logs.slice(0,12).map(l => {
            const m = getMoodMeta(l.mood);
            const chip = l.energy_level >= 4 ? 'green' : l.energy_level >= 3 ? 'amber' : 'red';
            return (
              <div key={l.id} className="mood-log-row">
                <span className="mood-indicator" style={{color:m.color,background:m.softColor}}><m.Icon size={19} /></span>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500,textTransform:'capitalize'}}>{l.mood}</div>
                  <div style={{fontSize:12,color:'var(--muted)'}}>{l.recommendation?.slice(0,60)}...</div>
                  <span className={`chip ${chip}`}>Energy {l.energy_level}/5</span>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{new Date(l.logged_at).toLocaleDateString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
