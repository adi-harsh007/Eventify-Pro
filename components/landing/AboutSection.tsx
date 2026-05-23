import { motion } from 'framer-motion';
import { Sparkles, Shield, Cpu, Users, Calendar, Zap, Database, Cloud } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const } }) };

const techStack = [
  { icon: <Cpu className="w-4 h-4" />, label: 'React + TypeScript' },
  { icon: <Zap className="w-4 h-4" />, label: 'Vite + Tailwind v4' },
  { icon: <Database className="w-4 h-4" />, label: 'MySQL + Redis' },
  { icon: <Cloud className="w-4 h-4" />, label: 'Cloudinary CDN' },
  { icon: <Sparkles className="w-4 h-4" />, label: 'Gemini AI' },
  { icon: <Shield className="w-4 h-4" />, label: 'Helmet + Rate Limiting' },
];

const attendeeFeatures = [
  'Browse & discover events with infinite scroll',
  'One-click registration & team signups',
  'Personal dashboard with ticket management',
  'Google OAuth & OTP-based secure auth',
];

const adminFeatures = [
  'Create, edit, delete events with Cloudinary uploads',
  'AI-powered event description generation (Gemini)',
  'View all registrations & manage attendees',
  'Integrated admin todo list & mega event controls',
];

export default function AboutSection() {
  return (
    <section id="about-section" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center mb-16">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">What We Built</span>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            A Full-Stack Event <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Management Platform</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="max-w-2xl mx-auto text-zinc-400 text-base leading-relaxed">
            Eventify Pro is a production-grade university event management system featuring role-based access control, real-time data from MySQL, Redis caching, Cloudinary media uploads, and Google Gemini AI-powered content generation.
          </motion.p>
        </motion.div>

        {/* Tech Stack Pills */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-wrap justify-center gap-3 mb-16">
          {techStack.map((t, i) => (
            <motion.div key={t.label} variants={fadeUp} custom={i} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
              {t.icon} {t.label}
            </motion.div>
          ))}
        </motion.div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Attendee Card */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 backdrop-blur-xl group hover:border-blue-500/30 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 -mr-12 -mt-12 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-colors duration-500 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 ring-1 ring-blue-500/30">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Regular Users</h3>
              </div>
              <ul className="space-y-3">
                {attendeeFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Admin Card */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 backdrop-blur-xl group hover:border-violet-500/30 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 -mr-12 -mt-12 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl group-hover:bg-violet-500/20 transition-colors duration-500 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-500/30">
                  <Shield className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Administrators</h3>
              </div>
              <ul className="space-y-3">
                {adminFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Architecture highlight */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center text-center">
            <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm text-zinc-400">
              <span className="text-white font-medium">Public API:</span> The landing page below fetches <span className="text-amber-400 font-medium">live event data</span> directly from our MySQL database via an unauthenticated <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">GET /api/events/public</code> endpoint — proving full-stack integration.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
