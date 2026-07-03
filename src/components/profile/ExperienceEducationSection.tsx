import React from 'react';
import ParallaxSection from './ParallaxSection';
import { motion } from 'framer-motion';
import zstu from '../../assets/image/zstu.png';
import { useLanguage } from '../../context/LanguageContext';

const ExperienceEducationSection: React.FC = () => {
    const { t } = useLanguage();

    return (
        <ParallaxSection
            backgroundImage="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2669&auto=format&fit=crop"
            className="!items-start"
            backgroundPosition="center 35%"
        >
            <div className="w-full pt-24 pb-12 md:pt-20 lg:pt-24 md:pb-6 flex flex-col justify-start md:justify-between md:min-h-[calc(100vh-10rem)]">

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-white w-full"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 xl:gap-32 items-start">

                        {/* Education Column */}
                        <div>
                            <div className="mb-10 md:mb-12 lg:mb-16">
                                <span className="block text-[10px] md:text-xs tracking-[0.25em] font-semibold mb-2 lg:mt-5 text-neutral-500 uppercase">{t('intro_subtitle')}</span>
                                <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-[0.2em] uppercase text-white leading-[1.3] max-w-4xl">
                                    {t('intro_title')}
                                </h2>
                            </div>
                            <h3 className="text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase text-neutral-400 border-b border-neutral-800 pb-2 mb-6 inline-block">{t('education_title')}</h3>
                            <div className="space-y-6 md:space-y-8">
                                <div className="space-y-1">
                                    <h4 className="text-sm md:text-base font-normal tracking-wide text-neutral-200">{t('edu_smk')}</h4>
                                    <p className="text-xs md:text-sm font-light tracking-wide text-neutral-500">{t('edu_smk_dept')}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm md:text-base font-normal tracking-wide text-neutral-200">{t('edu_uad')}</h4>
                                    <p className="text-xs md:text-sm font-light tracking-wide text-neutral-500">{t('edu_uad_degree')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Experience Column */}
                        <div className="lg:pl-8 xl:pl-16">
                            <h3 className="text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase text-neutral-400 border-b border-neutral-800 pb-2 mb-6 inline-block lg:mt-5">{t('experience_title')}</h3>
                            <div className="space-y-6 md:space-y-8">
                                {/* 1. Deltaview */}
                                <div className="space-y-1">
                                    <h4 className="text-sm md:text-base font-normal tracking-wide text-neutral-200">{t('exp_deltaview')}</h4>
                                    <p className="text-xs md:text-sm font-light tracking-wide text-neutral-500">{t('exp_deltaview_role')}</p>
                                </div>

                                {/* 2. Computer Lab */}
                                <div className="space-y-1">
                                    <h4 className="text-sm md:text-base font-normal tracking-wide text-neutral-200">{t('exp_uad_lab')}</h4>
                                    <p className="text-xs md:text-sm font-light tracking-wide text-neutral-500">{t('exp_uad_lab_role')}</p>
                                </div>

                                {/* 3. Svein */}
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <h4 className="text-sm md:text-base font-normal tracking-wide text-neutral-200">{t('exp_svein')}</h4>
                                        <p className="text-xs md:text-sm font-light tracking-wide text-neutral-500">{t('exp_svein_role1')}</p>
                                        <p className="text-xs md:text-sm font-light tracking-wide text-neutral-500">{t('exp_svein_role2')}</p>
                                        <p className="text-xs md:text-sm font-light tracking-wide text-neutral-500">{t('exp_svein_role3')}</p>
                                    </div>
                                </div>

                                {/* 4. Taksu Visual */}
                                <div className="space-y-1">
                                    <h4 className="text-sm md:text-base font-normal tracking-wide text-neutral-200">{t('exp_taksu')}</h4>
                                    <p className="text-xs md:text-sm font-light tracking-wide text-neutral-500">{t('exp_taksu_role')}</p>
                                </div>

                                {/* 5. Freelance */}
                                <div className="space-y-1">
                                    <h4 className="text-sm md:text-base font-normal tracking-wide text-neutral-200">{t('exp_freelance')}</h4>
                                    <p className="text-xs md:text-sm font-light tracking-wide text-neutral-500">{t('exp_freelance_role')}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </motion.div>

                {/* Footer split - Left and Right Aligned */}
                <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end border-neutral-900 pt-4 mt-8 md:mt-4 gap-6 md:gap-0">

                    {/* Left Side */}
                    <div className="flex flex-col gap-2.5 items-start lg:mt-6 lg:scale-110 origin-bottom-left">
                        {/* Upper Row: Logo & Info */}
                        <div className="flex items-center gap-3.5">
                            {/* Logo */}
                            <div className="flex items-center justify-center">
                                <img src={zstu} alt="Z Studio" className="h-[70px] md:h-[88px] w-auto object-contain filter grayscale opacity-60 hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Details */}
                            <div className="text-[10px] md:text-xs text-neutral-400 space-y-0.5 flex flex-col tracking-wider">
                                <p className="font-semibold text-neutral-300 uppercase tracking-widest text-[9px] mb-0.5">Z Studio</p>
                                <p className="text-neutral-500 font-light uppercase text-[9px]">Instagram</p>
                                <a href="https://instagram.com/zstu___" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">@zstu___</a>
                                <a href="https://instagram.com/izha_al_" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">@izha_al_</a>
                            </div>
                        </div>

                        {/* Bottom: Open to Collaboration */}
                        <span className="text-[9px] md:text-[10px] tracking-[0.2em] font-semibold text-neutral-500 uppercase">
                            {t('collab_text')}
                        </span>
                    </div>

                    {/* Right Side */}
                    <div className="text-[10px] md:text-xs tracking-[0.25em] text-neutral-500 text-left md:text-right mb-0 w-full md:w-auto uppercase">
                        <span className="font-semibold text-neutral-400">PORTFOLIO</span>
                        <span className="text-neutral-800 mx-3 hidden md:inline">|</span>
                        <div className="h-1 md:hidden"></div>
                        <span className="text-neutral-400 block md:inline font-light">Baharuddin Izha Al S.</span>
                    </div>

                </div>

            </div>
        </ParallaxSection>
    );
};

export default ExperienceEducationSection;
