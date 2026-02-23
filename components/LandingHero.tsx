import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import GlassmorphismTrustHero from './ui/glassmorphism-trust-hero';

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

            {/* Main Hero Section */}
            <section className="w-full relative z-10 bg-black">
                <GlassmorphismTrustHero onGetStarted={onGetStarted} />
            </section>

            {/* Footer space */}
            <div className="w-full py-8 text-center text-gray-500 text-sm shrink-0 border-t border-white/5 z-10 bg-black backdrop-blur-sm">
                © {new Date().getFullYear()} Eventify Pro. All rights reserved.
            </div>
        </div>
    );
};

export default LandingHero;
