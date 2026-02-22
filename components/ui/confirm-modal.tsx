import * as React from "react";
import { cn } from "@/lib/utils";
import { Ticket, LogOut } from "lucide-react";

interface ConfirmModalProps {
    open: boolean;
    type: "join" | "leave";
    eventTitle?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    type,
    eventTitle,
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    const isJoin = type === "join";

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={onCancel}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    "relative w-full max-w-sm mx-4 overflow-hidden rounded-2xl border p-6",
                    "animate-in fade-in zoom-in-95 duration-200",
                    "shadow-2xl"
                )}
                style={{
                    background: "linear-gradient(145deg, #1A2236 0%, #0F1420 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: isJoin
                        ? "0 0 60px rgba(59,130,246,0.15), 0 25px 50px rgba(0,0,0,0.5)"
                        : "0 0 60px rgba(239,68,68,0.15), 0 25px 50px rgba(0,0,0,0.5)",
                }}
            >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{
                            background: isJoin
                                ? "rgba(59,130,246,0.1)"
                                : "rgba(239,68,68,0.1)",
                            border: `1px solid ${isJoin ? "rgba(59,130,246,0.25)" : "rgba(239,68,68,0.25)"}`,
                            boxShadow: isJoin
                                ? "0 0 30px rgba(59,130,246,0.15)"
                                : "0 0 30px rgba(239,68,68,0.15)",
                        }}
                    >
                        {isJoin ? (
                            <Ticket className="h-6 w-6" style={{ color: "#3B82F6" }} />
                        ) : (
                            <LogOut className="h-6 w-6" style={{ color: "#EF4444" }} />
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3
                    className="text-center text-lg font-bold mb-1"
                    style={{ color: "#F9FAFB" }}
                >
                    {isJoin ? "Get Your Ticket?" : "Leave This Event?"}
                </h3>

                {/* Subtitle */}
                <p
                    className="text-center text-sm mb-6"
                    style={{ color: "#94A3B8" }}
                >
                    {isJoin
                        ? `You're about to register${eventTitle ? ` for "${eventTitle}"` : ""}. A spot will be reserved for you.`
                        : `You're about to leave${eventTitle ? ` "${eventTitle}"` : " this event"}. Your spot will be released.`}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                        style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#94A3B8",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                            e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                            e.currentTarget.style.color = "#94A3B8";
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                        style={{
                            background: isJoin
                                ? "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)"
                                : "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                            boxShadow: isJoin
                                ? "0 0 20px rgba(59,130,246,0.4)"
                                : "0 0 20px rgba(239,68,68,0.4)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        {isJoin ? "Confirm Registration" : "Leave Event"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export { ConfirmModal };
