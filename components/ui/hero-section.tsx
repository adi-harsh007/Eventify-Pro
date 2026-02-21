// components/ui/hero-section-2.tsx
"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Globe, Phone, MapPin } from 'lucide-react';

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: {
    url: string;
    alt: string;
    text?: string;
  };
  slogan?: string;
  title: React.ReactNode;
  subtitle: string;
  callToAction: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  backgroundImage: string;
  contactInfo: {
    website: string;
    phone: string;
    address: string;
  };
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ className, logo, slogan, title, subtitle, callToAction, backgroundImage, contactInfo, ...props }, ref) => {

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 },
      },
    };

    const itemVariants = {
      hidden: { y: 40, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, // Smoother custom spring-like easing
      },
    };

    return (
      <motion.section
        ref={ref}
        className={cn(
          "relative flex w-full flex-col overflow-hidden bg-[#0B0F19] text-white md:flex-row min-h-screen",
          className
        )}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        {...props}
      >
        {/* Left Side: Content */}
        <div className="flex w-full flex-col justify-center p-8 md:w-3/5 md:p-12 lg:w-[60%] lg:p-16 z-10 bg-[#0B0F19]">
          <div className="mt-16">
            <motion.main variants={containerVariants}>
              <motion.h1 className="text-4xl font-black leading-[1.1] md:text-6xl lg:text-[4.5rem] tracking-tight text-white" variants={itemVariants}>
                {title}
              </motion.h1>
              <motion.div className="my-8 h-1 w-20 bg-blue-500" variants={itemVariants}></motion.div>
              <motion.p className="mb-10 max-w-lg text-lg text-neutral-400 font-light leading-relaxed" variants={itemVariants}>
                {subtitle}
              </motion.p>
              {callToAction.href ? (
                <motion.a
                  href={callToAction.href}
                  className="inline-block border border-white/20 bg-transparent px-8 py-4 text-[13px] font-bold tracking-[0.15em] uppercase text-white transition-all hover:bg-white hover:text-black rounded-none"
                  variants={itemVariants}
                >
                  {callToAction.text}
                </motion.a>
              ) : (
                <motion.button
                  onClick={callToAction.onClick}
                  className="inline-block border border-white/20 bg-transparent px-8 py-4 text-[13px] font-bold tracking-[0.15em] uppercase text-white transition-all hover:bg-white hover:text-black rounded-none"
                  variants={itemVariants}
                >
                  {callToAction.text}
                </motion.button>
              )}
            </motion.main>
          </div>

          {/* Bottom Section: Footer Info */}
          <motion.footer className="mt-12 w-full" variants={itemVariants}>
            <div className="grid grid-cols-1 gap-6 text-xs text-neutral-500 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-neutral-400" />
                <span>{contactInfo.website}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-neutral-400" />
                <span>{contactInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span>{contactInfo.address}</span>
              </div>
            </div>
          </motion.footer>
        </div>

        {/* Right Side: Image with Clip Path Animation */}
        <div className="absolute inset-0 md:relative md:w-2/5 lg:w-[40%] md:flex-1 stretch self-stretch z-0 overflow-hidden">
          <motion.img
            src={backgroundImage}
            alt="Hero Visual"
            className="w-full h-full object-cover absolute inset-0 md:opacity-100 opacity-40 object-center"
            initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
            animate={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          />
          {/* Gradient overlay for mobile readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent md:hidden" />
        </div>
      </motion.section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };