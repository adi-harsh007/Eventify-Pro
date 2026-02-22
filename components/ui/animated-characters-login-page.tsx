"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { User } from '../../types';
import { apiLogin, apiSignup, apiGoogleLogin, apiSendOtp, apiForgotPassword, apiResetPassword } from '../../apiService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

import { useGoogleLogin } from '@react-oauth/google';

interface AnimatedLoginPageProps {
    onLogin: (user: User, token: string) => void;
    onNavigateHome?: () => void;
}

const FlickeringGrid = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        const dots: { baseX: number; currentX: number; baseY: number; opacity: number; speed: number; maxOpacity: number; entranceSpeed: number }[] = [];
        const gap = 16; // Distance between dots
        const size = 3.0; // Increased dot size (square) for more volume

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let isMouseMoving = false;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMouseMoving = true;
        };

        const handleMouseLeave = () => {
            isMouseMoving = false;
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.body.addEventListener("mouseleave", handleMouseLeave);

        const resize = () => {
            // Setup canvas for high DPI displays to prevent blurriness
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);
            initDots();
        };

        const initDots = () => {
            dots.length = 0;
            const cols = Math.floor(window.innerWidth / gap) + 4;
            const rows = Math.floor(window.innerHeight / gap) + 4;
            const screenCenter = window.innerWidth / 2;
            for (let i = -2; i <= cols; i++) {
                for (let j = -2; j <= rows; j++) {
                    // Create a more dynamic range: most dots are dim, some are bright
                    const isBright = Math.random() > 0.85;
                    const bX = i * gap;
                    const startOffset = Math.random() * 800 + 200;
                    dots.push({
                        baseX: bX,
                        currentX: bX < screenCenter ? -startOffset : window.innerWidth + startOffset,
                        baseY: j * gap,
                        opacity: Math.random() * (isBright ? 0.8 : 0.1),
                        speed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
                        maxOpacity: isBright ? (Math.random() * 0.5 + 0.3) : (Math.random() * 0.15 + 0.05),
                        entranceSpeed: Math.random() * 0.04 + 0.015 // Slightly faster sweep
                    });
                }
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.fillStyle = "#ffffff";

            // Parallax offset based on mouse
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            // Only apply strong parallax if mouse is over the page
            const targetOffsetX = isMouseMoving ? (mouseX - centerX) * 0.05 : 0;
            const targetOffsetY = isMouseMoving ? (mouseY - centerY) * 0.05 : 0;

            for (const dot of dots) {
                dot.opacity += dot.speed;
                // Reverse direction when hitting limits
                if (dot.opacity >= dot.maxOpacity) {
                    dot.opacity = dot.maxOpacity;
                    dot.speed *= -1;
                } else if (dot.opacity <= 0.02) {
                    dot.opacity = 0.02;
                    dot.speed *= -1;
                }

                // Entrance flow animation
                dot.currentX += (dot.baseX - dot.currentX) * dot.entranceSpeed;
                const isEntering = Math.abs(dot.baseX - dot.currentX) > 5;

                const x = dot.currentX - targetOffsetX;
                const y = dot.baseY - targetOffsetY;

                let renderOpacity = dot.opacity;
                if (isEntering) {
                    // Make them glow brightly while flying in so they are very visible
                    renderOpacity = Math.min(1, renderOpacity + 0.8);
                }
                let renderX = x;
                let renderY = y;

                if (isMouseMoving) {
                    const dx = x - mouseX;
                    const dy = y - mouseY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const interactionRadius = 180;

                    if (distance < interactionRadius) {
                        const normalizedDist = distance / interactionRadius;
                        // Glow brighter when near mouse
                        renderOpacity = Math.min(1, renderOpacity + (1 - normalizedDist) * 1.2);

                        // Pull dots slightly towards mouse to create "folding sheet" deformation
                        const pullStrength = 18 * Math.pow(1 - normalizedDist, 2);
                        if (distance > 0) {
                            renderX -= (dx / distance) * pullStrength;
                            renderY -= (dy / distance) * pullStrength;
                        }
                    }
                }

                ctx.globalAlpha = renderOpacity;
                ctx.fillRect(renderX, renderY, size, size);
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener("resize", resize);
        resize();
        draw();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="absolute inset-0 z-0 h-full w-full bg-background overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {/* Soft radial glow in the center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-white/5 blur-[120px] pointer-events-none" />
            {/* Gradients to fade out edges like the original image */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-[#030303] pointer-events-none" />
        </div>
    );
};

function AnimatedLoginPage({ onLogin, onNavigateHome }: AnimatedLoginPageProps) {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const loginWithGoogle = useGoogleLogin({
        flow: 'implicit',
        onSuccess: async (tokenResponse) => {
            setError('');
            setIsLoading(true);
            try {
                // Pass the Access Token directly to our matching verified backend route
                const data = await apiGoogleLogin(tokenResponse.access_token);
                onLogin(data.user, data.token);
            } catch (err: any) {
                setError(err.message || 'Google authentication failed');
                setIsLoading(false);
            }
        },
        onError: () => {
            setError('Google Sign-In Failed. Please try again.');
            setIsLoading(false);
        }
    });

    const handleGoogleLogin = () => {
        setError('');
        setIsLoading(true);
        loginWithGoogle();
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="flex w-full min-h-screen items-center justify-center bg-background text-white relative overflow-hidden font-sans">
            <FlickeringGrid />

            {/* Floating Nav */}
            <motion.nav
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-2 py-2 border border-white/10 rounded-full bg-[#0a0a0a]/80 backdrop-blur-xl z-20 shadow-2xl"
            >
                <div className="flex items-center gap-2 cursor-pointer pl-4 pr-3 text-sm text-white/80 hover:text-white transition-colors" onClick={onNavigateHome}>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span>Go to landing page</span>
                </div>
            </motion.nav>

            <div className="relative z-10 w-full max-w-[360px] px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex flex-col w-full"
                    >
                        {/* Header Section */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 leading-tight">
                                Eventify Pro
                            </h1>
                            <p className="text-white/50 text-lg font-light">
                                Campus Access
                            </p>
                        </div>

                        {/* SSO Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full h-[46px] flex items-center justify-center gap-3 bg-[#0a0a0a] border border-white/10 rounded-full text-white/90 font-medium hover:bg-white/5 hover:border-white/20 transition-all group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <svg className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="text-[14px]">Sign in with Google</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[13px] text-red-400/90 text-center px-4 mt-4">{error}</motion.div>
                        )}

                        <div className="mt-12 text-center">
                            <p className="text-[12px] text-white/30 leading-relaxed max-w-[320px] mx-auto">
                                By signing in, you agree to the <span className="underline decoration-white/20 hover:text-white/60 cursor-pointer">Terms of Service</span> and <span className="underline decoration-white/20 hover:text-white/60 cursor-pointer">Privacy Policy</span>.
                            </p>
                        </div>

                        <div className="mt-16 text-center">
                            <p className="text-sm font-medium italic text-white/40 max-w-[280px] mx-auto">
                                "Ideas are easy. Implementation is hard. Gather your people and make it happen."
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export { AnimatedLoginPage };
export const Component = AnimatedLoginPage;
