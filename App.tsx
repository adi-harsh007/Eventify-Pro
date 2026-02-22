import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { User, EventItem, Registration, ViewState } from './types';
import { apiGetEvents, apiGetRegistrations, apiJoinEvent, apiLeaveEvent, apiGetMe } from './apiService';
import { AnimatedLoginPage } from './components/ui/animated-characters-login-page';
import LandingHero from './components/LandingHero';
import Navbar from './components/Navbar';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import CreateEventModal from './components/CreateEventModal';
import { cn } from './lib/utils';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.EXPLORE);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const navigate = useNavigate();

  // ── Auth ─────────────────────────────────────────
  const handleLogin = (user: User, tkn: string) => {
    setCurrentUser(user);
    setToken(tkn);
    localStorage.setItem('token', tkn);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      apiGetMe()
        .then(data => setCurrentUser(data.user))
        .catch(() => handleLogout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Data fetching ────────────────────────────────
  const fetchEvents = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGetEvents();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  }, [token]);

  const fetchRegistrations = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGetRegistrations();
      setRegistrations(data || []);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token && currentUser) {
      fetchEvents();
      fetchRegistrations();
    }
  }, [token, currentUser, fetchEvents, fetchRegistrations]);

  // ── Event actions ────────────────────────────────
  const handleJoinEvent = async (eventId: number) => {
    try {
      await apiJoinEvent(eventId);
      await fetchEvents();
      await fetchRegistrations();
    } catch (err: any) {
      alert(err.message || 'Failed to join event');
    }
  };

  const handleLeaveEvent = async (eventId: number) => {
    try {
      await apiLeaveEvent(eventId);
      await fetchEvents();
      await fetchRegistrations();
    } catch (err: any) {
      alert(err.message || 'Failed to leave event');
    }
  };

  const handleEventCreated = async () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    await fetchEvents();
  };

  const handleEditEvent = (event: EventItem) => {
    setEditingEvent(event);
    setShowCreateModal(true);
  };

  // ── Loading & Auth Gate ──────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#0a0a0a', color: '#fff'
      }}>
        <div style={{
          width: '48px', height: '48px', border: '4px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: '#6366f1', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Main App Layout ─────────────────────────────────────
  const MainApp = () => {
    const myRegisteredEventIds = new Set(registrations.map(r => r.event_id));

    return (
      <div className="relative min-h-screen bg-background text-foreground font-sans antialiased">
        {/* Ambient radial glow — matches landing page atmosphere */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 70%)',
          }}
        />

        <Navbar
          user={currentUser!}
          currentView={currentView}
          onViewChange={setCurrentView}
          onLogout={handleLogout}
        />

        <main className={cn(
          "relative z-10",
          currentView === ViewState.EXPLORE
            ? "w-full p-0 overflow-hidden"
            : "mx-auto max-w-7xl px-6 py-8"
        )}>
          {currentView === ViewState.ADMIN && currentUser?.isAdmin ? (
            <AdminDashboard currentUser={currentUser} onEditEvent={handleEditEvent} />
          ) : currentView === ViewState.MY_TICKETS ? (
            <UserDashboard
              events={events.filter(e => myRegisteredEventIds.has(e.id))}
              registrations={registrations}
              currentUser={currentUser!}
              onLeaveEvent={handleLeaveEvent}
              onJoinEvent={handleJoinEvent}
              viewMode="tickets"
              onCreateEvent={currentUser?.isAdmin ? () => { setEditingEvent(null); setShowCreateModal(true); } : undefined}
            />
          ) : (
            <UserDashboard
              events={events}
              registrations={registrations}
              currentUser={currentUser!}
              onJoinEvent={handleJoinEvent}
              onLeaveEvent={handleLeaveEvent}
              viewMode="explore"
              onCreateEvent={currentUser?.isAdmin ? () => { setEditingEvent(null); setShowCreateModal(true); } : undefined}
            />
          )}
        </main>

        {showCreateModal && (
          <CreateEventModal
            onClose={() => { setShowCreateModal(false); setEditingEvent(null); }}
            onEventCreated={handleEventCreated}
            editingEvent={editingEvent}
          />
        )}
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/login" element={
        currentUser ? <Navigate to="/" replace /> : <AnimatedLoginPage onLogin={(u, t) => { handleLogin(u, t); navigate('/'); }} onNavigateHome={() => navigate('/')} />
      } />
      <Route path="/" element={
        !currentUser ? (
          <LandingHero onGetStarted={() => navigate('/login')} />
        ) : (
          <MainApp />
        )
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
