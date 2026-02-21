import React from 'react';
import { ArrowRight, Code, Music, Briefcase, Plus } from 'lucide-react';

interface HeroBentoGridProps {
    onExploreClick: () => void;
}

const HeroBentoGrid: React.FC<HeroBentoGridProps> = ({ onExploreClick }) => {
    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
                {/* ── Main Featured Card (Col-span 2) ── */}
                <div className="group relative col-span-1 md:col-span-2 row-span-2 overflow-hidden rounded-[20px] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] h-96 md:h-auto">
                    {/* Background Image */}
                    <img
                        src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop"
                        alt="Campus Tech Symposium"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/80 to-transparent opacity-90" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-8">
                        <div className="flex items-start justify-between">
                            {/* Floating Date Badge */}
                            <span className="inline-flex items-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50 backdrop-blur-md border border-white/20 shadow-lg">
                                Feb 14 - 16
                            </span>
                        </div>

                        <div className="space-y-4">
                            {/* Title with Sunset Gradient */}
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                    Campus Tech
                                </span>
                                <br />
                                <span className="text-white">Symposium</span>
                            </h2>

                            {/* Social Proof */}
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <img
                                            key={i}
                                            className="inline-block h-10 w-10 rounded-full border-2 border-[#0B0F19] object-cover bg-slate-700"
                                            src={`https://i.pravatar.cc/150?img=${10 + i}`}
                                            alt="Attendee"
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-lg">+500</span>
                                    <span className="text-blue-200/80 text-xs font-medium uppercase tracking-wider">Attending</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Action Card (Explore All) ── */}
                <div
                    onClick={onExploreClick}
                    className="group relative col-span-1 row-span-2 overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#161E2E] cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] h-96 md:h-auto flex flex-col items-center justify-center text-center p-8"
                >
                    {/* Texture Overlay */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />

                    {/* Center Button */}
                    <div className="relative z-10 mb-6">
                        <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-blue-500 opacity-20" />
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-blue-400 shadow-xl shadow-blue-900/50 transition-transform duration-300 group-hover:scale-110">
                            <Plus size={40} strokeWidth={3} />
                        </div>
                    </div>

                    <h3 className="relative z-10 text-2xl font-bold text-white mb-2">
                        Explore All Events
                    </h3>
                    <p className="relative z-10 text-blue-200/60 font-medium">
                        Discover 50+ workshops, parties, and seminars
                    </p>
                </div>

                {/* ── Secondary Row Cards ── */}
                {[
                    {
                        title: 'Web3 Workshop',
                        category: 'Tech',
                        color: 'bg-indigo-500/20 text-indigo-300',
                        icon: Code,
                        glow: 'group-hover:text-indigo-400',
                    },
                    {
                        title: 'Acoustic Night',
                        category: 'Music',
                        color: 'bg-rose-500/20 text-rose-300',
                        icon: Music,
                        glow: 'group-hover:text-rose-400',
                    },
                    {
                        title: 'Career Fair',
                        category: 'Business',
                        color: 'bg-emerald-500/20 text-emerald-300',
                        icon: Briefcase,
                        glow: 'group-hover:text-emerald-400',
                    },
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] bg-[#161E2E] border border-[rgba(255,255,255,0.08)] shadow-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-[#1f2937] hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] h-48 cursor-pointer"
                    >
                        <div className="flex items-start justify-between">
                            <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.color} border border-white/5`}
                            >
                                {item.category}
                            </span>
                            <ArrowRight
                                className={`h-5 w-5 text-white/50 transition-colors duration-300 ${item.glow} group-hover:translate-x-1`}
                            />
                        </div>

                        <div className="mt-4">
                            <div
                                className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/80 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white`}
                            >
                                <item.icon size={20} />
                            </div>
                            <h4 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors">
                                {item.title}
                            </h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeroBentoGrid;
