import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowRight, Sparkles, Ticket } from 'lucide-react';
import { apiGetPublicEvents } from '../../apiService';
import { getEventTheme, getCalendarBadgeParts } from '../../lib/eventThemes';

interface PublicEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image_url?: string;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
}

export default function EventShowcase({ onGetStarted }: { onGetStarted: () => void }) {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGetPublicEvents()
      .then((data) => {
        setEvents((data.events || []).slice(0, 5));
      })
      .catch((err) => {
        console.error('Failed to fetch public events', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const spotlight = events[0];
  const restEvents = events.slice(1);

  return (
    <section id="events-section" className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden cv-auto">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 50% 20%, rgba(56,189,248,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              On Campus Next
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Upcoming{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                Headliners
              </span>
            </h2>
          </div>
          <p className="max-w-md text-slate-400 text-sm sm:text-base">
            A sneak peek at the next events opening their doors. Sign in with your campus account to grab a pass.
          </p>
        </motion.div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-64 rounded-3xl skeleton-shimmer border border-white/10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[0, 1, 2, 3].map((n) => (
                <div key={n} className="h-72 rounded-3xl skeleton-shimmer border border-white/10" />
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white/[0.02] border border-white/[0.06] rounded-3xl text-center px-6">
            <Calendar className="w-11 h-11 text-slate-600 mb-4" />
            <h3 className="font-display text-xl font-bold text-white mb-2">New Lineup Dropping Soon</h3>
            <p className="text-slate-400 max-w-md text-sm">
              Sign in to explore department schedules or check back shortly for upcoming campus events.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Featured Spotlight Card */}
            {spotlight && (() => {
              const theme = getEventTheme(spotlight.category);
              const badge = getCalendarBadgeParts(spotlight.date);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  onClick={onGetStarted}
                  className="group relative overflow-hidden rounded-3xl border border-white/15 bg-[#0E1424] grid md:grid-cols-12 cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                  style={{ boxShadow: `0 24px 60px -24px ${theme.glowRgba}` }}
                >
                  {/* Visual Banner */}
                  <div className="relative md:col-span-5 min-h-[220px] overflow-hidden" style={{ background: theme.gradient }}>
                    {spotlight.image_url ? (
                      <img
                        src={spotlight.image_url}
                        alt={spotlight.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="absolute inset-0" style={{ background: theme.patternBg }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-[#0E1424]/90 md:to-[#0E1424]" />

                    <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                      <div className="flex items-start justify-between">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md ${theme.pillClass}`}>
                          Featured · {spotlight.category}
                        </span>
                        <div className="rounded-2xl border border-white/20 bg-black/50 backdrop-blur-md px-3 py-1.5 text-center font-mono-num">
                          <span className="block text-[10px] font-bold text-amber-300">{badge.month}</span>
                          <span className="block text-lg font-bold text-white leading-none">{badge.day}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
                    <div className="space-y-3">
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-white group-hover:text-amber-200 transition-colors">
                        {spotlight.title}
                      </h3>
                      <p className="text-slate-300/80 text-sm sm:text-base leading-relaxed line-clamp-3">
                        {spotlight.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                      <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400 font-mono-num">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-300" />
                          {formatDate(spotlight.date)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-300" />
                          {spotlight.time}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-sans">
                          <MapPin className="w-3.5 h-3.5 text-rose-300" />
                          {spotlight.location}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        <Ticket className="w-4 h-4" />
                        Claim Pass
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Secondary Grid */}
            {restEvents.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {restEvents.map((event, i) => {
                  const theme = getEventTheme(event.category);
                  const badge = getCalendarBadgeParts(event.date);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.45 }}
                      onClick={onGetStarted}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0E1424] cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 hover:border-white/25 flex flex-col justify-between"
                    >
                      <div className="relative h-36 overflow-hidden" style={{ background: theme.gradient }}>
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="absolute inset-0" style={{ background: theme.patternBg }} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1424] via-transparent to-black/25" />

                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${theme.pillClass}`}>
                            {event.category}
                          </span>
                          <div className="rounded-xl border border-white/20 bg-black/55 backdrop-blur-md px-2.5 py-1 text-center font-mono-num">
                            <span className="block text-[9px] font-bold text-amber-300 leading-none">{badge.month}</span>
                            <span className="block text-sm font-bold text-white leading-tight">{badge.day}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-1.5">
                          <h3 className="font-display text-lg font-bold text-white leading-snug line-clamp-1 group-hover:text-cyan-200 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
                            {event.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.05] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Ticket className="w-4 h-4 text-amber-400" />
            Sign in to Explore All 8 Departments
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
