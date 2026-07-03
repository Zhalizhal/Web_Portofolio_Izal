import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import FullScreenMenu from './FullScreenMenu';
import { useLanguage } from '../../context/LanguageContext';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* 
                Layer 1 (z-38): Dark gradient overlay — fades from dark to transparent downward.
                Ensures navbar text is readable without a solid box background.
            */}
            {scrolled && (
                <div
                    className="fixed top-0 left-0 w-full pointer-events-none"
                    style={{
                        zIndex: 38,
                        height: '150px',
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 45%, transparent 100%)',
                    }}
                />
            )}

            {/* 
                Layer 2 (z-39): Backdrop blur that fades out downward using CSS mask.
                This is what creates the "blurry edge" — content under this area is blurred,
                and the blur gradually disappears toward the bottom of the overlay.
            */}
            {scrolled && (
                <div
                    className="fixed top-0 left-0 w-full pointer-events-none"
                    style={{
                        zIndex: 39,
                        height: '150px',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        maskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)',
                    }}
                />
            )}

            {/* 
                Layer 3 (z-40): The actual navbar — fully transparent background.
                Text sits on top of the blur/gradient layers below, no solid box.
            */}
            <motion.nav
                className={`fixed top-0 left-0 w-full z-40 px-4 py-4 md:px-12 md:py-6 flex justify-between items-center text-white transition-all duration-500 ${
                    scrolled
                        ? 'bg-transparent'
                        : 'bg-transparent mix-blend-difference'
                }`}
            >
                {/* Brand - Fades out when menu is open */}
                <Link
                    to="/"
                    className={`font-bold text-sm md:text-2xl tracking-tighter uppercase transition-opacity duration-300 ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'} max-w-[70%] leading-tight`}
                >
                    BAHARUDDIN IZHA AL SYA'NA
                </Link>

                {/* Language Switch and Menu */}
                <div className="flex items-center space-x-4 md:space-x-8">
                    {/* Switcher */}
                    <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full p-0.5 border border-white/20 select-none scale-90 md:scale-100 origin-right">
                        <button
                            onClick={() => setLanguage('EN')}
                            className={`px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-extrabold tracking-wider transition-all duration-300 cursor-pointer ${language === 'EN' ? 'bg-white text-black font-black' : 'text-white/60 hover:text-white'}`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLanguage('ID')}
                            className={`px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-extrabold tracking-wider transition-all duration-300 cursor-pointer ${language === 'ID' ? 'bg-white text-black font-black' : 'text-white/60 hover:text-white'}`}
                        >
                            ID
                        </button>
                    </div>

                    {/* Hamburger Trigger */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="flex items-center space-x-2 md:space-x-3 group cursor-pointer"
                    >
                        <span className="font-medium text-xs md:text-base tracking-wide group-hover:text-gray-300 transition-colors">
                            {t('menu_trigger')}
                        </span>
                        <div className="flex flex-col space-y-1 md:space-y-1.5 w-6 md:w-8 items-end">
                            <div className="w-6 md:w-8 h-0.5 bg-white group-hover:bg-gray-300 transition-colors"></div>
                            <div className="w-4 md:w-6 h-0.5 bg-white group-hover:bg-gray-300 transition-colors"></div>
                            <div className="w-6 md:w-8 h-0.5 bg-white group-hover:bg-gray-300 transition-colors"></div>
                        </div>
                    </button>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isMenuOpen && <FullScreenMenu onClose={() => setIsMenuOpen(false)} />}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
