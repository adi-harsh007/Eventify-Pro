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
        <div className="bg-[#0B0F19] min-h-screen text-slate-200 relative">
            {/* ── Overlay Navbar ── */}
            <nav
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 32px',
                    background: 'transparent',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={22} style={{ color: '#fb923c' }} />
                    <span
                        style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#fff',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Eventify Pro
                    </span>
                </div>
                <button
                    onClick={onGetStarted}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.15)',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
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
