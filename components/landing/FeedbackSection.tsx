import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Send, CheckCircle, User, Quote } from 'lucide-react';
import { apiGetFeedback, apiSubmitFeedback } from '../../apiService';

interface Feedback {
  id: number;
  name: string;
  role: string;
  rating: number;
  comment: string;
  created_at: string;
}

const roleColors: Record<string, string> = {
  'CS Student': 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25',
  'Faculty Organizer': 'text-violet-300 bg-violet-500/10 border-violet-500/25',
  'Tech Recruiter': 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
  'Event Enthusiast': 'text-rose-300 bg-rose-500/10 border-rose-500/25',
  'Startup Founder': 'text-amber-300 bg-amber-500/10 border-amber-500/25',
};

function getRoleColor(role: string) {
  return roleColors[role] || 'text-slate-300 bg-slate-500/10 border-slate-500/25';
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= count ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
        />
      ))}
    </div>
  );
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-125 focus:outline-none cursor-pointer"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              i <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: 'Visitor', rating: 5, comment: '' });

  useEffect(() => {
    apiGetFeedback()
      .then((data) => setFeedbacks(data.feedbacks || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.comment) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await apiSubmitFeedback(form);
      setFeedbacks((prev) => [res.feedback, ...prev]);
      setSubmitted(true);
      setForm({ name: '', email: '', role: 'Visitor', rating: 5, comment: '' });
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const marqueeItems = feedbacks.length > 0 ? [...feedbacks, ...feedbacks] : [];

  return (
    <section id="feedback-section" className="relative py-20 sm:py-24 overflow-hidden cv-auto">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 50% 50%, rgba(244,63,94,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-300 mb-3">
              <MessageSquare className="w-3.5 h-3.5" />
              Campus Voices
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Loved by Attendees &amp;{' '}
              <span className="bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
                Organizers
              </span>
            </h2>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="self-start md:self-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 hover:scale-[1.03] active:scale-[0.98] transition-transform cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Share Your Experience
            </button>
          )}
        </motion.div>

        {/* Feedback Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="mb-12"
            >
              <div className="max-w-lg mx-auto rounded-3xl border border-white/15 bg-[#0E1424]/95 p-6 sm:p-7 backdrop-blur-xl shadow-2xl">
                {submitted ? (
                  <div className="text-center py-8 space-y-3">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h3 className="font-display text-xl font-bold text-white">Thanks for the shoutout!</h3>
                    <p className="text-sm text-slate-400">Your review is now live on the wall.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-lg font-bold text-white">Leave a Review</h3>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    {error && (
                      <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
                        {error}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        maxLength={100}
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-rose-400/50 focus:outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        maxLength={255}
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-rose-400/50 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <select
                        value={form.role}
                        onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                        className="rounded-xl border border-white/10 bg-[#12192B] px-3.5 py-2 text-sm text-white focus:border-rose-400/50 focus:outline-none"
                      >
                        <option value="Visitor">Visitor</option>
                        <option value="CS Student">Student</option>
                        <option value="Faculty Organizer">Organizer</option>
                        <option value="Event Enthusiast">Event Enthusiast</option>
                        <option value="Startup Founder">Speaker / Guest</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Rating:</span>
                        <InteractiveStars value={form.rating} onChange={(r) => setForm((p) => ({ ...p, rating: r }))} />
                      </div>
                    </div>
                    <textarea
                      placeholder="What stood out at your last event?"
                      value={form.comment}
                      onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                      maxLength={1000}
                      rows={3}
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-rose-400/50 focus:outline-none resize-none"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 py-3 text-sm font-bold text-white hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* GPU-accelerated infinite marquee wall */}
      {marqueeItems.length > 0 && (
        <div className="marquee-group relative mt-4 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#07090F] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#07090F] to-transparent z-10" />

          <div className="marquee-track-left gap-5 py-2">
            {marqueeItems.map((fb, idx) => (
              <div
                key={`${fb.id}-${idx}`}
                className="w-[330px] sm:w-[380px] shrink-0 relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between gap-4 hover:border-white/25 transition-colors"
              >
                <Quote className="absolute top-5 right-5 w-6 h-6 text-white/[0.07]" />
                <div className="space-y-3">
                  <Stars count={fb.rating} />
                  <p className="text-sm text-slate-300/90 leading-relaxed line-clamp-4">
                    &ldquo;{fb.comment}&rdquo;
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.07]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-white">{fb.name}</span>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getRoleColor(fb.role)}`}
                  >
                    {fb.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
