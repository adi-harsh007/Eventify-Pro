import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { HeroSection } from './ui/hero-section';
import HeroBentoGrid from './HeroBentoGrid';

interface LandingHeroProps {
    onGetStarted: () => void;
}

const LandingHero = ({ onGetStarted }: LandingHeroProps) => {
    // Reset scroll on mount to ensure the animation starts fresh
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-[#0B0F19] min-h-screen text-slate-200 relative overflow-x-hidden">
            {/* ── Overlay Navbar ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Sparkles size={22} className="text-amber-400" />
                    <span className="text-xl font-bold text-white tracking-tight">
                        Eventify Pro
                    </span>
                </div>
                <button
                    onClick={onGetStarted}
                    className="px-5 py-2 rounded-xl text-sm font-semibold border border-white/15 bg-white/10 text-white hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-0.5"
                    aria-label="Sign in to Eventify Pro"
                >
                    Sign In
                </button>
            </nav>

            <HeroSection
                title={
                    <>
                        <span className="block">Unforgettable</span>
                        <span className="block">Campus Events</span>
                    </>
                }
                subtitle="Discover, create, and manage the best university events. Your ultimate platform for everything happening around campus."
                backgroundImage="https://picsum.photos/id/352/1200/800" // Concert/event crowd image
                callToAction={{
                    text: 'JOIN US TO EXPLORE',
                    onClick: onGetStarted
                }}
                contactInfo={{
                    website: 'yourwebsite.com',
                    phone: '+1 (555) 000-0000',
                    address: '123 Explorer Way'
                }}
            />

            <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Featured Events</h2>
                    <p className="mt-4 text-lg text-slate-400">Don't miss out on what's happening around campus.</p>
                </div>
                <HeroBentoGrid onExploreClick={onGetStarted} />
            </div>
        </div>
    );
};

export default LandingHero;
