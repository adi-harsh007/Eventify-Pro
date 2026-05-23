
import { motion } from "framer-motion";
import {
    ArrowRight,
    Play,
    Target,
    Crown,
    Star,
    // Social Links
    Github,
    Instagram,
    Linkedin
} from "lucide-react";

// --- SUB-COMPONENTS ---
const StatItem = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
        <span className="text-lg font-bold text-white sm:text-xl tracking-tight">{value}</span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold sm:text-[10px] mt-0.5">{label}</span>
    </div>
);

// --- MAIN COMPONENT ---
interface HeroProps {
    onGetStarted?: () => void;
}

export default function GlassmorphismTrustHero({ onGetStarted }: HeroProps) {
    return (
        <div className="relative w-full min-h-screen bg-zinc-950 text-white overflow-hidden font-sans">
            {/* Background Image with Gradient Mask */}
            <div
                className="absolute inset-0 z-0 bg-[url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a72ca2f3-9dd1-4fe4-84ba-fe86468a5237_3840w.webp?w=800&q=80)] bg-cover bg-center opacity-40 mix-blend-screen"
                style={{
                    maskImage: "linear-gradient(180deg, transparent, black 10%, black 70%, transparent)",
                    WebkitMaskImage: "linear-gradient(180deg, transparent, black 10%, black 70%, transparent)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-6 sm:px-6 md:pt-24 md:pb-8 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-6 items-center">

                    {/* --- LEFT COLUMN --- */}
                    <div className="lg:col-span-7 flex flex-col justify-center space-y-4 pt-0">

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-white/10">
                                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                                    Eventify Pro Premium
                                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                </span>
                            </div>
                        </motion.div>

                        {/* Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tighter leading-[0.9]"
                            style={{
                                maskImage: "linear-gradient(180deg, black 0%, black 80%, transparent 100%)",
                                WebkitMaskImage: "linear-gradient(180deg, black 0%, black 80%, transparent 100%)"
                            }}
                        >
                            Enter the World<br />
                            <span className="bg-gradient-to-br from-white via-white to-[#ffcd75] bg-clip-text text-transparent">
                                Of Events
                            </span><br />
                            To Feel Alive Again
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="max-w-xl text-base text-zinc-400 leading-relaxed"
                        >
                            Discover experiences that combine vibrant energy with community,
                            creating unforgettable moments that inspire you and bring people together.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <button
                                onClick={onGetStarted}
                                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition-all hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
                            >
                                Get Started
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>

                            <button className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-white/20">
                                <Play className="w-4 h-4 fill-current" />
                                Watch Showreel
                            </button>
                        </motion.div>
                    </div>

                    {/* --- RIGHT COLUMN --- */}
                    <div className="lg:col-span-5 space-y-3 lg:mt-4">

                        {/* Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl"
                        >
                            {/* Card Glow Effect */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                                        <Target className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold tracking-tight text-white">1000+</div>
                                        <div className="text-[10px] text-zinc-400">Events Hosted</div>
                                    </div>
                                </div>

                                <p className="text-xs text-zinc-400 leading-relaxed mb-4 pr-4">
                                    Eventify Pro is your ultimate platform to discover, organize, and experience
                                    university events seamlessly.
                                </p>

                                {/* Progress Bar Section */}
                                <div className="space-y-1.5 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Satisfaction Rate</span>
                                        <span className="text-white font-medium">99%</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/50">
                                        <div className="h-full w-[99%] rounded-full bg-gradient-to-r from-amber-400 to-amber-200" />
                                    </div>
                                </div>

                                <div className="h-px w-full bg-white/10 mb-3" />

                                {/* Mini Stats Grid (2-1 Layout) */}
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-center mt-4 mb-4 relative">
                                    <StatItem value="10k+" label="Users" />
                                    <div className="absolute left-1/2 -translate-x-1/2 w-px h-10 bg-white/10 top-1" />
                                    <StatItem value="24/7" label="Support" />
                                    <div className="col-span-2 mt-0">
                                        <StatItem value="100%" label="Uptime" />
                                    </div>
                                </div>

                                {/* Tag Pills */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        SYSTEM ONLINE
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                                        <Crown className="w-3 h-3 text-amber-500" />
                                        PRO
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Social Links Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-4 px-5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4"
                        >
                            <h3 className="text-sm font-medium text-zinc-400">Connect with Us</h3>

                            <div className="flex items-center gap-6">
                                <a href="https://github.com/adi-harsh007" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="https://linkedin.com/in/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
}
