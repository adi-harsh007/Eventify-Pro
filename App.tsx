import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { User, EventItem, Registration, ViewState } from './types';
import { apiGetEvents, apiGetRegistrations, apiJoinEvent, apiLeaveEvent, apiGetMe } from './apiService';
import LandingHero from './components/LandingHero';
import Navbar from './components/Navbar';
import { cn } from './lib/utils';

const AnimatedLoginPage = lazy(() =>
  import('./components/ui/animated-characters-login-page').then(m => ({ default: m.AnimatedLoginPage }))
);
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const MegaEventPage = lazy(() => import('./components/MegaEventPage'));
const CreateEventModal = lazy(() => import('./components/CreateEventModal'));
const Chatbot = lazy(() => import('./components/Chatbot'));

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-[#07090F]">
    <div className="h-9 w-9 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
  </div>
);

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const saved = localStorage.getItem('currentView');
    return saved ? (saved as ViewState) : ViewState.EXPLORE;
  });

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

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

  // ── Data fetching (paginates through all event pages) ──
  const fetchEvents = useCallback(async () => {
    if (!token) return;
    try {
      const allEvents: EventItem[] = [];
      let cursor: string | undefined;
      let hasMore = true;
      let pages = 0;

      while (hasMore && pages < 10) {
        const data = await apiGetEvents(cursor, 50);
        const batch: EventItem[] = data.events || [];
        allEvents.push(...batch);
        hasMore = Boolean(data.hasMore && data.nextCursor);
        cursor = data.nextCursor || undefined;
        pages += 1;
      }

      setEvents(allEvents);
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
  const handleJoinEvent = async (eventId: number, teamName?: string) => {
    try {
      await apiJoinEvent(eventId, teamName);
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

  // ── Loading Gate ──────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090F] text-white">
        <div className="h-11 w-11 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  // ── Main App Layout ───────────────────────────────
  const renderMainApp = () => {
    return (
      <div className="relative min-h-screen bg-[#07090F] text-foreground antialiased">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 75% 45% at 20% -5%, rgba(244,63,94,0.10) 0%, transparent 60%), radial-gradient(ellipse 65% 45% at 85% 0%, rgba(56,189,248,0.10) 0%, transparent 60%)',
          }}
        />

        <Navbar
          user={currentUser!}
          currentView={currentView}
          onViewChange={setCurrentView}
          onLogout={handleLogout}
        />

        <main
          className={cn(
            'relative z-10',
            currentView === ViewState.EXPLORE
              ? 'w-full p-0 overflow-hidden'
              : 'mx-auto max-w-7xl px-4 sm:px-6 py-8'
          )}
        >
          <Suspense fallback={<RouteFallback />}>
            {currentView === ViewState.ADMIN && currentUser?.isAdmin ? (
              <AdminDashboard currentUser={currentUser} onEditEvent={handleEditEvent} />
            ) : currentView === ViewState.MEGA_EVENT ? (
              <MegaEventPage user={currentUser!} />
            ) : (
              <UserDashboard
                events={events}
                registrations={registrations}
                currentUser={currentUser!}
                onJoinEvent={handleJoinEvent}
                onLeaveEvent={handleLeaveEvent}
                viewMode={currentView === ViewState.TICKETS ? 'tickets' : 'explore'}
                onCreateEvent={currentUser?.isAdmin ? () => { setEditingEvent(null); setShowCreateModal(true); } : undefined}
              />
            )}
          </Suspense>
        </main>

        {showCreateModal && (
          <Suspense fallback={null}>
            <CreateEventModal
              onClose={() => { setShowCreateModal(false); setEditingEvent(null); }}
              onEventCreated={handleEventCreated}
              editingEvent={editingEvent}
            />
          </Suspense>
        )}
      </div>
    );
  };

  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/" replace />
            ) : (
              <Suspense fallback={<RouteFallback />}>
                <AnimatedLoginPage
                  onLogin={(u, t) => { handleLogin(u, t); navigate('/'); }}
                  onNavigateHome={() => navigate('/')}
                />
              </Suspense>
            )
          }
        />
        <Route
          path="/"
          element={
            !currentUser ? (
              <LandingHero onGetStarted={() => navigate('/login')} />
            ) : (
              renderMainApp()
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {location.pathname !== '/login' && (
        <Suspense fallback={null}>
          <Chatbot currentUser={currentUser} />
        </Suspense>
      )}
    </MotionConfig>
  );
}

export default App;
