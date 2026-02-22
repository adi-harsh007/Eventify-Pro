import React, { useState, useRef } from 'react';
import { EventItem, Registration, User } from '../types';
import { Search, SlidersHorizontal, Plus, Ticket, ChevronRight, ChevronDown } from 'lucide-react';
import { EventCard } from './ui/event-card';
import { ParticleTextEffect } from './ui/particle-text-effect';
import { cn } from '../lib/utils';

interface UserDashboardProps {
  events: EventItem[];
  registrations: Registration[];
  currentUser: User | null;
  onJoinEvent: (eventId: number) => void;
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
  CSE: { label: 'Computer Science', icon: <IoHardwareChipOutline />, gradientFrom: '#a955ff', gradientTo: '#ea51ff' },
  ECE: { label: 'Electronics', icon: <IoPlanetOutline />, gradientFrom: '#56CCF2', gradientTo: '#2F80ED' },
  Mechanical: { label: 'Mechanical', icon: <IoSettingsOutline />, gradientFrom: '#FF9966', gradientTo: '#FF5E62' },
  Arts: { label: 'Arts & Culture', icon: <IoColorPaletteOutline />, gradientFrom: '#ffa9c6', gradientTo: '#f434e2' },
  Sports: { label: 'Sports', icon: <IoFootballOutline />, gradientFrom: '#80FF72', gradientTo: '#7EE8FA' },
  Management: { label: 'Management', icon: <IoBriefcaseOutline />, gradientFrom: '#F2C94C', gradientTo: '#F2994A' },
  Science: { label: 'Science', icon: <IoFlaskOutline />, gradientFrom: '#11998e', gradientTo: '#38ef7d' },
  General: { label: 'General / Other', icon: <IoHomeOutline />, gradientFrom: '#8E2DE2', gradientTo: '#4A00E0' },
};

// ── Date/time formatting helper ─────────────────────────
function formatEventDateTime(dateStr: string, timeStr: string): string {
  try {
    const d = new Date(dateStr);
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    // Parse time like "21:00:00" into "9:00 PM"
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const timeFormatted = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
    return `${formatted} · ${timeFormatted}`;
  } catch {
    return `${dateStr} · ${timeStr}`;
  }
}

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
  const mainSectionRef = useRef<HTMLDivElement>(null);

  const myRegEventIds = new Set(
    registrations
      .filter(r => r.user_id === currentUser?.id)
      .map(r => r.event_id)
  );

  // Filter logic
  const filtered = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || event.department === selectedDept;
    if (viewMode === 'tickets') return myRegEventIds.has(event.id) && matchesSearch && matchesDept;
    return matchesSearch && matchesDept;
  });

  // Group events by department (for Netflix rows)
  const deptGroups = DEPARTMENTS
    .map(dept => ({ dept, events: events.filter(e => e.department === dept) }))
    .filter(g => g.events.length > 0);

  const isFiltering = searchTerm.trim() !== '' || selectedDept !== 'All';
  const firstName = currentUser?.name?.split(' ')[0] || 'there';

  const scrollToMain = () => mainSectionRef.current?.scrollIntoView({ behavior: 'smooth' });

  // ── My Tickets view (no hero) ──
  if (viewMode === 'tickets') {
    return (
      <div className="relative min-h-screen" style={{ backgroundColor: '#0B0F19' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 90% 60% at 50% -5%, #111827 0%, transparent 65%)' }} />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
          <TicketsContent
            displayedEvents={filtered}
            myRegEventIds={myRegEventIds}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDept={selectedDept}
            setSelectedDept={setSelectedDept}
            onJoinEvent={onJoinEvent}
            onLeaveEvent={onLeaveEvent}
            firstName={firstName}
          />
        </div>
      </div>
    );
  }

  // ── Explore view (hero + departments) ──
  return (
    <div className="relative w-full" style={{
      backgroundColor: '#0B0F19',
      scrollSnapType: 'y mandatory',
      overflowY: 'scroll',
      height: 'calc(100vh - 64px)',
    }}>

      {/* ════ SECTION 1 — Hero ════ */}
      <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden"
        style={{ scrollSnapAlign: 'start', backgroundColor: '#0B0F19' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(59,130,246,0.07) 0%, transparent 60%)',
        }} />

        {/* Particle canvas */}
        <div className="relative w-full" style={{ height: '220px' }}>
          <ParticleTextEffect text="Eventify Pro" fontSize={96} color="#3B82F6" glowColor="#6366F1" />
        </div>

        {/* Welcome greeting */}
        <div className="relative z-10 mt-6 flex flex-col items-center gap-4 text-center px-6">
          <h1 className="font-bold leading-tight tracking-tight" style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.45) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '16px' }}>
            Explore what's happening across your campus.
          </p>

          {/* Stats + dept chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#94A3B8' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {events.length} Events on Campus
            </span>
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#94A3B8' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              {deptGroups.length} Departments Active
            </span>
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#94A3B8' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {myRegEventIds.size} Registered
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <button onClick={scrollToMain} aria-label="Scroll to events"
          className="absolute bottom-10 flex flex-col items-center gap-2 hover:opacity-100 transition-opacity"
          style={{ opacity: 0.6 }}>
          <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#94A3B8' }}>
            Scroll to Explore
          </span>
          <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 pt-1.5"
            style={{ borderColor: '#94A3B8' }}>
            <div className="h-2 w-1 rounded-full" style={{
              backgroundColor: '#3B82F6',
              animation: 'scrollDot 1.6s ease-in-out infinite',
            }} />
          </div>
          <ChevronDown size={16} style={{ color: '#94A3B8' }} className="animate-bounce" />
        </button>
        <style>{`@keyframes scrollDot{0%{transform:translateY(0);opacity:1}100%{transform:translateY(10px);opacity:0}}`}</style>
      </section>

      {/* ════ SECTION 2 — Departments ════ */}
      <section ref={mainSectionRef} className="relative w-full"
        style={{ scrollSnapAlign: 'start', backgroundColor: '#0B0F19', minHeight: '100vh' }}>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">

          {/* ── Search + Create ── */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="group relative w-full sm:w-80">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#3B82F6]"
                style={{ color: '#94A3B8' }} />
              <input type="text" placeholder="Search events..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl py-3 pl-10 pr-4 text-sm text-white outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(59,130,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            {onCreateEvent && (
              <button onClick={onCreateEvent}
                className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-all duration-300 active:scale-[0.97] hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)', boxShadow: '0 0 20px rgba(59,130,246,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Plus size={15} /> Create Event
              </button>
            )}
          </div>

          {/* ── Department filter pills ── */}
          <div className="mb-10">
            <div className="flex items-center gap-3 overflow-x-auto rounded-2xl px-4 py-3"
              style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', scrollbarWidth: 'none' }}>
              <div className="flex shrink-0 items-center gap-2" style={{ color: '#94A3B8' }}>
                <SlidersHorizontal size={13} />
                <span className="text-xs font-medium whitespace-nowrap">Department</span>
              </div>
              <div className="h-4 w-px shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
              {/* All pill */}
              <button
                onClick={() => setSelectedDept('All')}
                style={{ '--gradient-from': '#3B82F6', '--gradient-to': '#6366F1' } as React.CSSProperties}
                className={cn(
                  "relative h-[48px] shadow-lg rounded-full flex shrink-0 items-center justify-center transition-all duration-500 hover:shadow-none group cursor-pointer",
                  selectedDept === 'All' ? "w-[120px] bg-transparent" : "w-[48px] bg-[#1a1f2e] hover:w-[120px]"
                )}
              >
                {/* Gradient background on hover / active */}
                <span className={cn(
                  "absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] transition-all duration-500",
                  selectedDept === 'All' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}></span>
                {/* Blur glow */}
                <span className={cn(
                  "absolute top-[8px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[12px] -z-10 transition-all duration-500",
                  selectedDept === 'All' ? "opacity-40" : "opacity-0 group-hover:opacity-40"
                )}></span>

                {/* Icon (Text 'All') */}
                <span className={cn(
                  "relative z-10 transition-all duration-500 absolute font-bold",
                  selectedDept === 'All' ? "scale-0 opacity-0" : "scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0 text-[#94A3B8]"
                )}>
                  All
                </span>

                {/* Title */}
                <span className={cn(
                  "absolute text-white uppercase tracking-wide font-bold text-sm transition-all duration-500",
                  selectedDept === 'All' ? "scale-100" : "scale-0 group-hover:scale-100"
                )}>
                  All
                </span>
              </button>

              {DEPARTMENTS.map(dept => {
                const meta = DEPT_META[dept];
                const active = selectedDept === dept;
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    title={dept}
                    style={{ '--gradient-from': meta.gradientFrom, '--gradient-to': meta.gradientTo } as React.CSSProperties}
                    className={cn(
                      "relative h-[48px] shadow-lg rounded-full flex shrink-0 items-center justify-center transition-all duration-500 hover:shadow-none group cursor-pointer",
                      active ? "w-[160px] bg-transparent" : "w-[48px] bg-[#1a1f2e] hover:w-[160px]"
                    )}
                  >
                    {/* Gradient background on hover / active */}
                    <span className={cn(
                      "absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] transition-all duration-500",
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}></span>

                    {/* Blur glow */}
                    <span className={cn(
                      "absolute top-[8px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[12px] -z-10 transition-all duration-500",
                      active ? "opacity-40" : "opacity-0 group-hover:opacity-40"
                    )}></span>

                    {/* Icon */}
                    <span className={cn(
                      "relative z-10 transition-all duration-500 absolute flex items-center justify-center text-[20px]",
                      active ? "scale-0 opacity-0" : "scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0 text-[#94A3B8]"
                    )}>
                      {meta.icon}
                    </span>

                    {/* Title */}
                    <span className={cn(
                      "absolute text-white uppercase tracking-wide font-bold text-[11px] whitespace-nowrap px-4 transition-all duration-500",
                      active ? "scale-100" : "scale-0 group-hover:scale-100"
                    )}>
                      {dept}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Content ── */}
          {isFiltering ? (
            filtered.length === 0
              ? <EmptyState onClear={() => { setSearchTerm(''); setSelectedDept('All'); }} />
              : <>
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{filtered.length} results</span>
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
                </div>
                <EventGrid events={filtered} myRegEventIds={myRegEventIds} onJoinEvent={onJoinEvent} onLeaveEvent={onLeaveEvent} />
              </>
          ) : events.length === 0
            ? <EmptyState onClear={undefined} />
            : (
              <div className="space-y-16 pb-20">
                {deptGroups.map(({ dept, events: deptEvents }) => (
                  <DeptRow
                    key={dept}
                    dept={dept}
                    events={deptEvents}
                    myRegEventIds={myRegEventIds}
                    onJoinEvent={onJoinEvent}
                    onLeaveEvent={onLeaveEvent}
                  />
                ))}
              </div>
            )
          }
        </div>
      </section>
    </div>
  );
};

// ── Department Netflix Row ───────────────────────────────
const DeptRow: React.FC<{
  dept: Department;
  events: EventItem[];
  myRegEventIds: Set<number>;
  onJoinEvent: (id: number) => void;
  onLeaveEvent: (id: number) => void;
}> = ({ dept, events, myRegEventIds, onJoinEvent, onLeaveEvent }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const meta = DEPT_META[dept];

  const scroll = (dir: 'left' | 'right') =>
    rowRef.current?.scrollBy({ left: dir === 'right' ? 360 : -360, behavior: 'smooth' });

  return (
    <div>
      {/* Department header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Accent dot + icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl text-white shadow-lg"
            style={{ backgroundImage: `linear-gradient(45deg, ${meta.gradientFrom}, ${meta.gradientTo})` }}>
            {meta.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: '#F9FAFB' }}>
              {meta.label}
            </h2>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              {events.length} event{events.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {/* Scroll buttons */}
        <div className="flex items-center gap-2">
          {[{ dir: 'left', rotate: 'rotate(180deg)' }, { dir: 'right', rotate: 'none' }].map(({ dir, rotate }) => (
            <button key={dir} onClick={() => scroll(dir as 'left' | 'right')}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = meta.gradientFrom; e.currentTarget.style.color = meta.gradientFrom; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94A3B8'; }}>
              <ChevronRight size={14} style={{ transform: rotate }} />
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal row */}
      <div ref={rowRef} className="flex gap-6 overflow-x-auto pb-4"
        style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>
        {events.map(event => {
          const isJoined = myRegEventIds.has(event.id);
          const isFull = event.registered_count >= event.capacity;
          return (
            <div key={event.id} className="shrink-0" style={{ width: 'min(340px, 85vw)', scrollSnapAlign: 'start' }}>
              <EventCard
                imageUrl={event.image_url || `https://picsum.photos/seed/${event.id}/800/600`}
                category={event.category}
                title={event.title}
                location={event.location}
                description={event.description}
                date={formatEventDateTime(event.date, event.time)}
                isRegistered={isJoined}
                isSoldOut={isFull && !isJoined}
                onToggleRegistration={() => isJoined ? onLeaveEvent(event.id) : onJoinEvent(event.id)}
                className="h-[400px]"
                style={{ transition: 'transform 250ms ease-out' }}
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
  onJoinEvent: (id: number) => void;
  onLeaveEvent: (id: number) => void;
}> = ({ events, myRegEventIds, onJoinEvent, onLeaveEvent }) => (
  <div className="grid pb-16"
    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '24px' }}>
    {events.map(event => {
      const isJoined = myRegEventIds.has(event.id);
      const isFull = event.registered_count >= event.capacity;
      return (
        <EventCard
          key={event.id}
          imageUrl={event.image_url || `https://picsum.photos/seed/${event.id}/800/600`}
          category={event.category}
          title={event.title}
          location={event.location}
          description={event.description}
          date={formatEventDateTime(event.date, event.time)}
          isRegistered={isJoined}
          isSoldOut={isFull && !isJoined}
          onToggleRegistration={() => isJoined ? onLeaveEvent(event.id) : onJoinEvent(event.id)}
          className="h-[420px]"
        />
      );
    })}
  </div>
);

// ── Tickets Content ──────────────────────────────────────
const TicketsContent: React.FC<{
  displayedEvents: EventItem[];
  myRegEventIds: Set<number>;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedDept: 'All' | Department;
  setSelectedDept: (v: 'All' | Department) => void;
  onJoinEvent: (id: number) => void;
  onLeaveEvent: (id: number) => void;
  firstName: string;
}> = ({ displayedEvents, myRegEventIds, searchTerm, setSearchTerm, selectedDept, setSelectedDept, onJoinEvent, onLeaveEvent, firstName }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3B82F6' }}>✦ Your Collection</p>
      <h2 className="font-bold tracking-tight" style={{
        fontSize: 'clamp(32px, 4vw, 48px)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.45) 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>My Tickets</h2>
      <p style={{ color: '#94A3B8', fontSize: '15px' }}>
        {myRegEventIds.size > 0 ? `${myRegEventIds.size} upcoming event${myRegEventIds.size !== 1 ? 's' : ''}` : 'Your booked experiences will appear here.'}
      </p>
    </div>

    {/* Search */}
    <div className="group relative w-full sm:w-80">
      <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
      <input type="text" placeholder="Search your tickets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
        className="w-full rounded-2xl py-3 pl-10 pr-4 text-sm text-white outline-none transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
        onFocus={e => { e.currentTarget.style.border = '1px solid rgba(59,130,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
        onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
      />
    </div>

    {/* Dept filter */}
    <div className="flex items-center gap-3 overflow-x-auto rounded-2xl px-4 py-3"
      style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', scrollbarWidth: 'none' }}>
      <div className="flex shrink-0 items-center gap-2" style={{ color: '#94A3B8' }}>
        <SlidersHorizontal size={13} />
        <span className="text-xs font-medium whitespace-nowrap">Department</span>
      </div>
      <div className="h-4 w-px shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <button
        onClick={() => setSelectedDept('All')}
        style={{ '--gradient-from': '#3B82F6', '--gradient-to': '#6366F1' } as React.CSSProperties}
        className={cn(
          "relative h-[48px] shadow-lg rounded-full flex shrink-0 items-center justify-center transition-all duration-500 hover:shadow-none group cursor-pointer",
          selectedDept === 'All' ? "w-[120px] bg-transparent" : "w-[48px] bg-[#1a1f2e] hover:w-[120px]"
        )}
      >
        <span className={cn(
          "absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] transition-all duration-500",
          selectedDept === 'All' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}></span>
        <span className={cn(
          "absolute top-[8px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[12px] -z-10 transition-all duration-500",
          selectedDept === 'All' ? "opacity-40" : "opacity-0 group-hover:opacity-40"
        )}></span>
        <span className={cn(
          "relative z-10 transition-all duration-500 absolute font-bold",
          selectedDept === 'All' ? "scale-0 opacity-0" : "scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0 text-[#94A3B8]"
        )}>
          All
        </span>
        <span className={cn(
          "absolute text-white uppercase tracking-wide font-bold text-sm transition-all duration-500",
          selectedDept === 'All' ? "scale-100" : "scale-0 group-hover:scale-100"
        )}>
          All
        </span>
      </button>
      {DEPARTMENTS.map(dept => {
        const meta = DEPT_META[dept];
        const active = selectedDept === dept;
        return (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            title={dept}
            style={{ '--gradient-from': meta.gradientFrom, '--gradient-to': meta.gradientTo } as React.CSSProperties}
            className={cn(
              "relative h-[48px] shadow-lg rounded-full flex shrink-0 items-center justify-center transition-all duration-500 hover:shadow-none group cursor-pointer",
              active ? "w-[160px] bg-transparent" : "w-[48px] bg-[#1a1f2e] hover:w-[160px]"
            )}
          >
            <span className={cn(
              "absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] transition-all duration-500",
              active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}></span>
            <span className={cn(
              "absolute top-[8px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[12px] -z-10 transition-all duration-500",
              active ? "opacity-40" : "opacity-0 group-hover:opacity-40"
            )}></span>
            <span className={cn(
              "relative z-10 transition-all duration-500 absolute flex items-center justify-center text-[20px]",
              active ? "scale-0 opacity-0" : "scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0 text-[#94A3B8]"
            )}>
              {meta.icon}
            </span>
            <span className={cn(
              "absolute text-white uppercase tracking-wide font-bold text-[11px] whitespace-nowrap px-4 transition-all duration-500",
              active ? "scale-100" : "scale-0 group-hover:scale-100"
            )}>
              {dept}
            </span>
          </button>
        );
      })}
    </div>

    {displayedEvents.length === 0
      ? <EmptyState onClear={(searchTerm || selectedDept !== 'All') ? () => { setSearchTerm(''); setSelectedDept('All'); } : undefined} isTickets />
      : <EventGrid events={displayedEvents} myRegEventIds={myRegEventIds} onJoinEvent={onJoinEvent} onLeaveEvent={onLeaveEvent} />
    }
  </div>
);

// ── Empty State ──────────────────────────────────────────
const EmptyState: React.FC<{ onClear?: () => void; isTickets?: boolean }> = ({ onClear, isTickets }) => (
  <div className="flex flex-col items-center justify-center gap-6 rounded-3xl py-32 text-center"
    style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.8) 0%, rgba(11,15,25,0.4) 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div className="flex h-20 w-20 items-center justify-center rounded-3xl text-4xl"
      style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 32px rgba(59,130,246,0.12)' }}>
      {isTickets ? '🎫' : '🎓'}
    </div>
    <div className="space-y-2">
      <h3 className="text-2xl font-bold text-white">{isTickets ? 'No tickets yet' : 'No events found'}</h3>
      <p style={{ color: '#94A3B8', fontSize: '15px', maxWidth: '340px' }}>
        {isTickets ? "You haven't booked any events yet." : 'No events match your current filters.'}
      </p>
    </div>
    {onClear && (
      <button onClick={onClear} className="rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(59,130,246,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}>
        Clear filters
      </button>
    )}
  </div>
);

export default UserDashboard;
