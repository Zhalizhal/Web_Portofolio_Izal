import React from 'react';
import ParallaxSection from './ParallaxSection';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const HeroSection: React.FC = () => {
    const { t } = useLanguage();

    return (
        <ParallaxSection
            backgroundImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop"
            className="min-h-screen !items-end !justify-start pb-12 md:pb-32 pt-24 md:pt-0"
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-left w-full"
            >
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-4 md:mb-6 text-white leading-[1.1]">
                    Baharuddin Izha Al Sya'na
                </h1>
                <p className="text-base md:text-xl text-gray-300 max-w-xl leading-relaxed font-normal">
                    {t('hero_subtitle')} <br className="hidden md:block" />
                    {t('hero_desc')}
                </p>
            </motion.div>
        </ParallaxSection>
    );
};

export default HeroSection;
