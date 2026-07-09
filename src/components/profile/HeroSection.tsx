import React, { useEffect, useRef } from 'react';
import ParallaxSection from './ParallaxSection';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
// import profileImg from '../../assets/image/izal_profile_portrait.png';
import InteractiveLanyard from './InteractiveLanyard';

const HeroSection: React.FC = () => {
    const { t, language } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);

    // Set up motion values for cursor coordinates
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Track mouse coordinates globally on the window to prevent text/element blocking
    useEffect(() => {
        const handleMouseMoveGlobal = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();

            // Calculate coordinates relative to the HeroSection container
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
        };

        // Initialize position to the center of the screen
        const initCenter = () => {
            mouseX.set(window.innerWidth / 2);
            mouseY.set(window.innerHeight / 2);
        };
        initCenter();

        window.addEventListener('mousemove', handleMouseMoveGlobal, { passive: true });
        window.addEventListener('resize', initCenter);

        return () => {
            window.removeEventListener('mousemove', handleMouseMoveGlobal);
            window.removeEventListener('resize', initCenter);
        };
    }, [mouseX, mouseY]);

    // Spotlight gradient mask style (radius 100px)
    const maskBg = useMotionTemplate`radial-gradient(100px circle at ${mouseX}px ${mouseY}px, white 0%, transparent 100%)`;

    // Multilingual labels
    const labels = {
        EN: {
            role_label: "3D Generalist & AI Web Developer",
            badge_text: "Turning ideas into powerful digital experiences.",
            avail_label: "Available Worldwide",
            freelance_label: "Available for Freelance",
        },
        ID: {
            role_label: "3D Generalist dan AI Web Developer",
            badge_text: "Mengubah ide menjadi karya digital yang luar biasa.",
            avail_label: "Terbuka Secara Global",
            freelance_label: "Terbuka Untuk Freelance",
        }
    }[language] || {
        role_label: "3D Generalist & AI Web Developer",
        badge_text: "Turning ideas into powerful digital experiences.",
        avail_label: "Available Worldwide",
        freelance_label: "Available for Freelance",
    };

    const customBg = (
        <div
            ref={containerRef}
            id="hero-section-container"
            className="absolute inset-0 z-0 overflow-hidden bg-[#060606]"
        >
            {/* Base static dot grid (visible everywhere at 12% opacity, spaced at 16px) */}
            <div
                className="absolute inset-0 opacity-100 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1.2px, transparent 1.2px)',
                    backgroundSize: '16px 16px',
                }}
            />

            {/* Glowing illuminated dot grid centered on mouse */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.9) 1.2px, transparent 1.2px)',
                    backgroundSize: '16px 16px',
                    maskImage: maskBg,
                    WebkitMaskImage: maskBg,
                }}
            />
        </div>
    );

    return (
        <ParallaxSection
            customBackground={customBg}
            className="min-h-screen !items-center !justify-center relative"
        >
            {/* 3D Depth Layer: Repositioned & stretched "PORTOFOLIO" text aligned to content margins and gradient fading upwards */}
            <div className="absolute left-4 sm:left-6 md:left-16 lg:left-24 xl:left-32 right-4 sm:right-6 md:right-16 lg:right-24 xl:right-32 top-[25%] lg:top-[30%] flex items-start justify-center pointer-events-none z-10 select-none">
                <h2
                    className="font-bebas text-[25vw] lg:text-[22vw] uppercase bg-gradient-to-b from-purple-500/35 via-cyan-400/10 to-transparent bg-clip-text text-transparent select-none text-center leading-none w-full"
                    style={{
                        transform: 'scaleY(2.2)',
                        letterSpacing: '0.01em',
                        textShadow: '0 0 50px rgba(6, 182, 212, 0.03)',
                    }}
                >
                    Portofolio
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center w-full min-h-screen pt-24 lg:pt-0 pb-16 lg:pb-0 relative z-20">

                {/* Absolute Lanyard Container: positioned middle-right, behind columns but in front of background */}
                <div className="absolute inset-y-0 right-[8%] sm:right-[15%] lg:right-[12%] xl:right-[15%] w-[240px] lg:w-[320px] z-10 pointer-events-none">
                    <InteractiveLanyard />
                </div>

                {/* Left Column: Greeting, Name, Description, Availability */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="col-span-1 lg:col-span-7 flex flex-col justify-center items-start text-left pointer-events-auto z-20"
                >
                    <span className="text-[10px] tracking-[0.25em] font-mono font-semibold text-cyan-400 uppercase mb-2">
                        {labels.role_label}
                    </span>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4 uppercase">
                        Baharuddin <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-400">Izha Al Sya'na</span>
                    </h1>

                    <p className="text-xs md:text-sm font-light text-neutral-400 leading-relaxed mb-6 max-w-sm">
                        {t('hero_desc')}
                    </p>

                    <div className="flex items-center space-x-2.5 text-[9px] font-mono tracking-widest text-neutral-500 uppercase border border-white/10 rounded-full px-4 py-1.5 bg-white/5 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                        <span>{labels.avail_label}</span>
                    </div>
                </motion.div>

                {/* Right Column: Mini Badge (Statistics list has been removed) */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="col-span-1 lg:col-span-5 flex flex-col justify-center items-start lg:items-end text-left lg:text-right pointer-events-auto z-20 gap-6"
                >
                    {/* Freelance & Sparkle Badge */}
                    <div className="flex flex-col lg:items-end gap-3">
                        <div className="flex items-center space-x-2.5 text-[11px] lg:text-[12px] font-semibold font-mono tracking-widest text-neutral-400 uppercase border border-white/10 rounded-full px-4 py-1.5 bg-white/5 backdrop-blur-md">
                            <span>{labels.freelance_label}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400 animate-pulse">
                                <path d="M12 0c.2 4.2 3.8 7.8 8 8-4.2.2-7.8 3.8-8 8-.2-4.2-3.8-7.8-8-8 4.2-.2 7.8-3.8 8-8z" />
                            </svg>
                        </div>
                        <p className="text-[13px] lg:text-[14px] font-light text-neutral-400 max-w-[200px] leading-relaxed">
                            {labels.badge_text}
                        </p>
                    </div>
                </motion.div>

            </div>
        </ParallaxSection>
    );
};

export default HeroSection;
