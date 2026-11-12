import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { apiGetPublicEvents } from '../../apiService';

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



const categoryColors: Record<string, string> = {
  'Hackathon': 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300',
  'Music Concert': 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-300',
  'Sports Event': 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-300',
  'Tech Competition': 'from-violet-500/20 to-indigo-500/20 border-violet-500/30 text-violet-300',
  'Cultural Fest': 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
};

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; }
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
        console.error("Failed to fetch public events", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <section id="events-section" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Live From Database</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Upcoming <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Events</span>
          </h2>
          <p className="max-w-xl mx-auto text-zinc-400 text-base">
            These events are fetched live from our PostgreSQL database. Click any card to explore — sign in to register!
          </p>
        </motion.div>

        {/* Event Cards Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
            <Calendar className="w-12 h-12 text-zinc-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Live Events</h3>
            <p className="text-zinc-400 text-center max-w-md">There are currently no upcoming events scheduled. Please check back later!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => {
              const colorClass = categoryColors[event.category] || 'from-zinc-500/20 to-zinc-500/20 border-zinc-500/30 text-zinc-300';
              return (
                <motion.div key={event.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl hover:border-white/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] ${i >= 3 ? 'sm:col-span-1 lg:col-span-1' : ''}`}
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80'} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center rounded-full border bg-gradient-to-r px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${colorClass}`}>
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-blue-300 transition-colors">{event.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(event.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="w-3 h-3 shrink-0" /><span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="text-center mt-12">
          <button onClick={onGetStarted} className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 transition-all">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Sign in to Register for Events
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
