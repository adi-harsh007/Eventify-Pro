import { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Flame, Music, Ticket, Trophy, Users, Cpu } from 'lucide-react';

const VIBE_CHANNELS = [
  {
    id: 'tech',
    label: 'Hackathons & Tech',
    icon: Cpu,
    accent: 'from-cyan-400 to-blue-500',
    headline: '24-hour builds, CTFs, robotics & IoT labs',
    detail: 'Across CSE and ECE — form a squad up to 4 or jump into hands-on bootcamps with live seat counts.',
    tags: ['Winter CodeSprint', 'CTF Cyber Arena', 'Autonomous Line-Follower'],
  },
  {
    id: 'culture',
    label: 'Arts & Music Nights',
    icon: Music,
    accent: 'from-rose-400 to-amber-400',
    headline: 'Amphitheatre concerts, film labs & theatre',
    detail: 'Catch unplugged acoustic sets, improv theatre showcases, and midnight mural jams across campus.',
    tags: ['Acoustic Unplugged', 'Street Theatre Night', 'Midnight Canvas Jam'],
  },
  {
    id: 'sports',
    label: 'Tournaments & Runs',
    icon: Trophy,
    accent: 'from-emerald-400 to-teal-400',
    headline: 'Floodlit futsal, 3x3 streetball & 5K runs',
    detail: 'Register your squad or compete solo in badminton, chess blitz, and dawn campus runs.',
    tags: ['Futsal Cup', '3x3 Basketball', 'New Year 5K Run'],
  },
];

export default function AboutSection() {
  const [activeVibe, setActiveVibe] = useState(0);
  const current = VIBE_CHANNELS[activeVibe];
  const ActiveIcon = current.icon;

  return (
    <section id="about-section" className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 cv-auto">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-12"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300 mb-3">
            <Flame className="w-3.5 h-3.5" />
            Built For Campus Life
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            No scattered forms. Just show up and{' '}
            <span className="bg-gradient-to-r from-amber-300 to-rose-400 bg-clip-text text-transparent">
              experience it.
            </span>
          </h2>
        </motion.div>

        {/* Asymmetric Bento Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Interactive Vibe Switcher (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#12192B] to-[#0B101D] p-7 sm:p-9"
          >
            <div className="flex flex-wrap gap-2 mb-7">
              {VIBE_CHANNELS.map((vibe, idx) => {
                const Icon = vibe.icon;
                const isSelected = idx === activeVibe;
                return (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => setActiveVibe(idx)}
                    className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      isSelected ? 'text-white' : 'text-slate-400 hover:text-white bg-white/[0.04]'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="aboutVibePill"
                        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${vibe.accent} opacity-90`}
                      />
                    )}
                    <Icon className="relative z-10 w-3.5 h-3.5" />
                    <span className="relative z-10">{vibe.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${current.accent} text-slate-950 shadow-lg`}>
                  <ActiveIcon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  {current.headline}
                </h3>
              </div>
              <p className="text-slate-300/80 text-base leading-relaxed max-w-xl">
                {current.detail}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {current.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Two Stacked Feature Tiles (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-rose-500/15 via-[#131727] to-[#0B101D] p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-rose-300">
                    Squad &amp; Solo Ready
                  </span>
                  <h3 className="font-display text-xl font-bold text-white mt-2">
                    Instant Pass &amp; Team Signups
                  </h3>
                  <p className="text-sm text-slate-300/75 mt-2 leading-relaxed">
                    Join solo events in one click or enter your squad name for hackathons and tournaments with real-time team caps.
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 via-[#131727] to-[#0B101D] p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                    All In One Place
                  </span>
                  <h3 className="font-display text-xl font-bold text-white mt-2">
                    Mega Fest VIP &amp; Personal Calendar
                  </h3>
                  <p className="text-sm text-slate-300/75 mt-2 leading-relaxed">
                    Claim your 3-day Mega Fest All-Access pass, switch to calendar view for your bookings, and rate events you attended.
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300">
                  <Compass className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono-num text-emerald-300">
                <Ticket className="w-3.5 h-3.5" />
                <span>8 Campus Departments · Calendar View · EventBot Guide</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
