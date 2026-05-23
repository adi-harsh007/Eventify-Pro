import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
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
        <div className="relative w-full bg-zinc-950">
            {/* Overlay Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-[500] flex items-center justify-between px-4 md:px-8 py-4 bg-zinc-950/60 border-b border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                    <Sparkles size={22} className="text-amber-400" />
                    <span className="text-xl font-bold text-white tracking-tight">
                        Eventify Pro
                    </span>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                    <a href="#about-section" className="text-sm text-zinc-400 hover:text-white transition-colors">About</a>
                    <a href="#events-section" className="text-sm text-zinc-400 hover:text-white transition-colors">Events</a>
                    <a href="#feedback-section" className="text-sm text-zinc-400 hover:text-white transition-colors">Reviews</a>
                </div>
                <button
                    onClick={onGetStarted}
                    className="px-5 py-2 rounded-xl text-sm font-semibold border border-white/15 bg-white/10 text-white hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-md"
                    aria-label="Sign in to Eventify Pro"
                >
                    Sign In
                </button>
            </nav>


            {/* Section 1b: About / Vision */}
            <AboutSection />

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

            {/* Section 2: Event Showcase */}
            <EventShowcase onGetStarted={onGetStarted} />

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

            {/* Section 3: Feedback & Reviews */}
            <FeedbackSection />

            {/* Footer */}
            <div className="w-full py-8 text-center text-gray-500 text-sm shrink-0 border-t border-white/5 z-10 backdrop-blur-sm">
                © {new Date().getFullYear()} Eventify Pro. All rights reserved.
            </div>
        </div>
    );
};

export default LandingHero;
