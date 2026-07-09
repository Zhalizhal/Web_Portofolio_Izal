import React, { useRef, useState } from 'react';
import ParallaxSection from './ParallaxSection';
import { motion } from 'framer-motion';
import { BsArrowRight, BsLinkedin, BsInstagram, BsBehance, BsGithub, BsBuilding } from 'react-icons/bs';
import { SiArtstation } from 'react-icons/si';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const ContactSection: React.FC = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const sendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formRef.current) return;

        setLoading(true);

        emailjs
            .sendForm(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                formRef.current,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            )
            .then(() => {
                toast.success(t('contact_success'));
                formRef.current?.reset();
            })
            .catch((error) => {
                console.error(error);
                toast.error(t('contact_failed'));
            })
            .finally(() => setLoading(false));
    };
    return (
        <ParallaxSection backgroundImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop">
            <div id="contact-section" className="w-full flex flex-col justify-start md:justify-between pt-24 pb-12 md:pt-20 md:pb-4 md:h-full text-white max-w-none mx-auto">

                {/* Top Section - Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 xl:gap-32 items-start">

                    {/* Left Side - CTA */}
                    <div className="flex flex-col items-start space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.15em] leading-[1.3] uppercase text-white"
                        >
                            {t('contact_cta')}
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-4"
                        >
                            <p className="text-sm md:text-base font-light tracking-wide text-neutral-400 max-w-lg leading-relaxed">
                                {t('contact_desc')}
                            </p>

                            <div className="inline-block relative group">
                                <a href="mailto:ombo992@gmail.com" className="text-sm md:text-base font-normal tracking-[0.15em] border-b border-neutral-700 pb-1 hover:text-white hover:border-white transition-colors uppercase">
                                    ombo992@gmail.com
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side - Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="w-full text-left"
                    >
                        <form
                            ref={formRef}
                            onSubmit={sendEmail}
                            className="space-y-5">
                            {/* Name Fields */}
                            <div>
                                <label className="block text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">{t('contact_label_name')}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder={t('contact_placeholder_first')}
                                            name="from_name"
                                            className="w-full bg-transparent border-b border-neutral-800 py-2 text-xs md:text-sm font-normal tracking-wide text-white placeholder-neutral-700 focus:border-white focus:outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder={t('contact_placeholder_last')}
                                            name="from_name"
                                            className="w-full bg-transparent border-b border-neutral-800 py-2 text-xs md:text-sm font-normal tracking-wide text-white placeholder-neutral-700 focus:border-white focus:outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">{t('contact_label_email')}</label>
                                <input
                                    type="email"
                                    name="from_email"
                                    className="w-full bg-transparent border-b border-neutral-800 py-2 text-xs md:text-sm font-normal tracking-wide text-white placeholder-neutral-700 focus:border-white focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            {/* Message Field */}
                            <div>
                                <label className="block text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">{t('contact_label_message')}</label>
                                <textarea
                                    rows={4}
                                    name="message"
                                    className="w-full bg-transparent border-b border-neutral-800 py-2 text-xs md:text-sm font-normal tracking-wide text-white placeholder-neutral-700 focus:border-white focus:outline-none transition-colors resize-none"
                                    required
                                ></textarea>
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-white text-black text-xs font-semibold tracking-[0.2em] uppercase hover:bg-neutral-200 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    {loading ? t('contact_btn_sending') : t('contact_btn_submit')}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                </div>

                {/* Bottom Section */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="w-full mt-auto"
                >
                    {/* Links Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6 pt-6 border-t border-neutral-900">

                        {/* Connect */}
                        <div className="border-t border-neutral-800 pt-4">
                            <h3 className="text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2.5">{t('contact_connect_title')}</h3>
                            <p className="text-xs font-normal tracking-wide text-neutral-500 mb-4 max-w-xs leading-relaxed">
                                {t('contact_connect_desc')}
                            </p>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="flex items-center group font-semibold tracking-[0.15em] uppercase hover:text-white transition-colors text-xs text-neutral-300">
                                        <BsLinkedin className="mr-2 text-sm shrink-0 text-neutral-400 group-hover:text-white transition-colors" />
                                        LinkedIn <BsArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://instagram.com/izha_al_" className="flex items-center group font-semibold tracking-[0.15em] uppercase hover:text-white transition-colors text-xs text-neutral-300">
                                        <BsInstagram className="mr-2 text-sm shrink-0 text-neutral-400 group-hover:text-white transition-colors" />
                                        Instagram <BsArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Portfolio */}
                        <div className="border-t border-neutral-800 pt-4">
                            <h3 className="text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2.5">{t('contact_portfolio_title')}</h3>
                            <p className="text-xs font-normal tracking-wide text-neutral-500 mb-4 max-w-xs leading-relaxed">
                                {t('contact_portfolio_desc')}
                            </p>
                            <ul className="space-y-2">
                                <li>
                                    <a href="https://behance.net/zalzo" className="flex items-center group font-semibold tracking-[0.15em] uppercase hover:text-white transition-colors text-xs text-neutral-300">
                                        <BsBehance className="mr-2 text-sm shrink-0 text-neutral-400 group-hover:text-white transition-colors" />
                                        Behance <BsArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://zalzo7.artstation.com" className="flex items-center group font-semibold tracking-[0.15em] uppercase hover:text-white transition-colors text-xs text-neutral-300">
                                        <SiArtstation className="mr-2 text-sm shrink-0 text-neutral-400 group-hover:text-white transition-colors" />
                                        ArtStation <BsArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://cgarchitect.com/members/ombo992" className="flex items-center group font-semibold tracking-[0.15em] uppercase hover:text-white transition-colors text-xs text-neutral-300">
                                        <BsBuilding className="mr-2 text-sm shrink-0 text-neutral-400 group-hover:text-white transition-colors" />
                                        CGArchitect <BsArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Dev */}
                        <div className="border-t border-neutral-800 pt-4">
                            <h3 className="text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2.5">{t('contact_dev_title')}</h3>
                            <p className="text-xs font-normal tracking-wide text-neutral-500 mb-4 max-w-xs leading-relaxed">
                                {t('contact_dev_desc')}
                            </p>
                            <ul className="space-y-2">
                                <li>
                                    <a href="https://github.com/Zhalizhal" className="flex items-center group font-semibold tracking-[0.15em] uppercase hover:text-white transition-colors text-xs text-neutral-300">
                                        <BsGithub className="mr-2 text-sm shrink-0 text-neutral-400 group-hover:text-white transition-colors" />
                                        GitHub <BsArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </a>
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* Footer Copyright */}
                    <div className="w-full flex flex-col sm:flex-row justify-between text-[9px] md:text-[10px] text-neutral-600 font-mono tracking-widest border-t border-neutral-900 pt-4 uppercase gap-1 sm:gap-0">
                        <p>&copy; 2026 Baharuddin Izha Al Sya'na. {t('contact_rights')}</p>
                        <p>{t('contact_designed')}</p>
                    </div>

                </motion.div>

            </div>
        </ParallaxSection>
    );
};

export default ContactSection;
