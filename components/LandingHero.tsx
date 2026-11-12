import { useEffect } from 'react';
import { Sparkles, Ticket } from 'lucide-react';
import HeroSection from './landing/HeroSection';
import AboutSection from './landing/AboutSection';
import EventShowcase from './landing/EventShowcase';
import FeedbackSection from './landing/FeedbackSection';

interface LandingHeroProps {
  onGetStarted: () => void;
}

const LandingHero = ({ onGetStarted }: LandingHeroProps) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#07090F] text-white">
      {/* Floating Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] w-[calc(100%-2rem)] max-w-6xl flex items-center justify-between px-4 sm:px-6 py-3 rounded-2xl bg-[#0B101D]/80 border border-white/10 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <a href="#" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-400 text-slate-950">
            <Sparkles size={16} />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            Eventify Pro
          </span>
        </a>

        <div className="hidden sm:flex items-center gap-7">
          <a href="#about-section" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Experience
          </a>
          <a href="#events-section" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Lineup
          </a>
          <a href="#feedback-section" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Stories
          </a>
        </div>

        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white text-slate-950 hover:bg-amber-200 transition-colors cursor-pointer"
          aria-label="Sign in to Eventify Pro"
        >
          <Ticket size={14} />
          Sign In
        </button>
      </nav>

      {/* Section 1: Kinetic Hero */}
      <HeroSection onGetStarted={onGetStarted} />

      {/* Section 2: Experience / Bento */}
      <AboutSection />

      {/* Section 3: Upcoming Headliners */}
      <EventShowcase onGetStarted={onGetStarted} />

      {/* Section 4: Campus Voices Marquee */}
      <FeedbackSection />

      {/* Footer */}
      <footer className="w-full py-10 px-6 text-center text-slate-500 text-xs sm:text-sm border-t border-white/[0.06] bg-[#06080D]">
        <p>&copy; {new Date().getFullYear()} Eventify Pro. Campus Events, Hackathons &amp; Live Passes.</p>
      </footer>
    </div>
  );
};

export default LandingHero;
