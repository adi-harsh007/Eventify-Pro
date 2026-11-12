import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { EventItem, Registration, User } from '../types';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Ticket,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
} from 'lucide-react';
import { EventCard } from './ui/event-card';
import { CalendarView } from './ui/calendar-view';
import { EventDetailsModal } from './ui/event-details-modal';
import { cn } from '../lib/utils';
import { getEventTheme, getCalendarBadgeParts } from '../lib/eventThemes';

interface UserDashboardProps {
  events: EventItem[];
  registrations: Registration[];
  currentUser: User | null;
  onJoinEvent: (eventId: number, teamName?: string) => void;
  onLeaveEvent: (eventId: number) => void;
  viewMode: 'explore' | 'tickets';
  onCreateEvent?: () => void;
}

import {
  IoHomeOutline,
  IoHardwareChipOutline,
  IoSettingsOutline,
  IoColorPaletteOutline,
  IoFootballOutline,
  IoBriefcaseOutline,
  IoFlaskOutline,
  IoPlanetOutline,
} from 'react-icons/io5';

// ── Department config ────────────────────────────────────
type Department = 'CSE' | 'ECE' | 'Mechanical' | 'Arts' | 'Sports' | 'Management' | 'Science' | 'General';

const DEPARTMENTS: Department[] = ['CSE', 'ECE', 'Mechanical', 'Arts', 'Sports', 'Management', 'Science', 'General'];

const DEPT_META: Record<Department, { label: string; icon: React.ReactNode; gradientFrom: string; gradientTo: string }> = {
  CSE: { label: 'Computer Science', icon: <IoHardwareChipOutline />, gradientFrom: '#22D3EE', gradientTo: '#3B82F6' },
  ECE: { label: 'Electronics', icon: <IoPlanetOutline />, gradientFrom: '#60A5FA', gradientTo: '#6366F1' },
  Mechanical: { label: 'Mechanical', icon: <IoSettingsOutline />, gradientFrom: '#FB923C', gradientTo: '#F43F5E' },
  Arts: { label: 'Arts & Culture', icon: <IoColorPaletteOutline />, gradientFrom: '#F472B6', gradientTo: '#F59E0B' },
  Sports: { label: 'Sports', icon: <IoFootballOutline />, gradientFrom: '#34D399', gradientTo: '#0EA5E9' },
  Management: { label: 'Management', icon: <IoBriefcaseOutline />, gradientFrom: '#FBBF24', gradientTo: '#F97316' },
  Science: { label: 'Science', icon: <IoFlaskOutline />, gradientFrom: '#2DD4BF', gradientTo: '#10B981' },
  General: { label: 'General & Campus', icon: <IoHomeOutline />, gradientFrom: '#A78BFA', gradientTo: '#EC4899' },
};

// ── Date/time formatting helpers ─────────────────────────
function formatEventDateTime(dateStr: string, timeStr: string): string {
  try {
    const cleanDate = dateStr.split('T')[0];
    const [y, mo, da] = cleanDate.split('-').map(Number);
    const d = !isNaN(y) && !isNaN(mo) && !isNaN(da) ? new Date(y, mo - 1, da) : new Date(dateStr);
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const timeFormatted = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
    return `${formatted} · ${timeFormatted}`;
  } catch {
    return `${dateStr} · ${timeStr}`;
  }
}

function getEventDateTime(dateStr: string, timeStr: string): Date {
  const cleanDate = dateStr.split('T')[0];
  let localDateStr = cleanDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    localDateStr = `${yyyy}-${mm}-${dd}`;
  }

  const [h, m] = timeStr.split(':').map(Number);
  const formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
  return new Date(`${localDateStr}T${formattedTime}`);
}

function getDaysUntil(targetDate: Date): string {
  const diffMs = targetDate.getTime() - Date.now();
  if (diffMs <= 0) return 'Live now';
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `Starts in ${days}d ${hours}h`;
  return `Starts in ${hours}h`;
}

// ── Shared GPU-composited Department Filter Bar ──────────
const DepartmentFilterBar: React.FC<{
  selectedDept: 'All' | Department;
  onSelectDept: (dept: 'All' | Department) => void;
  layoutIdPrefix: string;
}> = ({ selectedDept, onSelectDept, layoutIdPrefix }) => (
  <div
    className="flex items-center gap-2 overflow-x-auto rounded-2xl px-3.5 py-2.5"
    style={{
      background: 'rgba(14, 20, 36, 0.78)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)',
      scrollbarWidth: 'none',
    }}
  >
    <div className="flex shrink-0 items-center gap-2 px-1 text-slate-400">
      <SlidersHorizontal size={13} />
      <span className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Vibe</span>
    </div>
    <div className="h-4 w-px shrink-0 bg-white/10" />

    <button
      type="button"
      onClick={() => onSelectDept('All')}
      className={cn(
        'relative inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer',
        selectedDept === 'All' ? 'text-slate-950' : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
      )}
    >
      {selectedDept === 'All' && (
        <motion.span
          layoutId={`${layoutIdPrefix}-pill`}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="absolute inset-0 rounded-xl bg-white"
        />
      )}
      <span className="relative z-10">All ({DEPARTMENTS.length})</span>
    </button>

    {DEPARTMENTS.map((dept) => {
      const meta = DEPT_META[dept];
      const active = selectedDept === dept;
      return (
        <button
          key={dept}
          type="button"
          onClick={() => onSelectDept(dept)}
          className={cn(
            'relative inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer',
            active ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
          )}
        >
          {active && (
            <motion.span
              layoutId={`${layoutIdPrefix}-pill`}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="absolute inset-0 rounded-xl"
              style={{ backgroundImage: `linear-gradient(135deg, ${meta.gradientFrom}, ${meta.gradientTo})` }}
            />
          )}
          <span className="relative z-10 text-sm">{meta.icon}</span>
          <span className="relative z-10 whitespace-nowrap">{dept}</span>
        </button>
      );
    })}
  </div>
);

const UserDashboard: React.FC<UserDashboardProps> = ({
  events,
  registrations,
  currentUser,
  onJoinEvent,
  onLeaveEvent,
  viewMode,
  onCreateEvent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<'All' | Department>('All');
  const [selectedEventDetails, setSelectedEventDetails] = useState<EventItem | null>(null);
  const mainSectionRef = useRef<HTMLDivElement>(null);

  const myRegEventIds = useMemo(
    () => new Set(registrations.filter(r => r.user_id === currentUser?.id).map(r => r.event_id)),
    [registrations, currentUser?.id]
  );

  const [now, setNow] = useState(() => new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isEventPast = React.useCallback((event: EventItem) => {
    if (!event.date) return false;
    try {
      return getEventDateTime(event.date, event.time) <= now;
    } catch {
      return false;
    }
  }, [now]);

  const upcomingEvents = useMemo(() => events.filter(e => !isEventPast(e)), [events, isEventPast]);
  const completedEvents = useMemo(() => events.filter(e => isEventPast(e)), [events, isEventPast]);

  // Nearest upcoming event for spotlight hero
  const nextSpotlight = useMemo(() => {
    if (upcomingEvents.length === 0) return null;
    return [...upcomingEvents].sort(
      (a, b) => getEventDateTime(a.date, a.time).getTime() - getEventDateTime(b.date, b.time).getTime()
    )[0];
  }, [upcomingEvents]);

  const filteredUpcoming = useMemo(() => {
    return upcomingEvents.filter(event => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        event.title.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q) ||
        event.category.toLowerCase().includes(q);
      const matchesDept = selectedDept === 'All' || event.department === selectedDept;
      if (viewMode === 'tickets') return myRegEventIds.has(event.id) && matchesSearch && matchesDept;
      return matchesSearch && matchesDept;
    });
  }, [upcomingEvents, searchTerm, selectedDept, viewMode, myRegEventIds]);

  const filteredCompleted = useMemo(() => {
    return completedEvents.filter(event => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        event.title.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q) ||
        event.category.toLowerCase().includes(q);
      const matchesDept = selectedDept === 'All' || event.department === selectedDept;
      if (viewMode === 'tickets') return myRegEventIds.has(event.id) && matchesSearch && matchesDept;
      return matchesSearch && matchesDept;
    });
  }, [completedEvents, searchTerm, selectedDept, viewMode, myRegEventIds]);

  const deptGroups = useMemo(() => {
    return DEPARTMENTS
      .map(dept => ({ dept, events: upcomingEvents.filter(e => e.department === dept) }))
      .filter(g => g.events.length > 0);
  }, [upcomingEvents]);

  const isFiltering = searchTerm.trim() !== '' || selectedDept !== 'All';
  const firstName = currentUser?.name?.split(' ')[0] || 'there';

  // ── My Tickets view ────────────────────────────────────
  if (viewMode === 'tickets') {
    return (
      <div className="relative min-h-screen bg-[#07090F]">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <TicketsContent
            upcomingEvents={filteredUpcoming}
            completedEvents={filteredCompleted}
            myRegEventIds={myRegEventIds}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDept={selectedDept}
            setSelectedDept={setSelectedDept}
            onJoinEvent={onJoinEvent}
            onLeaveEvent={onLeaveEvent}
            onEventClick={setSelectedEventDetails}
            isPastEvent={isEventPast}
          />
        </div>
        <EventDetailsModal
          event={selectedEventDetails!}
          isOpen={!!selectedEventDetails}
          onClose={() => setSelectedEventDetails(null)}
          isRegistered={selectedEventDetails ? myRegEventIds.has(selectedEventDetails.id) : false}
          onToggleRegistration={(teamName) => {
            if (!selectedEventDetails) return;
            if (myRegEventIds.has(selectedEventDetails.id)) onLeaveEvent(selectedEventDetails.id);
            else onJoinEvent(selectedEventDetails.id, teamName);
          }}
          isAdmin={currentUser?.isAdmin}
        />
      </div>
    );
  }

  // ── Explore view ───────────────────────────────────────
  return (
    <div
      className="relative w-full bg-[#07090F]"
      style={{
        overflowY: 'auto',
        height: 'calc(100vh - 64px)',
      }}
    >
      {/* ════ SECTION 1 — Kinetic Welcome + Spotlight Hero ════ */}
      <section className="relative overflow-hidden border-b border-white/[0.06] py-10 sm:py-12 px-4 sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-festival-grid opacity-25"
        />
        <div className="relative z-10 mx-auto max-w-7xl grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Greeting + Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-7 space-y-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-200">
              <Sparkles size={13} className="text-amber-300" />
              Campus Event Hub
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Hey {firstName},{' '}
              <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-cyan-300 bg-clip-text text-transparent">
                what&apos;s your next move?
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300/80 max-w-xl">
              Explore upcoming hackathons, concerts, workshops, and tournaments across all 8 departments.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-mono-num font-medium text-cyan-200">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {upcomingEvents.length} Upcoming
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-mono-num font-medium text-emerald-200">
                <Ticket size={12} />
                {myRegEventIds.size} Passes Claimed
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-mono-num font-medium text-slate-300">
                {completedEvents.length} Completed
              </span>
            </div>
          </motion.div>

          {/* Right "Up Next" Mini Ticket Card */}
          {nextSpotlight && (() => {
            const theme = getEventTheme(nextSpotlight.category);
            const badge = getCalendarBadgeParts(nextSpotlight.date);
            const dt = getEventDateTime(nextSpotlight.date, nextSpotlight.time);
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                onClick={() => setSelectedEventDetails(nextSpotlight)}
                className="lg:col-span-5 group relative overflow-hidden rounded-3xl border border-white/15 bg-[#0E1424]/95 p-5 sm:p-6 cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                style={{ boxShadow: `0 20px 50px -24px ${theme.glowRgba}` }}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-300 font-mono-num">
                    <Clock size={12} />
                    Up Next · {getDaysUntil(dt)}
                  </span>
                  <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase', theme.pillClass)}>
                    {nextSpotlight.department}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <h2 className="font-display text-xl font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                      {nextSpotlight.title}
                    </h2>
                    <p className="inline-flex items-center gap-1.5 text-xs text-slate-400 line-clamp-1">
                      <MapPin size={12} className="text-slate-500" />
                      {nextSpotlight.location}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-center font-mono-num">
                    <span className="block text-[9px] font-bold text-amber-300 leading-none">{badge.month}</span>
                    <span className="block text-base font-bold text-white leading-tight">{badge.day}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-white/10 flex items-center justify-between text-xs">
                  <span className="font-mono-num text-slate-400">
                    {nextSpotlight.registered_count} / {nextSpotlight.capacity} registered
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-white group-hover:text-amber-300 transition-colors">
                    Open details <ArrowUpRight size={14} />
                  </span>
                </div>
              </motion.div>
            );
          })()}
        </div>
      </section>

      {/* ════ SECTION 2 — Departments ════ */}
      <section ref={mainSectionRef} className="relative w-full min-h-screen">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-8">
          {/* Search + Create */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="group relative w-full sm:w-80">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-amber-300"
              />
              <input
                type="text"
                placeholder="Search title, venue, category..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-amber-400/50"
              />
            </div>

            {onCreateEvent && (
              <button
                onClick={onCreateEvent}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Plus size={15} /> Create Event
              </button>
            )}
          </div>

          {/* GPU-only Department Filter Bar */}
          <div className="mb-10">
            <DepartmentFilterBar
              selectedDept={selectedDept}
              onSelectDept={setSelectedDept}
              layoutIdPrefix="explore-dept"
            />
          </div>

          {/* Content */}
          {isFiltering ? (
            filteredUpcoming.length === 0 && filteredCompleted.length === 0 ? (
              <EmptyState onClear={() => { setSearchTerm(''); setSelectedDept('All'); }} />
            ) : (
              <div className="space-y-12 pb-16">
                {filteredUpcoming.length > 0 && (
                  <div>
                    <h3 className="font-display text-xl font-bold text-white mb-5 flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      Active Events ({filteredUpcoming.length})
                    </h3>
                    <EventGrid
                      events={filteredUpcoming}
                      myRegEventIds={myRegEventIds}
                      onJoinEvent={onJoinEvent}
                      onLeaveEvent={onLeaveEvent}
                      onEventClick={setSelectedEventDetails}
                      isPastEvent={isEventPast}
                    />
                  </div>
                )}
                {filteredCompleted.length > 0 && (
                  <div>
                    <h3 className="font-display text-xl font-bold text-white mb-5 flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                      Completed Events &amp; Reviews ({filteredCompleted.length})
                    </h3>
                    <EventGrid
                      events={filteredCompleted}
                      myRegEventIds={myRegEventIds}
                      onJoinEvent={onJoinEvent}
                      onLeaveEvent={onLeaveEvent}
                      onEventClick={setSelectedEventDetails}
                      isPastEvent={isEventPast}
                    />
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="space-y-14 pb-20">
              {upcomingEvents.length === 0 && completedEvents.length === 0 ? (
                <EmptyState onClear={undefined} />
              ) : (
                <>
                  {deptGroups.map(({ dept, events: deptEvents }) => (
                    <DeptRow
                      key={dept}
                      dept={dept}
                      events={deptEvents}
                      myRegEventIds={myRegEventIds}
                      onJoinEvent={onJoinEvent}
                      onLeaveEvent={onLeaveEvent}
                      onEventClick={setSelectedEventDetails}
                      isPastEvent={isEventPast}
                    />
                  ))}

                  {completedEvents.length > 0 && (
                    <div className="pt-10 mt-10 border-t border-white/[0.06]">
                      <div className="mb-6">
                        <h2 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                          Completed Events &amp; Reviews
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Browse past campus events and participant reviews.
                        </p>
                      </div>
                      <EventGrid
                        events={completedEvents}
                        myRegEventIds={myRegEventIds}
                        onJoinEvent={onJoinEvent}
                        onLeaveEvent={onLeaveEvent}
                        onEventClick={setSelectedEventDetails}
                        isPastEvent={isEventPast}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <EventDetailsModal
          event={selectedEventDetails!}
          isOpen={!!selectedEventDetails}
          onClose={() => setSelectedEventDetails(null)}
          isRegistered={selectedEventDetails ? myRegEventIds.has(selectedEventDetails.id) : false}
          onToggleRegistration={(teamName) => {
            if (!selectedEventDetails) return;
            if (myRegEventIds.has(selectedEventDetails.id)) onLeaveEvent(selectedEventDetails.id);
            else onJoinEvent(selectedEventDetails.id, teamName);
          }}
          isAdmin={currentUser?.isAdmin}
        />
      </section>
    </div>
  );
};

// ── Department Horizontal Row ────────────────────────────
const DeptRow: React.FC<{
  dept: Department;
  events: EventItem[];
  myRegEventIds: Set<number>;
  onJoinEvent: (id: number, teamName?: string) => void;
  onLeaveEvent: (id: number) => void;
  onEventClick: (event: EventItem) => void;
  isPastEvent: (event: EventItem) => boolean;
}> = ({ dept, events, myRegEventIds, onJoinEvent, onLeaveEvent, onEventClick, isPastEvent }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const meta = DEPT_META[dept];

  const scroll = (dir: 'left' | 'right') =>
    rowRef.current?.scrollBy({ left: dir === 'right' ? 360 : -360, behavior: 'smooth' });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl text-slate-950 shadow-lg"
            style={{ backgroundImage: `linear-gradient(135deg, ${meta.gradientFrom}, ${meta.gradientTo})` }}
          >
            {meta.icon}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              {meta.label}
            </h2>
            <p className="text-xs font-mono-num text-slate-400">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[{ dir: 'left', rotate: 'rotate(180deg)' }, { dir: 'right', rotate: 'none' }].map(({ dir, rotate }) => (
            <button
              key={dir}
              onClick={() => scroll(dir as 'left' | 'right')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-400 hover:border-white/30 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight size={14} style={{ transform: rotate }} />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={rowRef}
        className="flex gap-5 overflow-x-auto pb-4"
        style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
      >
        {events.map(event => {
          const isJoined = myRegEventIds.has(event.id);
          const isFull = event.registered_count >= event.capacity;
          const isPast = isPastEvent(event);
          return (
            <div key={event.id} className="shrink-0" style={{ width: 'min(336px, 85vw)', scrollSnapAlign: 'start' }}>
              <EventCard
                imageUrl={event.image_url || ''}
                category={event.category}
                title={event.title}
                location={event.location}
                description={event.description}
                date={formatEventDateTime(event.date, event.time)}
                rawDate={event.date}
                registeredCount={event.registered_count}
                capacity={event.capacity}
                isRegistered={isJoined}
                isSoldOut={isFull && !isJoined}
                isPastEvent={isPast}
                isTeamEvent={event.is_team_event}
                maxTeamSize={event.max_team_size}
                onToggleRegistration={(teamName) => (isJoined ? onLeaveEvent(event.id) : onJoinEvent(event.id, teamName))}
                onClick={() => onEventClick(event)}
                className="h-[395px]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Flat Event Grid ──────────────────────────────────────
const EventGrid: React.FC<{
  events: EventItem[];
  myRegEventIds: Set<number>;
  onJoinEvent: (id: number, teamName?: string) => void;
  onLeaveEvent: (id: number) => void;
  onEventClick: (event: EventItem) => void;
  isPastEvent: (event: EventItem) => boolean;
}> = ({ events, myRegEventIds, onJoinEvent, onLeaveEvent, onEventClick, isPastEvent }) => (
  <div
    className="grid pb-12"
    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '20px' }}
  >
    {events.map(event => {
      const isJoined = myRegEventIds.has(event.id);
      const isFull = event.registered_count >= event.capacity;
      const isPast = isPastEvent(event);
      return (
        <EventCard
          key={event.id}
          imageUrl={event.image_url || ''}
          category={event.category}
          title={event.title}
          location={event.location}
          description={event.description}
          date={formatEventDateTime(event.date, event.time)}
          rawDate={event.date}
          registeredCount={event.registered_count}
          capacity={event.capacity}
          isRegistered={isJoined}
          isSoldOut={isFull && !isJoined}
          isPastEvent={isPast}
          isTeamEvent={event.is_team_event}
          maxTeamSize={event.max_team_size}
          onToggleRegistration={(teamName) => (isJoined ? onLeaveEvent(event.id) : onJoinEvent(event.id, teamName))}
          onClick={() => onEventClick(event)}
          className="h-[395px]"
        />
      );
    })}
  </div>
);

// ── Tickets Content ──────────────────────────────────────
const TicketsContent: React.FC<{
  upcomingEvents: EventItem[];
  completedEvents: EventItem[];
  myRegEventIds: Set<number>;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedDept: 'All' | Department;
  setSelectedDept: (v: 'All' | Department) => void;
  onJoinEvent: (id: number, teamName?: string) => void;
  onLeaveEvent: (id: number) => void;
  onEventClick: (event: EventItem) => void;
  isPastEvent: (event: EventItem) => boolean;
}> = ({
  upcomingEvents,
  completedEvents,
  myRegEventIds,
  searchTerm,
  setSearchTerm,
  selectedDept,
  setSelectedDept,
  onJoinEvent,
  onLeaveEvent,
  onEventClick,
  isPastEvent,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
            <Ticket size={13} />
            Your Passes
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            My Tickets
          </h2>
          <p className="text-sm text-slate-400">
            {myRegEventIds.size > 0
              ? `${myRegEventIds.size} booked pass${myRegEventIds.size !== 1 ? 'es' : ''}`
              : 'Your claimed event passes will appear here.'}
          </p>
        </div>

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-opacity cursor-pointer"
        >
          {showCalendar ? (
            <>
              <Ticket size={16} /> List View
            </>
          ) : (
            <>
              <CalendarIcon size={16} /> Calendar View
            </>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="group relative w-full sm:w-80">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search your passes..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-amber-400/50"
        />
      </div>

      <DepartmentFilterBar
        selectedDept={selectedDept}
        onSelectDept={setSelectedDept}
        layoutIdPrefix="tickets-dept"
      />

      {showCalendar ? (
        <div className="pt-2">
          <CalendarView events={upcomingEvents} />
        </div>
      ) : (
        <div className="space-y-12 pb-16">
          {upcomingEvents.length === 0 && completedEvents.length === 0 ? (
            <EmptyState
              onClear={searchTerm || selectedDept !== 'All' ? () => { setSearchTerm(''); setSelectedDept('All'); } : undefined}
              isTickets
            />
          ) : (
            <>
              {upcomingEvents.length > 0 && (
                <div>
                  <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Active Passes ({upcomingEvents.length})
                  </h3>
                  <EventGrid
                    events={upcomingEvents}
                    myRegEventIds={myRegEventIds}
                    onJoinEvent={onJoinEvent}
                    onLeaveEvent={onLeaveEvent}
                    onEventClick={onEventClick}
                    isPastEvent={isPastEvent}
                  />
                </div>
              )}
              {completedEvents.length > 0 && (
                <div>
                  <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    Past Events ({completedEvents.length})
                  </h3>
                  <EventGrid
                    events={completedEvents}
                    myRegEventIds={myRegEventIds}
                    onJoinEvent={onJoinEvent}
                    onLeaveEvent={onLeaveEvent}
                    onEventClick={onEventClick}
                    isPastEvent={isPastEvent}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── Empty State ──────────────────────────────────────────
const EmptyState: React.FC<{ onClear?: () => void; isTickets?: boolean }> = ({ onClear, isTickets }) => (
  <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-white/[0.06] bg-white/[0.02] py-24 text-center px-6">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
      {isTickets ? <Ticket className="h-7 w-7" /> : <GraduationCap className="h-7 w-7" />}
    </div>
    <div className="space-y-1.5">
      <h3 className="font-display text-2xl font-bold text-white">
        {isTickets ? 'No passes claimed yet' : 'No matching events'}
      </h3>
      <p className="text-sm text-slate-400 max-w-sm">
        {isTickets ? 'Explore upcoming events and grab your first campus pass.' : 'Try clearing your search or choosing another department.'}
      </p>
    </div>
    {onClear && (
      <button
        onClick={onClear}
        className="rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
      >
        Clear filters
      </button>
    )}
  </div>
);

export default UserDashboard;
