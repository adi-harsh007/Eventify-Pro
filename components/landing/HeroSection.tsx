import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, Sparkles, Ticket, Users, Zap } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const PREVIEW_PASSES = [
  {
    tag: 'Hackathon · CSE',
    title: 'Winter CodeSprint 2026',
    date: 'DEC 17',
    time: '09:30 AM',
    venue: 'CSE Innovation Lab',
    accent: 'from-cyan-400 to-blue-500',
    badgeClass: 'border-cyan-400/35 bg-cyan-500/15 text-cyan-200',
    spotText: 'Team Pass · Up to 4',
    rotate: '-rotate-2',
  },
  {
    tag: 'Music Concert · Arts',
    title: 'Acoustic Unplugged Evening',
    date: 'DEC 22',
    time: '06:00 PM',
    venue: 'Open Air Amphitheatre',
    accent: 'from-rose-400 via-fuchsia-500 to-amber-400',
    badgeClass: 'border-rose-400/35 bg-rose-500/15 text-rose-200',
    spotText: 'Solo Pass · Free Entry',
    rotate: 'rotate-1',
  },
];

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6 lg:px-8">
      {/* Atmospheric Festival Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-[460px] w-[460px] rounded-full bg-rose-500/15 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 right-1/6 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[130px]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-festival-grid opacity-30" />

      <div className="relative z-10 mx-auto max-w-7xl grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Editorial Column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 space-y-7"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-200 uppercase">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Winter Campus Season · Live Now
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight text-white leading-[1.03]">
            Every Fest, Hackathon &amp; Night.{' '}
            <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-cyan-300 bg-clip-text text-transparent">
              One Pass.
            </span>
          </h1>

          <p className="max-w-xl text-base sm:text-lg text-slate-300/85 leading-relaxed">
            Discover what&apos;s happening across all eight campus departments, claim solo or team passes in seconds, and keep every ticket ready in your pocket.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-500 px-7 py-4 text-sm sm:text-base font-bold text-white shadow-[0_12px_36px_-8px_rgba(244,63,94,0.55)] transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              Claim Your Pass
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <a
              href="#events-section"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 text-sm sm:text-base font-semibold text-slate-200 backdrop-blur-md transition-colors hover:bg-white/[0.09] hover:text-white"
            >
              Browse Lineup
            </a>
          </div>

          {/* Quick highlights */}
          <div className="flex flex-wrap items-center gap-6 pt-3 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant seat lock</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Solo &amp; squad registration</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>3-Day Mega Fest access</span>
            </div>
          </div>
        </motion.div>

        {/* Right Ticket Stub Visual Stack */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 relative flex flex-col gap-5"
        >
          {PREVIEW_PASSES.map((pass, idx) => (
            <motion.div
              key={pass.title}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className={`relative rounded-3xl border border-white/15 bg-[#0E1424]/90 p-5 sm:p-6 backdrop-blur-xl shadow-2xl ${pass.rotate} ${
                idx === 1 ? 'sm:ml-6' : ''
              }`}
            >
              {/* Top neon accent bar */}
              <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${pass.accent} mb-4`} />

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${pass.badgeClass}`}
                  >
                    {pass.tag}
                  </span>
                  <h3 className="font-display text-xl font-bold text-white leading-snug">
                    {pass.title}
                  </h3>
                </div>

                {/* Date Stamp */}
                <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center font-mono-num">
                  <span className="block text-[10px] font-bold tracking-widest text-amber-300">
                    {pass.date.split(' ')[0]}
                  </span>
                  <span className="block text-xl font-bold text-white leading-none mt-0.5">
                    {pass.date.split(' ')[1]}
                  </span>
                </div>
              </div>

              {/* Perforated ticket divider */}
              <div className="relative my-4 flex items-center">
                <div className=" -ml-8 h-5 w-5 rounded-full bg-[#07090F] border-r border-white/15" />
                <div className="flex-1 border-t border-dashed border-white/15 mx-2" />
                <div className=" -mr-8 h-5 w-5 rounded-full bg-[#07090F] border-l border-white/15" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-300" />
                    {pass.time}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-300" />
                    {pass.venue}
                  </span>
                </div>
                <span className="font-mono-num text-[11px] font-semibold text-emerald-300">
                  {hoveredCard === idx ? 'Ready to claim →' : pass.spotText}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

