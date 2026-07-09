import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import robotImg from '../../assets/image/ai_guide_robot.png';

// Dialogues for English and Indonesian
const DIALOGUES = {
    EN: {
        intro: "Hi there! I am IzBot, Izal's AI guide companion. Welcome to this portfolio! Would you like a quick tour to explore Izal's 3D and development workspace?",
        profile: "You are on the About Page. Izal is a 3D Artist & Developer. You can check his professional work history at Svein Indonesia & Taksu Visual below, or review his software skills. Want to see his actual 3D works?",
        porto: "Here is the Portfolio Page! You can filter the projects by Category (Architecture, Animation, Game) or Software (Blender, Unity, etc.). Click on any project card to view detail images and videos.",
        addon: "This is the Iz Addon Page. Here you can explore custom interactive web features and experimental additions Izal has built!",
        admin: "This is the Admin Panel where Izal manages his portfolio projects.",
        faq_skills_q: "What are Izal's core skills?",
        faq_skills_a: "Izal has professional experience in Blender (modeling, rendering, animation), 3ds Max, SketchUp, and Unity. He also builds interactive web apps using React, TailwindCSS, and TypeScript!",
        faq_contact_q: "How can I contact Izal?",
        faq_contact_a: "I will guide you to his contact form right away! Let's scroll down to the bottom of the Profile page so you can send a message.",
        faq_history_q: "Where has he worked?",
        faq_history_a: "Izal is currently working as a 3D Visualizer at Taksu Visual (2026-present). Previously, he was an Assistant Project Manager & 3D Animator at Svein Indonesia (2022-2025). Check out the Education & Experience section on the Profile page for details!",
        btn_start: "Start Tour",
        btn_skip: "Skip Tour",
        btn_next: "Next",
        btn_close: "Dismiss",
        btn_ask: "Ask IzBot",
        btn_back: "Back",
        btn_porto: "Go to Portfolio",
        state_tour_ended: "Tour ended. Click me if you need help!",
    },
    ID: {
        intro: "Halo! Saya IzBot, asisten pemandu AI Izal. Selamat datang! Apakah kamu ingin tour singkat menjelajahi ruang kerja 3D dan pemrograman Izal?",
        profile: "Kamu berada di halaman Tentang. Izal adalah seorang 3D Artist & Developer. Kamu bisa melihat riwayat kerja profesionalnya di Svein Indonesia & Taksu Visual di bawah, atau keahlian software-nya. Ingin langsung melihat karya 3D-nya?",
        porto: "Ini adalah halaman Portofolio! Kamu bisa memfilter proyek berdasarkan Kategori (Arsitektur, Animasi, Game) atau Software (Blender, Unity, dll). Klik kartu proyek apa pun untuk melihat detail gambar dan video.",
        addon: "Ini adalah halaman Iz Addon. Di sini kamu bisa menjelajahi fitur web interaktif kustom dan eksperimen tambahan yang dibuat oleh Izal!",
        admin: "Ini adalah Panel Admin untuk mengelola data item portofolio Izal.",
        faq_skills_q: "Apa keahlian utama Izal?",
        faq_skills_a: "Izal memiliki pengalaman profesional dalam Blender (modeling, rendering, animasi), 3ds Max, SketchUp, dan Unity. Ia juga membangun aplikasi web interaktif menggunakan React, TailwindCSS, dan TypeScript!",
        faq_contact_q: "Bagaimana cara menghubungi Izal?",
        faq_contact_a: "Saya akan mengantarmu ke formulir kontak! Mari kita scroll ke bagian bawah halaman Profil agar kamu bisa mengirimkan pesan langsung.",
        faq_history_q: "Di mana saja Izal pernah bekerja?",
        faq_history_a: "Saat ini Izal bekerja sebagai 3D Visualizer di Taksu Visual (2026-sekarang). Sebelumnya, ia menjabat sebagai Asisten Project Manager & 3D Animator di Svein Indonesia (2022-2025). Detail lengkap ada di bagian Pendidikan & Pengalaman halaman Profil!",
        btn_start: "Mulai Tour",
        btn_skip: "Lewati",
        btn_next: "Lanjut",
        btn_close: "Tutup",
        btn_ask: "Tanya IzBot",
        btn_back: "Kembali",
        btn_porto: "Ke Portofolio",
        state_tour_ended: "Tour selesai. Klik saya jika butuh bantuan!",
    }
};

const AITourGuide: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language } = useLanguage();
    
    const [isMinimized, setIsMinimized] = useState(false);
    const [isTourActive, setIsTourActive] = useState(() => {
        // Automatically start tour if user hasn't visited before
        return !localStorage.getItem('izbot_tour_completed');
    });
    const [tourStep, setTourStep] = useState(0); // 0: Intro, 1: Page-specific guidance, 2: Interactive FAQ
    const [currentDialogue, setCurrentDialogue] = useState("");
    const [displayedText, setDisplayedText] = useState("");
    const [activeFaq, setActiveFaq] = useState<string | null>(null);

    const strings = DIALOGUES[language] || DIALOGUES.EN;

    // Detect page route and adjust dialogue when tour is active
    useEffect(() => {
        if (!isTourActive) {
            // When tour is finished but visitor clicks the bot, show default page description
            updatePageDialogue();
            return;
        }

        if (tourStep === 0) {
            setCurrentDialogue(strings.intro);
        } else if (tourStep === 1) {
            updatePageDialogue();
        }
    }, [location.pathname, tourStep, isTourActive, language]);

    // Typewriter effect logic
    useEffect(() => {
        let i = 0;
        setDisplayedText("");
        const textToType = currentDialogue;
        if (!textToType) return;

        const interval = setInterval(() => {
            if (i < textToType.length) {
                setDisplayedText((prev) => prev + textToType.charAt(i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 12);

        return () => clearInterval(interval);
    }, [currentDialogue]);

    const updatePageDialogue = () => {
        if (activeFaq) {
            setCurrentDialogue(activeFaq);
            return;
        }

        switch (location.pathname) {
            case '/':
                setCurrentDialogue(strings.profile);
                break;
            case '/porto':
                setCurrentDialogue(strings.porto);
                break;
            case '/iz-addon':
                setCurrentDialogue(strings.addon);
                break;
            case '/admin':
                setCurrentDialogue(strings.admin);
                break;
            default:
                setCurrentDialogue(strings.profile);
        }
    };

    const handleStartTour = () => {
        setIsTourActive(true);
        setTourStep(1);
        setIsMinimized(false);
        setActiveFaq(null);
    };

    const handleSkipTour = () => {
        setIsTourActive(false);
        localStorage.setItem('izbot_tour_completed', 'true');
        setCurrentDialogue(strings.state_tour_ended);
        setTourStep(0);
        setActiveFaq(null);
    };

    const handleNavigatePorto = () => {
        navigate('/porto');
        setTourStep(1);
    };

    const handleFaqClick = (faqKey: 'skills' | 'contact' | 'history') => {
        if (faqKey === 'skills') {
            setActiveFaq(strings.faq_skills_a);
            setCurrentDialogue(strings.faq_skills_a);
        } else if (faqKey === 'contact') {
            setActiveFaq(strings.faq_contact_a);
            setCurrentDialogue(strings.faq_contact_a);
            
            // Auto navigate to home if not there, and scroll
            if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => {
                    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 800);
            } else {
                document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (faqKey === 'history') {
            setActiveFaq(strings.faq_history_a);
            setCurrentDialogue(strings.faq_history_a);
        }
    };

    const handleBackFromFaq = () => {
        setActiveFaq(null);
        updatePageDialogue();
    };

    return (
        <div className="fixed bottom-6 right-6 z-[45] font-sans flex flex-col items-end pointer-events-none">
            {/* Dialogue Bubble */}
            <AnimatePresence>
                {!isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-black/85 backdrop-blur-xl border border-white/10 p-5 rounded-2xl rounded-br-none shadow-2xl max-w-[320px] md:max-w-[360px] mb-4 text-white pointer-events-auto select-none"
                    >
                        {/* Header Panel */}
                        <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/5">
                            <span className="text-[10px] tracking-[0.2em] font-extrabold text-cyan-400 uppercase">IZBOT // AI PORTFOLIO COMPANION</span>
                            <div className="flex space-x-1.5">
                                <button 
                                    onClick={() => setIsMinimized(true)}
                                    className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
                                    title="Minimize"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                                <button 
                                    onClick={handleSkipTour}
                                    className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Close Tour"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Dialogue text */}
                        <p className="text-xs md:text-sm font-light leading-relaxed min-h-[50px] text-neutral-200 font-mono">
                            {displayedText}
                        </p>

                        {/* Action Buttons based on state */}
                        <div className="mt-4 flex flex-wrap gap-2 justify-end">
                            {/* Intro State */}
                            {isTourActive && tourStep === 0 && (
                                <>
                                    <button
                                        onClick={handleSkipTour}
                                        className="px-3 py-1.5 text-[10px] tracking-wider font-semibold border border-white/20 hover:bg-white/5 text-neutral-300 uppercase transition-all cursor-pointer rounded"
                                    >
                                        {strings.btn_skip}
                                    </button>
                                    <button
                                        onClick={handleStartTour}
                                        className="px-3 py-1.5 text-[10px] tracking-wider font-semibold bg-white text-black hover:bg-neutral-200 uppercase transition-all cursor-pointer rounded"
                                    >
                                        {strings.btn_start}
                                    </button>
                                </>
                            )}

                            {/* Active Guide Steps */}
                            {(!isTourActive || tourStep > 0) && !activeFaq && (
                                <div className="flex flex-wrap gap-1.5 justify-end w-full">
                                    {location.pathname === '/' && (
                                        <button
                                            onClick={handleNavigatePorto}
                                            className="px-2.5 py-1.5 text-[9px] tracking-wider font-bold bg-cyan-500 hover:bg-cyan-400 text-black uppercase transition-all cursor-pointer rounded mr-auto"
                                        >
                                            {strings.btn_porto}
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={() => handleFaqClick('skills')}
                                        className="px-2 py-1 text-[9px] tracking-wide font-normal border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-neutral-300 transition-all cursor-pointer rounded"
                                    >
                                        {strings.faq_skills_q}
                                    </button>
                                    <button
                                        onClick={() => handleFaqClick('history')}
                                        className="px-2 py-1 text-[9px] tracking-wide font-normal border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-neutral-300 transition-all cursor-pointer rounded"
                                    >
                                        {strings.faq_history_q}
                                    </button>
                                    <button
                                        onClick={() => handleFaqClick('contact')}
                                        className="px-2 py-1 text-[9px] tracking-wide font-normal border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-neutral-300 transition-all cursor-pointer rounded"
                                    >
                                        {strings.faq_contact_q}
                                    </button>
                                    
                                    {isTourActive && (
                                        <button
                                            onClick={handleSkipTour}
                                            className="px-2.5 py-1 text-[9px] tracking-wider font-bold bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white uppercase transition-all cursor-pointer rounded ml-1"
                                        >
                                            {strings.btn_close}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Active FAQ detail view */}
                            {activeFaq && (
                                <button
                                    onClick={handleBackFromFaq}
                                    className="px-3 py-1.5 text-[10px] tracking-wider font-bold bg-white text-black hover:bg-neutral-200 uppercase transition-all cursor-pointer rounded"
                                >
                                    {strings.btn_back}
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Robot Companion Container */}
            <motion.div
                className="pointer-events-auto flex flex-col items-center justify-end relative cursor-pointer"
                onClick={() => {
                    if (isMinimized) {
                        setIsMinimized(false);
                    }
                }}
            >
                {/* Glowing Aura Effect behind robot */}
                <div className="absolute w-24 h-24 bg-cyan-500/10 blur-[30px] rounded-full -bottom-2 -z-10" />

                {/* Minimized Indicator Dot */}
                {isMinimized && (
                    <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border border-black"></span>
                    </span>
                )}

                {/* Floating Robot Avatar */}
                <motion.div
                    animate={isMinimized ? { 
                        y: [0, -5, 0],
                        scale: 0.85
                    } : { 
                        y: [0, -10, 0] 
                    }}
                    transition={{
                        y: {
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        },
                        scale: { duration: 0.3 }
                    }}
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_15px_rgba(6,182,212,0.45)]"
                >
                    <img 
                        src={robotImg} 
                        alt="IzBot AI Guide" 
                        className="w-full h-full object-contain"
                        draggable={false}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AITourGuide;
