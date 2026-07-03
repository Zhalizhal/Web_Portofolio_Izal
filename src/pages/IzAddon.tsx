import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const IzAddon: React.FC = () => {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute inset-0 bg-radial-gradient from-neutral-900/50 to-black pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="text-center z-10 px-4">
                <motion.h1
                    initial={{ opacity: 0, letterSpacing: '0.1em' }}
                    animate={{ opacity: 1, letterSpacing: '0.25em' }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="text-4xl md:text-6xl font-bold tracking-[0.25em] uppercase text-white mb-4"
                >
                    IZ ADDON
                </motion.h1>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="h-[1px] w-24 bg-neutral-800 mx-auto mb-6"
                />
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-sm md:text-base font-light tracking-[0.15em] text-neutral-400 uppercase font-mono"
                >
                    {language === 'EN' ? 'Coming Soon' : 'Segera Hadir'}
                </motion.p>
            </div>
        </div>
    );
};

export default IzAddon;
