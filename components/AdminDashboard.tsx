import React, { useState, useEffect } from 'react';
import { EventItem, Registration, User, FeedbackItem } from '../types';
import BentoItem from './ui/scrapbook-bento-grid';
import {
    apiAdminGetEvents,
    apiAdminDeleteEvent,
    apiAdminGetRegistrations,
    apiAdminRemoveRegistration,
    apiAdminGetUsers,
    apiAdminGetTodos,
    apiAdminCreateTodo,
    apiAdminUpdateTodo,
    apiAdminDeleteTodo,
    apiAdminGetFeedback,
    apiAdminDeleteFeedback
} from '../apiService';
import MegaEventPage from './MegaEventPage';

interface AdminDashboardProps {
    currentUser: User;
    onEditEvent: (event: EventItem) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onEditEvent }) => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
    const [todos, setTodos] = useState<{ id: number, text: string, completed: boolean }[]>([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [selectedEventRegs, setSelectedEventRegs] = useState<Registration[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // View Management State
    const [activeView, setActiveView] = useState<'dashboard' | 'events' | 'users' | 'mega_event' | 'todos' | 'feedback'>(() => {
        const saved = localStorage.getItem('adminActiveView');
        return saved ? (saved as 'dashboard' | 'events' | 'users' | 'mega_event' | 'todos' | 'feedback') : 'dashboard';
    });

    // Persist active view state on change
    useEffect(() => {
        localStorage.setItem('adminActiveView', activeView);
    }, [activeView]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventsData, usersData, todosData, feedbackData] = await Promise.all([
                apiAdminGetEvents(),
                apiAdminGetUsers(),
                apiAdminGetTodos(),
                apiAdminGetFeedback()
            ]);
            setEvents(eventsData);
            setUsers(usersData);
            setTodos(todosData);
            setFeedbackList(feedbackData);
        } catch (err: any) {
            setError(err.message || 'Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await apiAdminDeleteEvent(id);
            setEvents(events.filter(e => e.id !== id));
            if (selectedEventId === id) {
                setSelectedEventId(null);
                setSelectedEventRegs([]);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleViewRegistrations = async (eventId: number) => {
        try {
            setSelectedEventId(eventId);
            const regs = await apiAdminGetRegistrations(eventId);
            setSelectedEventRegs(regs);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleRemoveRegistration = async (regId: number) => {
        try {
            await apiAdminRemoveRegistration(regId);
            setSelectedEventRegs(selectedEventRegs.filter(r => r.id !== regId));
            // Update event count locally
            setEvents(events.map(e =>
                e.id === selectedEventId ? { ...e, registered_count: Math.max(0, e.registered_count - 1) } : e
            ));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoText.trim()) return;
        try {
            const newTodo = await apiAdminCreateTodo(newTodoText);
            setTodos([...todos, newTodo]);
            setNewTodoText('');
        } catch (err: any) {
            setError(err.message || 'Failed to add to-do');
        }
    };

    const handleToggleTodo = async (id: number, currentStatus: boolean) => {
        try {
            await apiAdminUpdateTodo(id, !currentStatus);
            setTodos(todos.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
        } catch (err: any) {
            setError(err.message || 'Failed to update to-do');
        }
    };

    const handleDeleteTodo = async (id: number) => {
        try {
            await apiAdminDeleteTodo(id);
            setTodos(todos.filter(t => t.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to delete to-do');
        }
    };

    const handleDeleteFeedback = async (id: number) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return;
        try {
            await apiAdminDeleteFeedback(id);
            setFeedbackList(feedbackList.filter(f => f.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to delete feedback');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{
                    width: '48px', height: '48px', border: '4px solid rgba(99, 102, 241, 0.2)',
                    borderTopColor: '#6366f1', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
            </div>
        );
    }

    const totalAttendees = events.reduce((sum, e) => sum + e.registered_count, 0);
    const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);

    return (
        <div className="container mx-auto max-w-7xl space-y-8 p-6 animate-in fade-in duration-500 scrapbook-scope">

            {/* Header Area */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white mb-2">Bits & Pieces</h2>
                    <p className="text-muted-foreground">Manage your event operations through the scrapbook grid.</p>
                </div>
                {/* Global Back Button if not on dashboard */}
                {activeView !== 'dashboard' && (
                    <button
                        onClick={() => {
                            setActiveView('dashboard');
                            setSelectedEventId(null);
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-x-1 hover:bg-white/10"
                    >
                        ← Back to Board
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-4 rounded-lg p-1 hover:bg-red-500/20">✕</button>
                </div>
            )}

            {/* DASHBOARD VIEW */}
            {activeView === 'dashboard' && (
                <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[220px]">

                    {/* Main Operations Stats - Item 1 */}
                    <BentoItem className="md:col-span-2 lg:col-span-2 scrapbook-item" rotation="-1.5deg">
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">Platform Activity</h2>
                                <p className="text-gray-400">Your core metrics across all university events.</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-auto">
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-semibold">Events</div>
                                    <div className="text-4xl lg:text-5xl font-black text-amber-400">{events.length}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-semibold">Users</div>
                                    <div className="text-4xl lg:text-5xl font-black text-emerald-400">{users.length}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-semibold">Registrations</div>
                                    <div className="text-4xl lg:text-5xl font-black text-blue-400">{totalAttendees}</div>
                                </div>
                            </div>
                        </div>
                    </BentoItem>

                    {/* Capacity Health - Item 2 */}
                    <BentoItem rotation="2.5deg" className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
                        <div className="flex flex-col h-full items-center justify-center text-center">
                            <div className="text-6xl font-black text-indigo-400 my-2 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                {totalCapacity > 0 ? `${Math.round((totalAttendees / totalCapacity) * 100)}%` : '0%'}
                            </div>
                            <h2 className="text-xl font-bold text-white mt-2">Capacity Health</h2>
                            <p className="text-sm text-indigo-200/60 mt-1">Average fill rate</p>
                        </div>
                    </BentoItem>

                    {/* To-Do / Reminders - Item 3 */}
                    <div className="cursor-pointer h-full" onClick={() => setActiveView('todos')}>
                        <BentoItem rotation="-2deg" className="border-emerald-500/20 bg-gradient-to-tr from-[#161E2E] to-emerald-900/10 hover:border-emerald-500/60 h-full flex flex-col items-center justify-center group">
                            <div className="text-center p-4">
                                <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform">📝</span>
                                <h3 className="text-xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">Manage To-Dos →</h3>
                                <p className="text-xs text-muted-foreground mt-2">You have {todos.filter(t => !t.completed).length} pending tasks.</p>
                            </div>
                        </BentoItem>
                    </div>

                    {/* Add New Interactive Link Cards replacing direct tables */}
                    <div className="md:col-span-2 lg:col-span-2 cursor-pointer h-full" onClick={() => setActiveView('events')}>
                        <BentoItem rotation="1deg" className="border-amber-500/30 bg-gradient-to-tr from-[#161E2E] to-amber-900/10 hover:border-amber-500/60 h-full flex items-center justify-center group">
                            <div className="text-center p-4">
                                <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">Manage All Events →</h3>
                                <p className="text-sm text-muted-foreground mt-2">View, edit, or delete the {events.length} active events on campus.</p>
                            </div>
                        </BentoItem>
                    </div>

                    <div className="md:col-span-2 lg:col-span-1 cursor-pointer h-full" onClick={() => setActiveView('users')}>
                        <BentoItem rotation="-1deg" className="border-blue-500/30 bg-gradient-to-tr from-[#161E2E] to-blue-900/10 hover:border-blue-500/60 h-full flex items-center justify-center group">
                            <div className="text-center p-4">
                                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">Manage Users →</h3>
                                <p className="text-sm text-muted-foreground mt-2">Review current student registry and accounts ({users.length} total).</p>
                            </div>
                        </BentoItem>
                    </div>

                    <div className="md:col-span-2 lg:col-span-1 cursor-pointer h-full" onClick={() => setActiveView('feedback')}>
                        <BentoItem rotation="0.5deg" className="border-pink-500/30 bg-gradient-to-tr from-[#161E2E] to-pink-900/10 hover:border-pink-500/60 h-full flex items-center justify-center group">
                            <div className="text-center p-4">
                                <h3 className="text-2xl font-bold text-white group-hover:text-pink-400 transition-colors">Event Feedback →</h3>
                                <p className="text-sm text-muted-foreground mt-2">Review what attendees are saying ({feedbackList.length} reviews).</p>
                            </div>
                        </BentoItem>
                    </div>

                    <div className="md:col-span-2 lg:col-span-2 cursor-pointer h-full" onClick={() => setActiveView('mega_event')}>
                        <BentoItem rotation="1.5deg" className="border-violet-500/30 bg-gradient-to-tr from-[#161E2E] to-violet-900/10 hover:border-violet-500/60 h-full flex items-center justify-center group">
                            <div className="text-center p-4">
                                <h3 className="text-2xl font-bold text-white group-hover:text-violet-400 transition-colors">Mega Event →</h3>
                                <p className="text-sm text-muted-foreground mt-2">Update the schedule and lineup.</p>
                            </div>
                        </BentoItem>
                    </div>
                </div>
            )}

            {/* EVENTS VIEW */}
            {activeView === 'events' && (
                <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                    {/* Events Table directly from previous code */}
                    <div className="overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#161E2E] shadow-lg">
                        <div className="border-b border-[rgba(255,255,255,0.08)] px-6 py-4">
                            <h3 className="text-lg font-semibold text-white">All Events ({events.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-[rgba(255,255,255,0.08)] bg-black/20 text-xs uppercase tracking-wider text-muted-foreground">
                                        {['Title', 'Category', 'Date', 'Registered', 'Creator', 'Actions'].map(h => (
                                            <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map(event => (
                                        <tr key={event.id} className="border-b border-[rgba(255,255,255,0.04)] transition-colors hover:bg-white/5">
                                            <td className="max-w-[200px] truncate px-6 py-4 font-medium text-white">{event.title}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                    {event.category}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{event.registered_count}/{event.capacity}</td>
                                            <td className="max-w-[150px] truncate px-6 py-4 text-muted-foreground">{event.creator_email || '—'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleViewRegistrations(event.id)} className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition-all duration-300 hover:scale-105 hover:bg-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]">Attendees</button>
                                                    <button onClick={() => onEditEvent(event)} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition-all duration-300 hover:scale-105 hover:bg-amber-500/20 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]">Edit</button>
                                                    <button onClick={() => handleDelete(event.id)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-all duration-300 hover:scale-105 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {events.length === 0 && (
                                        <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#a1a1aa' }}>No events yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Registration Panel within Events View */}
                    {selectedEventId && (
                        <div style={{ backgroundColor: '#161E2E', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '32px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>
                                    Attendees — {events.find(e => e.id === selectedEventId)?.title || 'Event'}
                                </h3>
                                <button onClick={() => { setSelectedEventId(null); setSelectedEventRegs([]); }}
                                    style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                            </div>
                            <div style={{ padding: '16px' }}>
                                {selectedEventRegs.length === 0 ? (
                                    <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '24px' }}>No registrations yet.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {selectedEventRegs.map(reg => (
                                            <div key={reg.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">{reg.name || 'Unknown'}</div>
                                                    <div className="text-xs text-muted-foreground">{reg.email || '—'}</div>
                                                </div>
                                                <button onClick={() => handleRemoveRegistration(reg.id)}
                                                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 transition-all duration-300 hover:scale-105 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* USERS VIEW */}
            {activeView === 'users' && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#161E2E] shadow-lg">
                        <div className="border-b border-[rgba(255,255,255,0.08)] px-6 py-4">
                            <h3 className="text-lg font-semibold text-white">All Users ({users.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-[rgba(255,255,255,0.08)] bg-black/20 text-xs uppercase tracking-wider text-muted-foreground">
                                        {['Name', 'Email', 'Joined'].map(h => (
                                            <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-[rgba(255,255,255,0.04)] transition-colors hover:bg-white/5">
                                            <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TODOS VIEW */}
            {activeView === 'todos' && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-hidden rounded-[20px] border border-emerald-500/20 bg-[#161E2E] shadow-[0_0_30px_rgba(16,185,129,0.05)] max-w-2xl mx-auto flex flex-col h-[600px]">
                        <div className="border-b border-emerald-500/10 px-8 py-6 bg-emerald-500/5">
                            <h3 className="text-2xl font-bold text-emerald-400 flex items-center gap-3">
                                <span className="text-3xl">📝</span> Admin To-Do List
                            </h3>
                            <p className="text-sm text-emerald-100/60 mt-2">
                                Keep track of pending tasks, requests, and operational duties.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar space-y-3">
                            {todos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <span className="text-2xl text-emerald-400">✓</span>
                                    </div>
                                    <p className="text-emerald-100/50">You're all caught up! No pending tasks.</p>
                                </div>
                            ) : (
                                todos.map(todo => (
                                    <div key={todo.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all group ${todo.completed ? 'bg-black/20 border-white/5 opacity-60 hover:opacity-100' : 'bg-white/5 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5'}`}>
                                        <button
                                            onClick={() => handleToggleTodo(todo.id, todo.completed)}
                                            className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${todo.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'border-gray-500 hover:border-emerald-400'}`}
                                        >
                                            {todo.completed && <span className="text-sm font-bold">✓</span>}
                                        </button>
                                        <span className={`text-base flex-1 break-words transition-all pt-0.5 ${todo.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                            {todo.text}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteTodo(todo.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-colors p-1 shrink-0 rounded-md hover:bg-red-500/10"
                                            title="Delete Task"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleAddTodo} className="p-6 border-t border-white/5 bg-black/20 mt-auto">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={newTodoText}
                                    onChange={(e) => setNewTodoText(e.target.value)}
                                    placeholder="Add a new task..."
                                    style={{
                                        colorScheme: 'dark'
                                    }}
                                    className="flex-1 rounded-xl border-none bg-white/5 px-5 py-4 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!newTodoText.trim()}
                                    className="rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:hover:bg-emerald-600 flex items-center gap-2"
                                >
                                    <span>Add</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MEGA EVENT VIEW */}
            {activeView === 'mega_event' && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#0B0F19] shadow-lg relative min-h-[600px] border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                        <div className="absolute top-0 w-full z-20 pointer-events-none bg-gradient-to-b from-[#0B0F19] to-transparent h-4" />
                        <div className="relative z-10 -m-8 scale-[0.98]">
                            <MegaEventPage user={currentUser} />
                        </div>
                    </div>
                </div>
            )}
            {/* FEEDBACK VIEW */}
            {activeView === 'feedback' && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#161E2E] shadow-lg">
                        <div className="border-b border-[rgba(255,255,255,0.08)] px-6 py-4">
                            <h3 className="text-lg font-semibold text-white">Event Feedback ({feedbackList.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-[rgba(255,255,255,0.08)] bg-black/20 text-xs uppercase tracking-wider text-muted-foreground">
                                        {['User', 'Event', 'Rating', 'Comment', 'Date', 'Actions'].map(h => (
                                            <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedbackList.map(f => (
                                        <tr key={f.id} className="border-b border-[rgba(255,255,255,0.04)] transition-colors hover:bg-white/5">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{f.user_name}</div>
                                                <div className="text-xs text-muted-foreground">{f.user_email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium max-w-[200px] truncate">{f.event_title}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1 text-amber-400">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <svg key={star} className={`w-4 h-4 ${star <= f.rating ? 'fill-current' : 'text-zinc-600'}`} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground max-w-[300px] truncate" title={f.comment}>{f.comment}</td>
                                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{new Date(f.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => handleDeleteFeedback(f.id)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-all duration-300 hover:scale-105 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {feedbackList.length === 0 && (
                                        <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#a1a1aa' }}>No feedback available.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
