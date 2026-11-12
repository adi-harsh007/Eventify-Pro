import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { Sparkles, Calendar, Music, Star, Ticket, CheckCircle2, Edit3, X } from 'lucide-react';
import { apiGetMegaEventStatus, apiJoinMegaEvent, apiGetMegaEventLineup, apiAdminUpdateMegaEventLineup } from '../apiService';
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
};

const colorForIcon = (name: string) => {
    switch (name) {
        case 'Music': return 'text-rose-300';
        case 'Star': return 'text-cyan-300';
        default: return 'text-amber-300';
    }
};

const MegaEventPage: React.FC<MegaEventPageProps> = ({ user }) => {
    const [hasTicket, setHasTicket] = useState(false);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [schedule, setSchedule] = useState<LineupItem[]>([]);
    const [editingItem, setEditingItem] = useState<LineupItem | null>(null);
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
        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;
        let hr = parseInt(parts[0], 10);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        hr = hr % 12 || 12;
        return `${hr}:${parts[1]} ${ampm}`;
    };

    const validItems = schedule.filter(item => item.event_date);
    const isMegaEventCompleted = validItems.length > 0 && validItems.every(item => {
        const dateStr = item.event_date!.split('T')[0];
        const timeStr = item.event_time || '23:59:59';
        const itemDate = new Date(`${dateStr}T${timeStr}`);
        return itemDate.getTime() < Date.now();
    });

    return (
        <div className="relative min-h-[calc(100vh-64px)] w-full overflow-y-auto bg-[#07090F]">
            {/* Atmospheric Festival Glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse 65% 55% at 50% 15%, rgba(244,63,94,0.14) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 80% 45%, rgba(139,92,246,0.14) 0%, transparent 65%)',
                }}
            />

            <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 flex flex-col items-center">
                {/* Title Section (GPU animated, zero canvas overhead) */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-4 mb-12 w-full flex flex-col items-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-rose-200 uppercase">
                        <Sparkles size={14} className="text-amber-300" />
                        3-Day Signature Festival
                    </div>

                    <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-rose-400 to-violet-400 bg-clip-text text-transparent">
                        The Mega Fest
                    </h1>

                    <p className="max-w-xl mx-auto text-base sm:text-lg text-slate-300/80">
                        Three nights of live stage performances, DJ sets, and celebration. Claim your All-Access VIP pass in one click.
                    </p>
                </motion.div>

                {/* VIP Pass Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, delay: 0.1 }}
                    className="w-full max-w-md p-[1px] rounded-3xl mb-16"
                    style={{ background: 'linear-gradient(135deg, rgba(251,113,133,0.6) 0%, rgba(251,191,36,0.35) 50%, rgba(139,92,246,0.5) 100%)' }}
                >
                    <div className="bg-[#0E1424] rounded-[23px] p-8 flex flex-col items-center text-center">
                        {loading ? (
                            <div className="w-8 h-8 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
                        ) : isMegaEventCompleted ? (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                    <CheckCircle2 className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="font-display text-2xl font-bold text-white">Mega Fest Completed</h3>
                                <p className="text-sm text-slate-400">Thanks for celebrating with us!</p>
                            </div>
                        ) : hasTicket ? (
                            <div className="flex flex-col items-center space-y-4 w-full">
                                <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center border border-emerald-400/30">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-300" />
                                </div>
                                <h3 className="font-display text-2xl font-bold text-white">VIP Pass Secured</h3>
                                <p className="text-sm text-emerald-300/90">You have All-Access entry for all 3 days.</p>

                                <div className="mt-4 w-full rounded-2xl border border-dashed border-white/15 p-5 relative overflow-hidden bg-white/[0.03]">
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0E1424] rounded-full border-r border-white/15" />
                                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0E1424] rounded-full border-l border-white/15" />
                                    <p className="text-[10px] font-mono-num uppercase tracking-[0.3em] text-amber-300 mb-1">Admit One · VIP</p>
                                    <p className="text-lg font-mono-num font-bold text-white">{user.name}</p>
                                    <p className="text-xs text-slate-400 mt-1">3-Day Mega Fest Pass</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-6 w-full">
                                <div className="w-16 h-16 bg-rose-500/15 rounded-full flex items-center justify-center border border-rose-400/30">
                                    <Ticket className="w-8 h-8 text-rose-300" />
                                </div>
                                <div>
                                    <h3 className="font-display text-2xl font-bold text-white mb-1">All-Access Pass</h3>
                                    <p className="text-sm text-slate-400">Grants entry to Cultural, DJ, and Star Night.</p>
                                </div>

                                <button
                                    onClick={handleCollectTicket}
                                    disabled={processing}
                                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-500 px-6 py-4 font-bold text-white shadow-lg shadow-rose-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                                >
                                    {processing ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    ) : (
                                        <>Claim VIP Pass <Ticket size={18} /></>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Schedule Grid */}
                <div className="w-full max-w-4xl">
                    <div className="flex items-center justify-center mb-8 border-b border-white/[0.07] pb-4">
                        <h3 className="font-display text-2xl font-bold text-white text-center">3-Day Lineup</h3>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map(n => <div key={n} className="h-52 rounded-3xl skeleton-shimmer border border-white/10" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {schedule.map((item, idx) => (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    onClick={() => (user.isAdmin ? handleEditClick(item) : undefined)}
                                    disabled={!user.isAdmin}
                                    className={`group relative rounded-3xl p-6 transition-transform duration-300 text-left w-full h-full block border border-white/10 bg-[#0E1424]/90 ${
                                        user.isAdmin ? 'cursor-pointer hover:-translate-y-1 hover:border-amber-400/40' : 'cursor-default'
                                    }`}
                                >
                                    {user.isAdmin && (
                                        <div className="absolute top-4 right-4 text-white/25 group-hover:text-amber-300 transition-colors">
                                            <Edit3 size={16} />
                                        </div>
                                    )}
                                    <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/[0.06] border border-white/10 mb-1">
                                            {getIconFromName(item.icon_name, `w-6 h-6 ${colorForIcon(item.icon_name)}`)}
                                        </div>
                                        <p className="text-xs font-mono-num font-bold uppercase tracking-widest text-amber-300">
                                            {item.day_label}
                                        </p>
                                        <h4 className="font-display text-xl font-bold text-white">{item.title}</h4>

                                        {(item.event_date || item.event_time) && (
                                            <div className="text-xs font-mono-num font-semibold text-cyan-200 bg-cyan-500/10 border border-cyan-400/20 px-3 py-1 rounded-full">
                                                {formatDate(item.event_date)} {item.event_time && `· ${formatTime(item.event_time)}`}
                                            </div>
                                        )}

                                        <p className="text-sm text-slate-400 leading-relaxed mt-1">{item.description}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-md bg-black/75">
                    <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0E1424] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-display text-xl font-bold text-white">Edit Schedule Item</h3>
                            <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Day Label</label>
                                <input type="text" name="day_label" value={editForm.day_label || ''} onChange={handleFormChange}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Title</label>
                                <input type="text" name="title" value={editForm.title || ''} onChange={handleFormChange}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Date</label>
                                    <DatePicker value={editForm.event_date || ''} onChange={(date) => setEditForm(prev => ({ ...prev, event_date: date }))} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Time</label>
                                    <TimePicker value={editForm.event_time || ''} onChange={(time) => setEditForm(prev => ({ ...prev, event_time: time }))} />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Icon</label>
                                <select name="icon_name" value={editForm.icon_name || 'Calendar'} onChange={handleFormChange}
                                    className="w-full rounded-xl border border-white/10 bg-[#151D33] px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50">
                                    <option value="Calendar">Calendar</option>
                                    <option value="Music">Music</option>
                                    <option value="Star">Star / Celebrity</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                                <textarea name="description" value={editForm.description || ''} onChange={handleFormChange} rows={3}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50 resize-none" />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setEditingItem(null)}
                                className="w-1/3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={handleSaveEdit}
                                className="w-2/3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-3 text-sm font-bold text-white hover:opacity-95 cursor-pointer">
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
