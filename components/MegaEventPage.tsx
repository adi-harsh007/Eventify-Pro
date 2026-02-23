import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Sparkles, Calendar, Music, Star, Ticket, CheckCircle2, Edit3, X } from 'lucide-react';
import { apiGetMegaEventStatus, apiJoinMegaEvent, apiGetMegaEventLineup, apiAdminUpdateMegaEventLineup } from '../apiService';
import { ParticleTextEffect } from './ui/particle-text-effect';
import { DatePicker } from './ui/DatePicker';
import { TimePicker } from './ui/TimePicker';

interface MegaEventPageProps {
    user: User;
}

export interface LineupItem {
    id: number;
    day_label: string;
    title: string;
    description: string;
    event_date: string | null;
    event_time: string | null;
    icon_name: 'Calendar' | 'Music' | 'Star';
}

const getIconFromName = (name: string, className: string) => {
    switch (name) {
        case 'Music': return <Music className={className} />;
        case 'Star': return <Star className={className} />;
        default: return <Calendar className={className} />;
    }
}

const colorForIcon = (name: string) => {
    switch (name) {
        case 'Music': return 'text-fuchsia-400';
        case 'Star': return 'text-blue-400';
        default: return 'text-amber-400';
    }
}

const MegaEventPage: React.FC<MegaEventPageProps> = ({ user }) => {
    const [hasTicket, setHasTicket] = useState(false);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [schedule, setSchedule] = useState<LineupItem[]>([]);
    const [editingItem, setEditingItem] = useState<LineupItem | null>(null);

    // Edit Form State
    const [editForm, setEditForm] = useState<Partial<LineupItem>>({});

    const fetchData = async () => {
        try {
            const [statusData, lineupData] = await Promise.all([
                apiGetMegaEventStatus(),
                apiGetMegaEventLineup()
            ]);
            setHasTicket(statusData.hasTicket);
            setSchedule(lineupData);
        } catch (err) {
            console.error("Failed to fetch mega event data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCollectTicket = async () => {
        setProcessing(true);
        try {
            await apiJoinMegaEvent();
            setHasTicket(true);
        } catch (err: any) {
            alert(err.message || 'Failed to collect ticket.');
        } finally {
            setProcessing(false);
        }
    };

    const handleEditClick = (item: LineupItem) => {
        setEditingItem(item);
        setEditForm({
            day_label: item.day_label,
            title: item.title,
            description: item.description,
            event_date: item.event_date ? item.event_date.split('T')[0] : '',
            event_time: item.event_time ? item.event_time.slice(0, 5) : '',
            icon_name: item.icon_name
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;
        try {
            await apiAdminUpdateMegaEventLineup(editingItem.id, editForm as Record<string, unknown>);
            // Update local state to avoid refresh
            setSchedule(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...editForm as LineupItem } : item));
            setEditingItem(null);
        } catch (err: any) {
            alert(err.message || "Failed to update lineup");
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return '';
        // Assuming 'HH:MM:SS'
        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;
        let hr = parseInt(parts[0], 10);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        hr = hr % 12 || 12;
        return `${hr}:${parts[1]} ${ampm}`;
    };

    return (
        <div className="relative min-h-[calc(100vh-64px)] w-full overflow-y-auto" style={{ backgroundColor: '#0B0F19' }}>
            {/* Background Glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0 fixed top-0 left-0" style={{
                background: 'radial-gradient(ellipse 60% 70% at 50% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)',
            }} />

            <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 flex flex-col items-center">

                {/* Title Section */}
                <div className="text-center space-y-4 mb-16 w-full flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest text-violet-300 uppercase"
                        style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <Sparkles size={14} className="text-violet-400" />
                        Signature Event
                    </div>

                    <div className="w-full h-[120px] max-w-[800px] mt-2 mb-2">
                        <ParticleTextEffect text="The Mega Fest" fontSize={80} color="#FFFFFF" glowColor="#8B5CF6" />
                    </div>

                    <p className="max-w-xl mx-auto text-lg" style={{ color: '#94A3B8' }}>
                        Three days of unforgettable experiences, music, and celebration. Secure your VIP All-Access pass now.
                    </p>
                </div>

                {/* Action Card */}
                <div className="w-full max-w-md p-1 rounded-3xl mb-20"
                    style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(59, 130, 246, 0.2) 100%)' }}>
                    <div className="bg-[#0f1423] rounded-[22px] p-8 flex flex-col items-center text-center">

                        {loading ? (
                            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"></div>
                        ) : hasTicket ? (
                            <div className="flex flex-col items-center space-y-4 animate-in zoom-in duration-500">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Pass Secured!</h3>
                                <p className="text-sm text-emerald-400/80">You have an All-Access VIP Pass.</p>

                                {/* Ticket Visual */}
                                <div className="mt-4 w-full rounded-xl border border-white/10 p-4 border-dashed relative overflow-hidden"
                                    style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)' }}>
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0f1423] rounded-full border-r border-white/10 border-dashed"></div>
                                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0f1423] rounded-full border-l border-white/10 border-dashed"></div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-1">Admit One</p>
                                    <p className="text-lg font-mono font-bold text-violet-300">{user.name}</p>
                                    <p className="text-sm text-white/50 mt-1">3-Day Mega Event</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-6 w-full">
                                <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center border border-violet-500/20">
                                    <Ticket className="w-8 h-8 text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">All-Access Pass</h3>
                                    <p className="text-sm text-white/50">Grants entry to all 3 days.</p>
                                </div>

                                <button
                                    onClick={handleCollectTicket}
                                    disabled={processing}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
                                    style={{
                                        background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                                        boxShadow: '0 10px 30px -10px rgba(139, 92, 246, 0.5)'
                                    }}>
                                    {processing ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                    ) : (
                                        <>Get Pass <Ticket size={18} /></>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Schedule Grid */}
                <div className="w-full max-w-4xl">
                    <div className="flex items-center justify-center mb-8 border-b border-white/5 pb-4 relative">
                        <h3 className="text-xl font-bold text-white text-center">Event Lineup</h3>
                    </div>
                    {loading ? (
                        <div className="flex justify-center p-8"><div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin"></div></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {schedule.map((item) => (
                                <button key={item.id}
                                    onClick={() => user.isAdmin ? handleEditClick(item) : undefined}
                                    disabled={!user.isAdmin}
                                    className={`group relative rounded-2xl p-6 transition-all text-left w-full h-full block ${user.isAdmin ? 'cursor-pointer hover:-translate-y-1 ring-0 hover:ring-2 hover:ring-violet-500/50 outline-none' : 'cursor-default'}`}
                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {user.isAdmin && (
                                        <div className="absolute top-4 right-4 text-white/20 group-hover:text-violet-400 transition-colors">
                                            <Edit3 size={16} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none"></div>
                                    <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            {getIconFromName(item.icon_name, `w-6 h-6 ${colorForIcon(item.icon_name)}`)}
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">{item.day_label}</p>
                                        <h4 className="text-lg font-bold text-white">{item.title}</h4>

                                        {(item.event_date || item.event_time) && (
                                            <div className="text-xs font-semibold text-violet-300/80 bg-violet-500/10 px-3 py-1 rounded-md">
                                                {formatDate(item.event_date)} {item.event_time && `• ${formatTime(item.event_time)}`}
                                            </div>
                                        )}

                                        <p className="text-sm text-white/50 leading-relaxed mt-2">{item.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Editing Modal for Admin */}
            {editingItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-md"
                    style={{ backgroundColor: 'rgba(2, 8, 23, 0.8)' }}>
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1423] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Edit Schedule Item</h3>
                            <button onClick={() => setEditingItem(null)} className="text-white/40 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Day Label / Subtitle</label>
                                <input type="text" name="day_label" value={editForm.day_label || ''} onChange={handleFormChange}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/10" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Title</label>
                                <input type="text" name="title" value={editForm.title || ''} onChange={handleFormChange}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/10" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Date</label>
                                    <DatePicker
                                        value={editForm.event_date || ''}
                                        onChange={(date) => setEditForm(prev => ({ ...prev, event_date: date }))}
                                        className="[&>button]:border-white/10 [&>button]:bg-white/5 [&>button]:text-white hover:[&>button]:border-white/20 hover:[&>button]:bg-white/10 focus:[&>button]:border-violet-500/50 focus:[&>button]:ring-4 focus:[&>button]:ring-violet-500/10"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Time</label>
                                    <TimePicker
                                        value={editForm.event_time || ''}
                                        onChange={(time) => setEditForm(prev => ({ ...prev, event_time: time }))}
                                        className="[&>button]:border-white/10 [&>button]:bg-white/5 [&>button]:text-white hover:[&>button]:border-white/20 hover:[&>button]:bg-white/10 focus:[&>button]:border-violet-500/50 focus:[&>button]:ring-4 focus:[&>button]:ring-violet-500/10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Icon</label>
                                <select name="icon_name" value={editForm.icon_name || 'Calendar'} onChange={handleFormChange}
                                    className="w-full rounded-xl border border-white/10 bg-[#1e2436] px-4 py-3 text-sm text-white outline-none transition-all focus:border-violet-500/50">
                                    <option value="Calendar">Calendar</option>
                                    <option value="Music">Music</option>
                                    <option value="Star">Star / Celebrity</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Description</label>
                                <textarea name="description" value={editForm.description || ''} onChange={handleFormChange} rows={3}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/10 resize-none" />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setEditingItem(null)}
                                className="w-1/3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white">
                                Cancel
                            </button>
                            <button onClick={handleSaveEdit}
                                className="w-2/3 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-violet-500 active:scale-[0.98]">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MegaEventPage;
