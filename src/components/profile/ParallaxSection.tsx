import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface ParallaxSectionProps {
    children: React.ReactNode;
    backgroundImage?: string;
    customBackground?: React.ReactNode;
    className?: string;
    backgroundPosition?: string;
}

function useParallax(value: MotionValue<number>, distance: number) {
    return useTransform(value, [0, 1], [-distance, distance]);
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({ children, backgroundImage, customBackground, className = "", backgroundPosition = "center" }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useParallax(scrollYProgress, 20);

    return (
        <section
            ref={ref}
            className={`relative flex items-start md:items-center justify-center overflow-hidden md:sticky md:top-0 md:h-screen ${className}`}
            style={{
                boxShadow: '0 -4px 30px rgba(0,0,0,0.8)',
                zIndex: 0
            }}
        >
            {backgroundImage && (
                <div className="absolute inset-0 z-0">
                    <motion.div
                        className={`w-full h-[120%] bg-cover absolute top-[-10%]`}
                        style={{ y, backgroundPosition }}
                        initial={{ scale: 1.05 }}
                    >
                        <div
                            className="w-full h-full bg-cover"
                            style={{
                                backgroundImage: `url(${backgroundImage})`,
                                backgroundPosition: backgroundPosition
                            }}
                        />
                        <div className="absolute inset-0 bg-black/80" />
                    </motion.div>
                </div>
            )}

            {customBackground && (
                <div className="absolute inset-0 z-0">
                    {customBackground}
                </div>
            )}

            <div className="relative z-10 w-full max-w-none px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 pointer-events-none py-6 md:py-0">
                <div className="pointer-events-auto">
                    {children}
                </div>
            </div>
        </section>
    );
};

export default ParallaxSection;
