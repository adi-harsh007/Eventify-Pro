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
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtpField, setShowOtpField] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    // Forgot password state
    const [forgotMode, setForgotMode] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetOtp, setResetOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [resetStep, setResetStep] = useState<'email' | 'otp'>('email');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!EMAIL_REGEX.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                const data = await apiLogin(email, password);
                onLogin(data.user, data.token);
            } else {
                if (password.length < 6) {
                    setError('Password must be at least 6 characters');
                    setIsLoading(false);
                    return;
                }

                if (!showOtpField) {
                    // Step 1: Send OTP
                    await apiSendOtp(email, name);
                    setShowOtpField(true);
                    setError("OTP sent to your email.");
                } else {
                    // Step 2: Verify & Signup
                    if (otp.length !== 6) {
                        setError("OTP must be exactly 6 digits.");
                        setIsLoading(false);
                        return;
                    }
                    const data = await apiSignup(name, email, password, otp);
                    onLogin(data.user, data.token);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

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
            setError('Google Sign-In Failed. Please try again or use Email/Password.');
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
                <div className="flex items-center gap-2 cursor-pointer pl-4" onClick={onNavigateHome}>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                    </div>
                </div>



                <div className="flex items-center gap-1 pr-1">
                    <button
                        onClick={() => { setIsLogin(true); setError(""); setSuccessMsg(""); setShowOtpField(false); setForgotMode(false); }}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[12px] font-medium transition-all shadow-sm",
                            isLogin && !showOtpField && !forgotMode ? "bg-white text-black drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setError(""); setSuccessMsg(""); setForgotMode(false); }}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[12px] font-medium transition-all shadow-sm",
                            !isLogin || showOtpField ? "bg-white text-black drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Signup
                    </button>
                </div>
            </motion.nav>

            <div className="relative z-10 w-full max-w-[360px] px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLogin ? "login" : "signup"}
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
                                {forgotMode ? 'Reset Password' : 'Campus Access'}
                            </p>
                        </div>

                        {/* Forgot Password Flow */}
                        {forgotMode ? (
                            <div className="flex flex-col gap-3">
                                <AnimatePresence mode="wait">
                                    {resetStep === 'email' ? (
                                        <motion.div
                                            key="reset-email"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="flex flex-col gap-3"
                                        >
                                            <p className="text-[13px] text-white/50 text-center mb-1">Enter your email to receive a reset code.</p>
                                            <div className="relative group">
                                                <input
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    value={resetEmail}
                                                    onChange={(e) => setResetEmail(e.target.value)}
                                                    className="w-full h-[46px] bg-[#0a0a0a] border border-white/10 rounded-full px-5 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.03] transition-all"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                disabled={isLoading || !resetEmail}
                                                onClick={async () => {
                                                    setError(''); setSuccessMsg(''); setIsLoading(true);
                                                    try {
                                                        await apiForgotPassword(resetEmail);
                                                        setResetStep('otp');
                                                        setSuccessMsg('Reset code sent to your email!');
                                                    } catch (err: any) {
                                                        setError(err.message || 'Failed to send reset code.');
                                                    } finally {
                                                        setIsLoading(false);
                                                    }
                                                }}
                                                className="w-full h-[46px] flex items-center justify-center gap-2 bg-white text-black font-medium rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="reset-otp"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="flex flex-col gap-3"
                                        >
                                            <p className="text-[13px] text-white/50 text-center mb-1">Enter the code sent to <span className="text-white font-medium">{resetEmail}</span></p>
                                            <input
                                                type="text"
                                                placeholder="••••••"
                                                value={resetOtp}
                                                onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                maxLength={6}
                                                className="w-full text-center tracking-[0.5em] font-mono h-[46px] bg-[#0a0a0a] border border-white/10 rounded-full px-5 text-[16px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.03] transition-all"
                                            />
                                            <input
                                                type="password"
                                                placeholder="New Password (min 6 chars)"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                minLength={6}
                                                className="w-full h-[46px] bg-[#0a0a0a] border border-white/10 rounded-full px-5 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.03] transition-all"
                                            />
                                            <button
                                                type="button"
                                                disabled={isLoading || resetOtp.length !== 6 || newPassword.length < 6}
                                                onClick={async () => {
                                                    setError(''); setSuccessMsg(''); setIsLoading(true);
                                                    try {
                                                        await apiResetPassword(resetEmail, resetOtp, newPassword);
                                                        setSuccessMsg('Password reset successful!');
                                                        setForgotMode(false);
                                                        setIsLogin(true);
                                                        setResetStep('email');
                                                        setResetEmail(''); setResetOtp(''); setNewPassword('');
                                                    } catch (err: any) {
                                                        setError(err.message || 'Failed to reset password.');
                                                    } finally {
                                                        setIsLoading(false);
                                                    }
                                                }}
                                                className="w-full h-[46px] flex items-center justify-center gap-2 bg-white text-black font-medium rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setResetStep('email'); setResetOtp(''); setNewPassword(''); setError(''); setSuccessMsg(''); }}
                                                className="text-[12px] text-white/50 hover:text-white underline decoration-white/20 transition-all text-center"
                                            >
                                                Change Email or Resend Code
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="button"
                                    onClick={() => { setForgotMode(false); setError(''); setSuccessMsg(''); setResetStep('email'); }}
                                    className="text-[12px] text-white/50 hover:text-white mt-2 transition-all text-center"
                                >
                                    ← Back to Login
                                </button>

                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[13px] text-red-400/90 text-center px-4 mt-1">{error}</motion.div>
                                )}
                                {successMsg && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[13px] text-emerald-400/90 text-center px-4 mt-1">{successMsg}</motion.div>
                                )}
                            </div>
                        ) : (
                            <>
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

                                <div className="flex items-center gap-4 my-6 opacity-60">
                                    <div className="h-px bg-white/10 flex-1" />
                                    <span className="text-white/40 text-[10px] uppercase tracking-widest px-2">or</span>
                                    <div className="h-px bg-white/10 flex-1" />
                                </div>

                                {/* Traditional Form */}
                                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                    <AnimatePresence mode="popLayout">
                                        {showOtpField ? (
                                            <motion.div
                                                key="otp-step"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="relative group flex flex-col gap-3"
                                            >
                                                <div className="text-center mb-2">
                                                    <p className="text-[14px] text-white/70">Enter the 6-digit code sent to<br /><span className="text-white font-medium">{email}</span></p>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="••••••"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    required
                                                    maxLength={6}
                                                    className="w-full text-center tracking-[0.5em] font-mono h-[46px] bg-[#0a0a0a] border border-white/10 rounded-full px-5 text-[16px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.03] transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowOtpField(false); setOtp(''); setError(''); }}
                                                    className="text-[12px] text-white/50 hover:text-white mt-1 underline decoration-white/20 transition-all text-center"
                                                >
                                                    Change Email or Resend OTP
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isLoading || otp.length !== 6}
                                                    className="w-full h-[46px] mt-2 flex items-center justify-center gap-2 bg-white text-black font-medium rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                                >
                                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Create Account"}
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="credentials-step"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="flex flex-col gap-3"
                                            >
                                                {!isLogin && (
                                                    <div className="relative group">
                                                        <input
                                                            type="text"
                                                            placeholder="Full Name"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            required
                                                            className="w-full h-[46px] bg-[#0a0a0a] border border-white/10 rounded-full px-5 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.03] transition-all"
                                                        />
                                                    </div>
                                                )}

                                                <div className="relative group">
                                                    <input
                                                        type="email"
                                                        placeholder="student@university.edu"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                        className="w-full h-[46px] bg-[#0a0a0a] border border-white/10 rounded-full px-5 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.03] transition-all"
                                                    />
                                                </div>

                                                <div className="relative group">
                                                    <input
                                                        type="password"
                                                        placeholder="Password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                        minLength={isLogin ? undefined : 6}
                                                        className="w-full h-[46px] bg-[#0a0a0a] border border-white/10 rounded-full pl-5 pr-12 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.03] transition-all"
                                                    />

                                                    <button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isLoading ? <Loader2 className="w-[14px] h-[14px] animate-spin" /> : <ArrowRight className="w-[14px] h-[14px]" />}
                                                    </button>
                                                </div>

                                                {isLogin && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { setForgotMode(true); setError(''); setSuccessMsg(''); setResetEmail(email); }}
                                                        className="text-[12px] text-white/40 hover:text-white/70 transition-all text-right pr-2 -mt-1"
                                                    >
                                                        Forgot Password?
                                                    </button>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                            className="text-[13px] text-red-400/90 text-center px-4 mt-2"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                    {successMsg && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                            className="text-[13px] text-emerald-400/90 text-center px-4 mt-2"
                                        >
                                            {successMsg}
                                        </motion.div>
                                    )}
                                </form>
                            </>
                        )}

                        <div className="mt-12 text-center">
                            <p className="text-[12px] text-white/30 leading-relaxed max-w-[320px] mx-auto">
                                By {isLogin ? 'signing in' : 'signing up'}, you agree to the <span className="underline decoration-white/20 hover:text-white/60 cursor-pointer">Terms of Service</span> and <span className="underline decoration-white/20 hover:text-white/60 cursor-pointer">Privacy Policy</span>.
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
