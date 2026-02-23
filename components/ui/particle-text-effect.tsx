import React, { useEffect, useRef } from 'react';

interface ParticleTextEffectProps {
    text?: string;
    fontSize?: number;
    color?: string;
    glowColor?: string;
    className?: string;
}

interface Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    vx: number;
    vy: number;
    alpha: number;
    size: number;
}

const ParticleTextEffect: React.FC<ParticleTextEffectProps> = ({
    text = 'Eventify Pro',
    fontSize = 80,
    color = '#3B82F6',
    glowColor = '#6366F1',
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -9999, y: -9999 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = (canvas.width = canvas.offsetWidth);
        let height = (canvas.height = canvas.offsetHeight);

        // ── Sample text pixels ───────────────────────────────
        function sampleTextPixels(): { x: number; y: number }[] {
            const offscreen = document.createElement('canvas');
            const responsiveFontSize = Math.min(fontSize, width * 0.12);
            offscreen.width = width;
            offscreen.height = height;
            const oc = offscreen.getContext('2d')!;

            oc.fillStyle = '#ffffff';
            let finalFontSize = responsiveFontSize;
            oc.font = `bold ${finalFontSize}px Inter, system-ui, sans-serif`;

            // Scale down if text is too wide
            while (oc.measureText(text).width > width * 0.9 && finalFontSize > 10) {
                finalFontSize -= 2;
                oc.font = `bold ${finalFontSize}px Inter, system-ui, sans-serif`;
            }

            oc.textAlign = 'center';
            oc.textBaseline = 'middle';
            oc.fillText(text, width / 2, height / 2);

            const imageData = oc.getImageData(0, 0, width, height).data;
            const points: { x: number; y: number }[] = [];
            const gap = 5;

            for (let y = 0; y < height; y += gap) {
                for (let x = 0; x < width; x += gap) {
                    const idx = (y * width + x) * 4;
                    if (imageData[idx + 3] > 128) {
                        points.push({ x, y });
                    }
                }
            }
            return points;
        }

        // ── Build particles ──────────────────────────────────
        function buildParticles() {
            const points = sampleTextPixels();
            particlesRef.current = points.map(p => ({
                x: Math.random() * width,
                y: Math.random() * height,
                originX: p.x,
                originY: p.y,
                vx: 0,
                vy: 0,
                alpha: 0,
                size: Math.random() * 1.5 + 1,
            }));
        }

        buildParticles();

        // ── Animation loop ───────────────────────────────────
        let tick = 0;

        function animate() {
            ctx.clearRect(0, 0, width, height);
            tick++;

            // Mouse repulsion radius
            const repelRadius = 80;
            const repelStrength = 4;

            particlesRef.current.forEach(p => {
                // Attraction to origin
                const dx = p.originX - p.x;
                const dy = p.originY - p.y;
                p.vx += dx * 0.08;
                p.vy += dy * 0.08;

                // Mouse repulsion
                const mdx = p.x - mouseRef.current.x;
                const mdy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (dist < repelRadius) {
                    const force = (repelRadius - dist) / repelRadius;
                    p.vx += (mdx / dist) * force * repelStrength;
                    p.vy += (mdy / dist) * force * repelStrength;
                }

                // Damping
                p.vx *= 0.88;
                p.vy *= 0.88;

                p.x += p.vx;
                p.y += p.vy;

                // Fade in
                if (p.alpha < 1) p.alpha += 0.015;

                // Draw particle with glow
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.shadowBlur = 8;
                ctx.shadowColor = glowColor;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            animationRef.current = requestAnimationFrame(animate);
        }

        animate();

        // ── Mouse tracking ───────────────────────────────────
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };
        canvas.addEventListener('mousemove', handleMouseMove);

        // ── Touch support ────────────────────────────────────
        const handleTouchMove = (e: TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const t = e.touches[0];
            mouseRef.current = {
                x: t.clientX - rect.left,
                y: t.clientY - rect.top,
            };
        };
        canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

        // ── Resize handler ───────────────────────────────────
        const handleResize = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
            buildParticles();
        };
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(canvas);

        return () => {
            cancelAnimationFrame(animationRef.current);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('touchmove', handleTouchMove);
            resizeObserver.disconnect();
        };
    }, [text, fontSize, color, glowColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`w-full h-full ${className}`}
            style={{ display: 'block' }}
        />
    );
};

export { ParticleTextEffect };
