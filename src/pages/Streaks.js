import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Crown,
  Diamond,
  Flame,
  Medal,
  Plus,
  Rocket,
  Sparkles,
  Sprout,
  Target,
  Timer,
  Trash2,
  Trophy,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../api';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Streaks() {
  const [stats, setStats] = useState(null);
  const [tracker, setTracker] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [scheduledDays, setScheduledDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('dashboard/'), api.get('weekly-tracker/')])
      .then(([statsResponse, trackerResponse]) => {
        setStats(statsResponse.data);
        setTracker(trackerResponse.data);
      })
      .catch(() => setError('Unable to load streak data.'));
  }, []);

  const replaceTracker = request => {
    setSaving(true);
    setError('');
    return request
      .then(response => {
        setTracker(response.data);
        return true;
      })
      .catch(err => {
        setError(firstApiError(err, 'Unable to save your changes.'));
        return false;
      })
      .finally(() => setSaving(false));
  };

  const addTask = title => {
    const cleanTitle = title.trim();
    if (!cleanTitle || !scheduledDays.length) return;
    replaceTracker(api.post('weekly-tracker/', { title: cleanTitle, scheduled_days: scheduledDays }))
      .then(saved => saved && setTaskTitle(''));
  };

  const toggleScheduledDay = day => {
    setScheduledDays(current => (
      current.includes(day) ? current.filter(value => value !== day) : [...current, day].sort()
    ));
  };

  if (!stats || !tracker) {
    if (error) return <div className="error-msg" style={{marginTop: 40}}>{error}</div>;
    return <div className="spinner" style={{marginTop:40}}/>;
  }
  const { streak } = stats;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Streaks & Achievements</div>
          <div className="page-subtitle">Gamify your productivity - build habits, earn badges</div>
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

      <section className="weekly-tracker-section">
        <div className="weekly-tracker-heading">
          <div>
            <div className="page-title">Weekly Task Tracker</div>
            <div className="page-subtitle">
              {formatDate(tracker.week_start)} - {formatDate(tracker.week_end)}
            </div>
          </div>
          <div className="tracker-legend">
            <span><i className="legend-dot completed" />Completed</span>
            <span><i className="legend-dot missed" />Not completed</span>
            <span><i className="legend-dot unscheduled" />Not scheduled</span>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="card tracker-create-card">
          <div className="tracker-create-row">
            <input
              value={taskTitle}
              onChange={event => setTaskTitle(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && addTask(taskTitle)}
              placeholder="Add a recurring task"
              aria-label="Recurring task name"
            />
            <button className="btn-primary" disabled={saving || !taskTitle.trim() || !scheduledDays.length} onClick={() => addTask(taskTitle)}>
              <Plus size={16} /> Add Task
            </button>
          </div>
          <div className="tracker-schedule-picker">
            <span className="tracker-field-label">Repeat on</span>
            {DAY_NAMES.map((day, index) => (
              <button
                type="button"
                key={day}
                className={`schedule-day ${scheduledDays.includes(index) ? 'selected' : ''}`}
                onClick={() => toggleScheduledDay(index)}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          <div className="tracker-presets">
            <span className="tracker-field-label">Quick add</span>
            {tracker.presets.map(preset => (
              <button type="button" className="tracker-preset" key={preset} disabled={saving} onClick={() => addTask(preset)}>
                <Plus size={12} /> {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="tracker-metrics">
          <TrackerMetric label="Task completion" value={`${Math.round(tracker.metrics.completion_rate)}%`} />
          <TrackerMetric label="Productive days" value={`${tracker.metrics.productive_days}/7`} />
          <TrackerMetric label="Current completion streak" value={`${tracker.metrics.current_streak} days`} />
          <TrackerMetric label="Longest completion streak" value={`${tracker.metrics.longest_streak} days`} />
        </div>

        <div className="card weekly-table-card">
          {tracker.tasks.length ? (
            <div className="weekly-table-scroll">
              <table className="weekly-task-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    {DAY_NAMES.map((day, index) => (
                      <th key={day}>
                        <span>{day.slice(0, 3)}</span>
                        <small>{new Date(`${tracker.days[index].date}T00:00:00`).getDate()}</small>
                      </th>
                    ))}
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {tracker.tasks.map(task => (
                    <tr key={task.id}>
                      <td className="weekly-task-name">{task.title}</td>
                      {tracker.days.map((day, dayIndex) => {
                        const scheduled = task.scheduled_days.includes(dayIndex);
                        const completed = task.completions.includes(day.date);
                        return (
                          <td key={day.date}>
                            <button
                              type="button"
                              className={`weekly-check ${scheduled ? (completed ? 'completed' : 'missed') : 'unscheduled'}`}
                              disabled={!scheduled || saving}
                              aria-label={`${task.title}, ${DAY_NAMES[dayIndex]}: ${scheduled ? (completed ? 'completed' : 'not completed') : 'not scheduled'}`}
                              onClick={() => replaceTracker(api.post(`weekly-tracker/tasks/${task.id}/toggle/`, { date: day.date }))}
                            >
                              {completed && <Check size={16} strokeWidth={3} />}
                            </button>
                          </td>
                        );
                      })}
                      <td>
                        <button
                          type="button"
                          className="tracker-delete"
                          disabled={saving}
                          aria-label={`Delete ${task.title}`}
                          onClick={() => replaceTracker(api.delete(`weekly-tracker/tasks/${task.id}/`))}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state tracker-empty">
              <div className="empty-title">No recurring tasks yet</div>
              <div>Add a task above or choose one of the quick-add defaults.</div>
            </div>
          )}
        </div>

        <div className="card-grid card-grid-2 tracker-charts">
          <div className="chart-wrapper">
            <div className="chart-title">Weekly progress</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={tracker.days}>
                <CartesianGrid stroke="#f0f0f4" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="completed" name="Completed tasks" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrapper">
            <div className="chart-title">Monthly trend</div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={tracker.trends}>
                <CartesianGrid stroke="#f0f0f4" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis yAxisId="count" allowDecimals={false} />
                <YAxis yAxisId="percent" orientation="right" domain={[0, 100]} unit="%" />
                <Tooltip />
                <Legend />
                <Line yAxisId="count" type="monotone" dataKey="completed" name="Tasks completed" stroke="#16a34a" strokeWidth={2} />
                <Line yAxisId="percent" type="monotone" dataKey="consistency" name="Consistency" stroke="#d97706" strokeWidth={2} />
                <Line yAxisId="percent" type="monotone" dataKey="completion_rate" name="Completion %" stroke="#c0392b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

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

function TrackerMetric({ label, value }) {
  return (
    <div className="card tracker-metric-card">
      <div className="tracker-metric-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function firstApiError(error, fallback) {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.error) return data.error;
  const first = Object.values(data)[0];
  return Array.isArray(first) ? first[0] : fallback;
}
