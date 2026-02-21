import React, { useState, useEffect } from 'react';
import { EventItem, Registration, User } from '../types';
import {
    apiAdminGetEvents,
    apiAdminDeleteEvent,
    apiAdminGetRegistrations,
    apiAdminRemoveRegistration,
    apiAdminGetUsers
} from '../apiService';

interface AdminDashboardProps {
    currentUser: User;
    onEditEvent: (event: EventItem) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onEditEvent }) => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedEventRegs, setSelectedEventRegs] = useState<Registration[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventsData, usersData] = await Promise.all([
                apiAdminGetEvents(),
                apiAdminGetUsers(),
            ]);
            setEvents(eventsData);
            setUsers(usersData);
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
        <div className="container mx-auto max-w-7xl space-y-8 p-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h2>
                    <p className="mt-1 text-muted-foreground">Manage all events, registrations, and users.</p>
                </div>
            </div>

            {error && (
                <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-4 rounded-lg p-1 hover:bg-red-500/20">✕</button>
                </div>
            )}

            {/* Stats Row */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Events', value: events.length, color: 'text-blue-400' },
                    { label: 'Total Users', value: users.length, color: 'text-emerald-400' },
                    { label: 'Total Registrations', value: totalAttendees, color: 'text-amber-400' },
                    { label: 'Avg Capacity Fill', value: totalCapacity > 0 ? `${Math.round((totalAttendees / totalCapacity) * 100)}%` : '0%', color: 'text-indigo-400' },
                ].map(stat => (
                    <div key={stat.label} className="rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#161E2E] p-6 shadow-lg transition-all hover:-translate-y-1">
                        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground opacity-70">{stat.label}</div>
                        <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Events Table */}
            <div className="mb-8 overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#161E2E] shadow-lg">
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
                                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">{event.date}</td>
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

            {/* Registration Panel */}
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

            {/* Users Section */}
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
    );
};

export default AdminDashboard;
