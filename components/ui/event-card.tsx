import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

// Adapted for Eventify Pro
interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
    imageUrl: string;
    category: string;
    title: string;
    location: string;
    description: string;
    date: string;
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

        return (
            <>
                <div
                    ref={ref}
                    onClick={onClick}
                    className={cn(
                        "group relative w-full max-w-sm overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#161E2E] shadow-lg",
                        "transition-all duration-300 ease-in-out hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1",
                        onClick && "cursor-pointer",
                        className
                    )}
                    {...props}
                >
                    <img
                        src={imageUrl}
                        alt={title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-transparent"></div>

                    <div className="relative flex h-full flex-col justify-between p-6 text-white">
                        <div className="flex h-40 items-start justify-between">
                            <span className="inline-flex items-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-medium text-white shadow-sm">
                                {category}
                            </span>
                            {isRegistered && (
                                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/20 backdrop-blur-md px-3 py-1 text-xs font-medium text-emerald-400 shadow-sm">
                                    ✓ Reserved
                                </span>
                            )}
                        </div>

                        <div className="space-y-4 -translate-y-16 md:translate-y-0 transition-transform duration-500 ease-in-out md:group-hover:-translate-y-16">
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
                                <p className="text-sm text-white/80 mt-1">{location}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-[#3B82F6] tracking-wider uppercase mb-2">Details</h4>
                                <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
                                    {description}
                                </p>
                            </div>
                        </div>

                        <div className="absolute bottom-0 md:-bottom-20 left-0 w-full p-6 opacity-100 md:opacity-0 transition-all duration-500 ease-in-out md:group-hover:bottom-0 md:group-hover:opacity-100">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/90 to-transparent rounded-b-[20px]"></div>
                            <div className="relative flex items-end justify-between">
                                <div>
                                    <span className="text-sm font-bold text-white/90 block">{date}</span>
                                </div>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isPastEvent) setShowConfirm(true);
                                    }}
                                    disabled={(isSoldOut && !isRegistered) || isPastEvent}
                                    size="sm"
                                    className={cn(
                                        "cursor-pointer transition-all duration-300",
                                        isPastEvent
                                            ? "cursor-not-allowed bg-indigo-500/10 text-indigo-300/70 border border-indigo-500/20 shadow-none hover:shadow-none hover:-translate-y-0"
                                            : isRegistered
                                                ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 border border-white/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:scale-105"
                                                : isSoldOut
                                                    ? "cursor-not-allowed bg-white/5 text-white/40 border border-white/10 shadow-none hover:shadow-none hover:-translate-y-0"
                                                    : "hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                    )}
                                >
                                    {isPastEvent ? "Event Ended" : isRegistered ? "Leave Event" : isSoldOut ? "Sold Out" : "Get Ticket"}
                                    {!isSoldOut && !isPastEvent && <Ticket className="ml-2 h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal — rendered via portal so it's above everything */}
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

