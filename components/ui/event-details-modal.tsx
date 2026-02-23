import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarDays, Clock, MapPin, Users, Building, Tag, Ticket, ShieldCheck } from 'lucide-react';
import { EventItem } from '../../types';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { ConfirmModal } from './confirm-modal';

interface EventDetailsModalProps {
    event: EventItem;
    isOpen: boolean;
    onClose: () => void;
    isRegistered: boolean;
    onToggleRegistration: (teamName?: string) => void;
    isAdmin?: boolean;
}

export function EventDetailsModal({
    event,
    isOpen,
    onClose,
    isRegistered,
    onToggleRegistration,
    isAdmin
}: EventDetailsModalProps) {
    const [showConfirm, setShowConfirm] = React.useState(false);

    if (!isOpen) return null;

    const isSoldOut = event.registered_count >= event.capacity;

    const formatEventDateTime = (dateStr: string, timeStr: string) => {
        try {
            const d = new Date(dateStr);
            const formattedDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            const [h, m] = timeStr.split(':').map(Number);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hour12 = h % 12 || 12;
            const formattedTime = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
            return { date: formattedDate, time: formattedTime };
        } catch {
            return { date: dateStr, time: timeStr };
        }
    };

    const { date: formattedDate, time: formattedTime } = formatEventDateTime(event.date, event.time);

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className={cn(
                    "relative w-full h-full sm:h-[auto] sm:max-h-[90vh] sm:max-w-4xl bg-[#0B0F19] sm:rounded-3xl overflow-hidden flex flex-col",
                    "animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 zoom-in-95 duration-500 shadow-2xl border border-white/10"
                )}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all duration-300"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Hero Image Header */}
                <div className="relative w-full h-64 sm:h-80 shrink-0">
                    <img
                        src={event.image_url || `https://picsum.photos/seed/${event.id}/1200/600`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />

                    {/* Tags over image */}
                    <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium text-white shadow-sm flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" /> {event.category}
                        </span>
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium text-white shadow-sm flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5" /> Dept: {event.department}
                        </span>
                        {event.is_team_event && (
                            <span className="px-3 py-1 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-300 shadow-sm flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" /> Team Event (Max {event.max_team_size})
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Details */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">{event.title}</h2>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-white/70 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4 text-indigo-400" />
                                        {formattedDate}
                                    </div>
                                    <div className="hidden sm:block text-white/20">•</div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-indigo-400" />
                                        {formattedTime}
                                    </div>
                                    <div className="hidden sm:block text-white/20">•</div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-indigo-400" />
                                        {event.location}
                                    </div>
                                </div>
                            </div>

                            {/* Description / Rules */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                    About & Regulations
                                </h3>
                                <div className="prose prose-invert prose-indigo max-w-none text-white/70 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                                    {event.description}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Sidebar */}
                        <div className="space-y-6">
                            {/* Registration Card */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />

                                <h3 className="text-white font-semibold mb-4">Registration Status</h3>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white tracking-tight">
                                            {event.registered_count} <span className="text-sm font-normal text-white/50">/ {event.capacity}</span>
                                        </div>
                                        <div className="text-xs text-white/50">Spots Filled</div>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full h-1.5 bg-white/10 rounded-full mb-6 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000 ease-out",
                                            (event.registered_count / event.capacity) > 0.9 ? "bg-red-500" : "bg-indigo-500"
                                        )}
                                        style={{ width: `${Math.min(100, (event.registered_count / event.capacity) * 100)}%` }}
                                    />
                                </div>

                                {/* Action Button */}
                                {!isAdmin ? (
                                    <Button
                                        onClick={() => setShowConfirm(true)}
                                        disabled={isSoldOut && !isRegistered}
                                        className={cn(
                                            "w-full py-6 text-base font-semibold transition-all duration-300",
                                            isRegistered
                                                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                                : isSoldOut
                                                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                                                    : "bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                        )}
                                    >
                                        {isRegistered ? "Leave Event" : isSoldOut ? "Sold Out" : "Register Now"}
                                    </Button>
                                ) : (
                                    <div className="w-full py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm text-center font-medium">
                                        Admins cannot register. Manage from Dashboard.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <ConfirmModal
                    open={showConfirm}
                    type={isRegistered ? "leave" : "join"}
                    eventTitle={event.title}
                    isTeamEvent={event.is_team_event}
                    maxTeamSize={event.max_team_size}
                    onConfirm={(teamName) => {
                        setShowConfirm(false);
                        onToggleRegistration(teamName);
                    }}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </div>,
        document.body
    );
}
