import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarDays, Clock, MapPin, Users, Building, Tag, ShieldCheck, MessageSquare, Star, Send } from 'lucide-react';
import { EventItem } from '../../types';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { ConfirmModal } from './confirm-modal';
import { apiGetEventFeedback, apiSubmitEventFeedback } from '../../apiService';

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

    // Event Feedbacks State & Hooks
    const [feedbacks, setFeedbacks] = React.useState<any[]>([]);
    const [isLoadingFeedbacks, setIsLoadingFeedbacks] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [rating, setRating] = React.useState(5);
    const [comment, setComment] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');

    const currentUser = React.useMemo(() => {
        try {
            const str = localStorage.getItem('user');
            return str ? JSON.parse(str) : null;
        } catch {
            return null;
        }
    }, [isOpen]);

    React.useEffect(() => {
        if (isOpen && event?.id) {
            setFeedbacks([]);
            setIsLoadingFeedbacks(true);
            setSuccessMessage('');
            setErrorMessage('');
            setRating(5);
            setComment('');
            
            apiGetEventFeedback(event.id)
                .then((data) => {
                    if (data?.feedbacks) {
                        setFeedbacks(data.feedbacks);
                    }
                })
                .catch((err) => {
                    console.error("Failed to load event feedbacks:", err);
                })
                .finally(() => {
                    setIsLoadingFeedbacks(false);
                });
        }
    }, [isOpen, event?.id]);

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim() || submitting || !event?.id) return;

        setSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const res = await apiSubmitEventFeedback(event.id, { rating, comment });
            if (res?.feedback) {
                setFeedbacks((prev) => [res.feedback, ...prev]);
                setSuccessMessage('Thank you! Your feedback has been posted successfully.');
                setComment('');
            } else {
                setErrorMessage(res?.message || 'Failed to submit feedback.');
            }
        } catch (err: any) {
            console.error("Feedback submit error:", err);
            setErrorMessage(err?.message || 'Failed to submit feedback.');
        } finally {
            setSubmitting(false);
        }
    };

    const hasAlreadyReviewed = React.useMemo(() => {
        return feedbacks.some(f => f.user_name === currentUser?.name);
    }, [feedbacks, currentUser]);

    const averageRating = React.useMemo(() => {
        return feedbacks.length > 0 
            ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
            : null;
    }, [feedbacks]);

    const hasEventEnded = React.useMemo(() => {
        if (!event?.date) return false;
        try {
            const eventDateTime = new Date(`${event.date}T${event.time}`);
            return eventDateTime <= new Date();
        } catch {
            return false;
        }
    }, [event?.date, event?.time]);

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
                        {!!event.is_team_event && (
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

                            {/* Attendee Feedback & Reviews */}
                            {hasEventEnded && (
                                <div className="space-y-6 pt-6 border-t border-white/10">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-indigo-400" />
                                            Attendee Reviews
                                        </h3>
                                        {averageRating && (
                                            <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-semibold text-indigo-300 shadow-sm">
                                                <Star className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
                                                {averageRating} Rating
                                            </div>
                                        )}
                                    </div>

                                    {/* Reviews List */}
                                    {isLoadingFeedbacks ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : feedbacks.length === 0 ? (
                                        <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-6 text-center">
                                            <p className="text-white/40 text-sm">No reviews yet. Share what you like about this event below!</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {feedbacks.map((fb) => (
                                                <div
                                                    key={fb.id}
                                                    className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-2xl p-4 transition-all duration-300 relative overflow-hidden"
                                                >
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold shadow-sm">
                                                                {fb.user_name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-white">{fb.user_name}</div>
                                                                <div className="text-xs text-white/50">{fb.user_department || 'General'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <Star
                                                                    key={s}
                                                                    className={cn(
                                                                        "w-3.5 h-3.5",
                                                                        s <= fb.rating
                                                                            ? "fill-indigo-400 text-indigo-400"
                                                                            : "text-white/20"
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-white/80 text-sm pl-1 leading-relaxed whitespace-pre-wrap">{fb.comment}</p>
                                                    <div className="text-[10px] text-white/30 text-right mt-2">
                                                        {new Date(fb.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Feedback Form */}
                                    {!isAdmin && currentUser && (
                                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
                                            
                                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
                                                Share Your Feedback
                                            </h4>

                                            {!isRegistered ? (
                                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
                                                    <p className="text-white/45 text-xs font-medium">Only registered attendees can submit a review for this event.</p>
                                                </div>
                                            ) : hasAlreadyReviewed ? (
                                                <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                                                    <span>You have successfully shared your feedback for this event. Thank you!</span>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                                    {/* Star rating picker */}
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-white/50">Your Rating:</span>
                                                        <div className="flex items-center gap-1">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    onClick={() => setRating(s)}
                                                                    className="p-0.5 hover:scale-110 active:scale-95 transition-all duration-200"
                                                                >
                                                                    <Star
                                                                        className={cn(
                                                                            "w-5 h-5 transition-colors",
                                                                            s <= rating
                                                                                ? "fill-indigo-400 text-indigo-400"
                                                                                : "text-white/20 hover:text-indigo-400/50"
                                                                        )}
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Text comment field */}
                                                    <div className="relative">
                                                        <textarea
                                                            value={comment}
                                                            onChange={(e) => setComment(e.target.value)}
                                                            placeholder="What did you like about this event? Share your thoughts..."
                                                            rows={3}
                                                            required
                                                            maxLength={500}
                                                            className="w-full bg-[#0E1322]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all duration-300 resize-none"
                                                        />
                                                    </div>

                                                    {errorMessage && (
                                                        <div className="text-red-400 text-xs font-medium">
                                                            {errorMessage}
                                                        </div>
                                                    )}

                                                    {successMessage && (
                                                        <div className="text-emerald-400 text-xs font-medium">
                                                            {successMessage}
                                                        </div>
                                                    )}

                                                    <div className="flex justify-end">
                                                        <Button
                                                            type="submit"
                                                            disabled={submitting || !comment.trim()}
                                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-300"
                                                        >
                                                            {submitting ? (
                                                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Send className="w-3.5 h-3.5" />
                                                                    Submit Feedback
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
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
                                        onClick={() => {
                                            if (!hasEventEnded) setShowConfirm(true);
                                        }}
                                        disabled={(isSoldOut && !isRegistered) || hasEventEnded}
                                        className={cn(
                                            "w-full py-6 text-base font-semibold transition-all duration-300",
                                            hasEventEnded
                                                ? "bg-indigo-500/10 text-indigo-300/70 border border-indigo-500/20 cursor-not-allowed"
                                                : isRegistered
                                                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                                    : isSoldOut
                                                        ? "bg-white/5 text-white/30 cursor-not-allowed"
                                                        : "bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                        )}
                                    >
                                        {hasEventEnded ? "Event Ended" : isRegistered ? "Leave Event" : isSoldOut ? "Sold Out" : "Register Now"}
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
                    isTeamEvent={!!event.is_team_event}
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
