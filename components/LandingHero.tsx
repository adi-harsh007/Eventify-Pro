import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { HeroSection } from './ui/hero-odyssey';

interface LandingHeroProps {
    onGetStarted: () => void;
}

const LandingHero = ({ onGetStarted }: LandingHeroProps) => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className="relative overflow-hidden w-full h-screen">
            {/* Overlay Navbar - Preserving the Eventify-Pro styling */}
            <nav className="fixed top-0 left-0 right-0 z-[500] flex items-center justify-between px-4 md:px-8 py-4 bg-transparent border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Sparkles size={22} className="text-amber-400" />
                    <span className="text-xl font-bold text-white tracking-tight">
                        Eventify Pro
                    </span>
                </div>
                <button
                    onClick={onGetStarted}
                    className="px-5 py-2 rounded-xl text-sm font-semibold border border-white/15 bg-white/10 text-white hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-md"
                    aria-label="Sign in to Eventify Pro"
                >
                    Sign In
                </button>
            </nav>

            <HeroSection onGetStarted={onGetStarted} />
        </div>
    );
};

export default LandingHero;
