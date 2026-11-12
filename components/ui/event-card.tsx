import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Ticket, MapPin, Users, CheckCircle2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { getEventTheme, getCalendarBadgeParts } from "@/lib/eventThemes";

interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
    imageUrl: string;
    category: string;
    title: string;
    location: string;
    description: string;
    date: string;
    rawDate?: string;
    registeredCount?: number;
    capacity?: number;
    isRegistered: boolean;
    isSoldOut?: boolean;
    isPastEvent?: boolean;
    isTeamEvent?: boolean;
    maxTeamSize?: number;
    onToggleRegistration: (teamName?: string) => void;
    onClick?: () => void;
}

const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
    (
        {
            className,
            imageUrl,
            category,
            title,
            location,
            description,
            date,
            rawDate,
            registeredCount,
            capacity,
            isRegistered,
            isSoldOut = false,
            isPastEvent = false,
            isTeamEvent,
            maxTeamSize,
            onToggleRegistration,
            onClick,
            ...props
        },
        ref
    ) => {
        const [showConfirm, setShowConfirm] = React.useState(false);
        const theme = getEventTheme(category);
        const badge = getCalendarBadgeParts(rawDate || date);
        const hasCustomImage = Boolean(imageUrl && !imageUrl.includes("picsum.photos"));
        const showCapacityBar = typeof capacity === "number" && capacity > 0 && typeof registeredCount === "number";
        const fillPercent = showCapacityBar ? Math.min(100, Math.round((registeredCount! / capacity!) * 100)) : 0;

        return (
            <>
                <div
                    ref={ref}
                    onClick={onClick}
                    className={cn(
                        "group relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0E1424] flex flex-col justify-between",
                        "transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:border-white/25",
                        onClick && "cursor-pointer",
                        className
                    )}
                    style={{
                        boxShadow: `0 18px 40px -24px ${theme.glowRgba}`,
                        ...props.style,
                    }}
                    {...props}
                >
                    {/* Top Visual Poster Header */}
                    <div className="relative h-32 shrink-0 overflow-hidden" style={{ background: theme.gradient }}>
                        {hasCustomImage ? (
                            <img
                                src={imageUrl}
                                alt={title}
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                        ) : (
                            <>
                                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ background: theme.patternBg }} />
                                <div className="absolute inset-0 bg-festival-grid opacity-35" />
                            </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1424] via-[#0E1424]/30 to-black/25" />

                        {/* Top Pills & Date Stamp */}
                        <div className="relative z-10 flex items-start justify-between p-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                    className={cn(
                                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                                        theme.pillClass
                                    )}
                                >
                                    {category}
                                </span>
                                {isTeamEvent && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/45 px-2.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-md">
                                        <Users className="h-3 w-3" />
                                        Team · {maxTeamSize || 2}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col items-center gap-1.5">
                                <div className="rounded-xl border border-white/20 bg-black/55 px-2.5 py-1 text-center font-mono-num backdrop-blur-md">
                                    <span className="block text-[9px] font-bold tracking-widest text-amber-300 leading-none">
                                        {badge.month}
                                    </span>
                                    <span className="block text-sm font-bold text-white leading-tight">
                                        {badge.day}
                                    </span>
                                </div>
                                {isRegistered && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Pass
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col justify-between p-5 pt-3">
                        <div className="space-y-2">
                            <h3 className="font-display text-lg font-bold tracking-tight text-white line-clamp-1 group-hover:text-amber-200 transition-colors">
                                {title}
                            </h3>
                            <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                                <span className="truncate">{location}</span>
                            </p>
                            <p className="text-xs sm:text-sm text-slate-300/75 leading-relaxed line-clamp-2">
                                {description}
                            </p>
                        </div>

                        {/* Perforated Stub Footer */}
                        <div className="mt-4 space-y-3 pb-0.5">
                            {showCapacityBar && !isPastEvent && (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px] font-mono-num text-slate-400">
                                        <span>{registeredCount} / {capacity} spots filled</span>
                                        <span className="text-slate-300">{Math.max(0, capacity! - registeredCount!)} left</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                                        <div
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{
                                                width: `${fillPercent}%`,
                                                background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="relative flex items-center pt-1">
                                <div className="-ml-7 h-4 w-4 rounded-full bg-[#07090F] border-r border-white/10" />
                                <div className="flex-1 border-t border-dashed border-white/10 mx-2" />
                                <div className="-mr-7 h-4 w-4 rounded-full bg-[#07090F] border-l border-white/10" />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-mono-num text-slate-300 truncate">
                                    {date}
                                </span>

                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isPastEvent) setShowConfirm(true);
                                    }}
                                    disabled={(isSoldOut && !isRegistered) || isPastEvent}
                                    size="sm"
                                    className={cn(
                                        "shrink-0 rounded-xl px-3.5 text-xs font-bold cursor-pointer transition-transform duration-200",
                                        isPastEvent
                                            ? "cursor-not-allowed bg-white/5 text-slate-400 border border-white/10 shadow-none"
                                            : isRegistered
                                                ? "bg-white/10 text-white hover:bg-rose-500/20 hover:text-rose-300 border border-white/15"
                                                : isSoldOut
                                                    ? "cursor-not-allowed bg-white/5 text-slate-500 border border-white/10 shadow-none"
                                                    : "bg-white text-slate-950 hover:bg-amber-200 hover:scale-[1.03] active:scale-[0.98]"
                                    )}
                                >
                                    {isPastEvent ? "Ended" : isRegistered ? "Cancel Pass" : isSoldOut ? "Sold Out" : "Get Pass"}
                                    {!isSoldOut && !isPastEvent && <Ticket className="ml-1.5 h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {showConfirm && createPortal(
                    <ConfirmModal
                        open={showConfirm}
                        type={isRegistered ? "leave" : "join"}
                        eventTitle={title}
                        isTeamEvent={isTeamEvent}
                        maxTeamSize={maxTeamSize}
                        onConfirm={(teamName) => {
                            setShowConfirm(false);
                            onToggleRegistration(teamName);
                        }}
                        onCancel={() => setShowConfirm(false)}
                    />,
                    document.body
                )}
            </>
        );
    }
);
EventCard.displayName = "EventCard";

export { EventCard };
