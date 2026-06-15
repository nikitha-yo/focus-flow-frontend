import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Sidebar from './components/Sidebar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Focus from './pages/Focus';
import Mood from './pages/Mood';
import Analytics from './pages/Analytics';
import Streaks from './pages/Streaks';
import Members from './pages/Members';
import DocumentHub from './pages/DocumentHub';
import './index.css';

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
      <div className="ai-chat-widget" aria-hidden="true">
        <div className="ai-chat-widget-inner">
          <div className="ai-chat-panel">
            <div className="ai-chat-header">FocusFlow Assistant</div>
            <div className="ai-chat-body">
              <div className="ai-bubble ai-bubble-ai">
                Hi! I can summarize your streaks or suggest focus blocks whenever you&apos;re ready.
              </div>
              <div className="ai-bubble ai-bubble-user">Show me quick wins for today.</div>
            </div>
          </div>
          <div className="ai-chat-fab">💬</div>
        </div>
      </div>
    </div>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="spinner"/></div>;
  if (!user) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Public><Auth /></Public>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
          <Route path="/focus" element={<Protected><Focus /></Protected>} />
          <Route path="/mood" element={<Protected><Mood /></Protected>} />
          <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
          <Route path="/streaks" element={<Protected><Streaks /></Protected>} />
          <Route path="/members" element={<Protected><Members /></Protected>} />
          <Route path="/documents" element={<Protected><DocumentHub /></Protected>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
