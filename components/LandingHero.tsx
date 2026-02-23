import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { HeroSection } from './ui/hero-odyssey';
import InteractiveSelector from './ui/interactive-selector';

interface LandingHeroProps {
    onGetStarted: () => void;
}

const LandingHero = ({ onGetStarted }: LandingHeroProps) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="relative w-full bg-transparent">
            {/* Overlay Navbar - Preserving the Eventify-Pro styling */}
            <nav className="fixed top-0 left-0 right-0 z-[500] flex items-center justify-between px-4 md:px-8 py-4 bg-transparent border-b border-white/5 backdrop-blur-sm pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <Sparkles size={22} className="text-amber-400" />
                    <span className="text-xl font-bold text-white tracking-tight">
                        Eventify Pro
                    </span>
                </div>
                <button
                    onClick={onGetStarted}
                    className="pointer-events-auto px-5 py-2 rounded-xl text-sm font-semibold border border-white/15 bg-white/10 text-white hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-md"
                    aria-label="Sign in to Eventify Pro"
                >
                    Sign In
                </button>
            </nav>

            {/* First Stacked Section: Hero */}
            <section className="h-screen w-full relative sticky top-0 z-10 bg-black">
                <HeroSection onGetStarted={onGetStarted} />
            </section>

            {/* Second Stacked Section: Interactive Selector */}
            {/* The min-h-screen makes it take full space, rounding the top makes it look like a slide-up card */}
            <section className="min-h-screen w-full relative z-20 bg-black rounded-t-[3rem] overflow-hidden border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col pt-12">
                {/* Radial ambient glow to match hero context inside the wrapper */}
                <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl pointer-events-none"></div>

                {/* Content expands to push footer down */}
                <div className="w-full flex-grow flex flex-col items-center z-10">
                    <InteractiveSelector />
                </div>

                {/* Footer space inside second stacked section */}
                <div className="w-full py-8 mt-12 text-center text-gray-500 text-sm shrink-0 border-t border-white/5 z-10 bg-black/50 backdrop-blur-sm">
                    © {new Date().getFullYear()} Eventify Pro. All rights reserved.
                </div>
            </section>
        </div>
    );
};

export default LandingHero;
