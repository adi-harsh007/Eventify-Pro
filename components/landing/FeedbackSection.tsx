import { useState, useEffect } from 'react';
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
  'CS Student': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Faculty Organizer': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  'Tech Recruiter': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Event Enthusiast': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'Startup Founder': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

function getRoleColor(role: string) {
  return roleColors[role] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= count ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
      ))}
    </div>
  );
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i)}
          className="transition-transform hover:scale-125 focus:outline-none"
        >
          <Star className={`w-6 h-6 transition-colors ${i <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} />
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
      .then(data => setFeedbacks(data.feedbacks || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.comment) { setError('Please fill in all fields.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await apiSubmitFeedback(form);
      setFeedbacks(prev => [res.feedback, ...prev]);
      setSubmitted(true);
      setForm({ name: '', email: '', role: 'Visitor', rating: 5, comment: '' });
      setTimeout(() => { setSubmitted(false); setShowForm(false); }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="feedback-section" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6">
            <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Reviews & Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            What People <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">Say</span>
          </h2>
          <p className="max-w-xl mx-auto text-zinc-400 text-base mb-8">
            Real feedback from students, organizers, and recruiters — stored in our PostgreSQL database. You can submit your own review too!
          </p>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/25">
              <Send className="w-4 h-4" />
              Leave Your Feedback
            </button>
          )}
        </motion.div>

        {/* Feedback Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.4 }}
              className="mb-12 overflow-hidden"
            >
              <div className="max-w-lg mx-auto rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-6 backdrop-blur-xl shadow-2xl">
                {submitted ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3 py-6">
                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                    <p className="text-lg font-semibold text-white">Thank you for your feedback!</p>
                    <p className="text-sm text-zinc-400">Your review has been saved to our database.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-1">Share Your Experience</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">Name *</label>
                        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">Email *</label>
                        <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@company.com"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-400 mb-1 block">Your Role</label>
                      <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors"
                      >
                        <option value="Visitor">Visitor</option>
                        <option value="CS Student">Student</option>
                        <option value="Faculty Organizer">Faculty / Organizer</option>
                        <option value="Tech Recruiter">Recruiter / HR</option>
                        <option value="Startup Founder">Startup / Industry</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-400 mb-2 block">Rating *</label>
                      <InteractiveStars value={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-400 mb-1 block">Your Review *</label>
                      <textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} placeholder="Share your thoughts about Eventify Pro..." rows={3}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors resize-none"
                      />
                    </div>
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={submitting}
                        className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button type="button" onClick={() => setShowForm(false)}
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-zinc-400 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {feedbacks.map((fb, i) => (
            <motion.div key={fb.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl hover:border-white/20 transition-all duration-300 group"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-white/[0.04] group-hover:text-white/[0.08] transition-colors" />
              <div className="relative z-10 space-y-4">
                <Stars count={fb.rating} />
                <p className="text-sm text-zinc-300 leading-relaxed line-clamp-4">"{fb.comment}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{fb.name}</p>
                    <span className={`inline-block text-[10px] font-medium uppercase tracking-wider rounded-full border px-2 py-0.5 mt-0.5 ${getRoleColor(fb.role)}`}>
                      {fb.role}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {feedbacks.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No reviews yet. Be the first to leave feedback!
          </div>
        )}
      </div>
    </section>
  );
}
