import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  CheckSquare2,
  FileText,
  Flame,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Timer,
  Users,
} from 'lucide-react';
import { useAuth } from '../AuthContext';

const individualNav = [
  { path:'/dashboard', Icon:LayoutDashboard, label:'Dashboard' },
  { path:'/tasks', Icon:CheckSquare2, label:'My Tasks' },
  { path:'/focus', Icon:Timer, label:'Focus Timer' },
  { path:'/analytics', Icon:BarChart3, label:'Analytics' },
  { path:'/streaks', Icon:Flame, label:'Streaks' },
];

const orgNav = [
  { path:'/dashboard', Icon:LayoutDashboard, label:'Dashboard' },
  { path:'/tasks', Icon:CheckSquare2, label:'Tasks' },
  { path:'/focus', Icon:Timer, label:'Focus Timer' },
  { path:'/members', Icon:Users, label:'Team Members', roles:['admin','manager'] },
  { path:'/announcements', Icon:Megaphone, label:'Announcements' },
  { path:'/analytics', Icon:BarChart3, label:'Analytics' },
  { path:'/streaks', Icon:Flame, label:'Streaks' },
];

export default function Sidebar() {
  const { user, logout, isOrg } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nav = isOrg ? orgNav : individualNav;

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo-mark" aria-hidden="true"><Flame size={17} strokeWidth={2.2} /></div>
        <div className="sidebar-logo-text-wrap">
          <div className="sidebar-logo-text">FocusFlow</div>
          <div className="sidebar-logo-sub">{isOrg ? (user?.org?.name || 'Organisation') : 'Individual'}</div>
        </div>
      </div>
      <nav className="nav-section">
        <div className="nav-section-label">Navigation</div>
        {nav.filter(n => !n.roles || n.roles.includes(user?.role)).map(n => (
          <div key={n.path} className={`nav-item ${location.pathname===n.path?'active':''}`} onClick={() => navigate(n.path)}>
            <span className="nav-icon"><n.Icon size={17} strokeWidth={1.9} /></span>
            {n.label}
          </div>
        ))}
        {isOrg && (
          <>
            <div className="nav-divider" />
            <div className="nav-section-label" style={{ marginTop: 4 }}>Work module</div>
            <div className={`nav-item ${location.pathname === '/documents' ? 'active' : ''}`} onClick={() => navigate('/documents')}>
              <span className="nav-icon"><FileText size={17} strokeWidth={1.9} /></span>
              Documents
            </div>
          </>
        )}
      </nav>
      <div className="sidebar-user">
        <div className="user-avatar sidebar-avatar">{user?.username?.[0]?.toUpperCase()}</div>
        <div className="user-info">
          <div className="user-name">{user?.username}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button type="button" className="logout-btn" onClick={logout} title="Logout" aria-label="Logout">
          <LogOut size={17} />
        </button>
      </div>
    </div>
  );
}
