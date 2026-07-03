import React from 'react';
import ParallaxSection from './ParallaxSection';
import { motion } from 'framer-motion';
import { SiBlender, SiAdobe, SiUnity, SiSketchup, SiAutodesk, SiPhp, SiMysql, SiHtml5, SiLaravel } from 'react-icons/si';
import { BsCodeSlash } from 'react-icons/bs';
import { useLanguage } from '../../context/LanguageContext';

const SkillsSection: React.FC = () => {
    const { t } = useLanguage();

    const skills = [
        { name: "Blender", icon: <SiBlender size={26} />, level: 90, descKey: "skill_desc_blender" as const },
        { name: "3Ds Max", icon: <SiAutodesk size={26} />, level: 50, descKey: "skill_desc_3dsmax" as const },
        { name: "Sketchup", icon: <SiSketchup size={26} />, level: 50, descKey: "skill_desc_sketchup" as const },
        { name: "Adobe Family", icon: <SiAdobe size={26} />, level: 90, descKey: "skill_desc_adobe" as const },
        { name: "Unity", icon: <SiUnity size={26} />, level: 75, descKey: "skill_desc_unity" as const },
    ];

    const programming = [
        { name: "PHP", icon: <SiPhp size={26} />, level: 90 },
        { name: "MySQL", icon: <SiMysql size={26} />, level: 89 },
        { name: "HTML", icon: <SiHtml5 size={26} />, level: 90 },
        { name: "ITM", icon: <BsCodeSlash size={26} />, level: 80 },
        { name: "Laravel", icon: <SiLaravel size={26} />, level: 60 },
    ];

    return (
        <ParallaxSection className="bg-neutral-900 border-t border-neutral-800">
            <div className="w-full text-white pt-24 pb-16 md:pt-16 md:pb-16 flex flex-col justify-start md:justify-center gap-16 md:gap-20">

                {/* Software Skills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="w-full"
                >
                    <h2 className="text-2xl md:text-3xl font-mono text-white mb-10 uppercase tracking-widest">{t('skills_software')}</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 xl:gap-10">
                        {skills.map((skill, idx) => (
                            <div key={idx} className="flex flex-col gap-4 group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg group-hover:bg-neutral-800 transition-colors shrink-0 text-white">
                                        {skill.icon}
                                    </div>
                                    <h3 className="text-base font-bold group-hover:text-gray-300 transition-colors leading-tight">{skill.name}</h3>
                                </div>

                                <div className="space-y-1.5 w-full">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                                        <span>{t('skill_level')}</span>
                                        <span>{skill.level}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${skill.level}%` }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                            viewport={{ once: true }}
                                            className="h-full bg-white rounded-full"
                                        />
                                    </div>
                                </div>

                                <p className="text-[11px] text-gray-400 leading-relaxed font-light">{t(skill.descKey)}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Programming */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="w-full"
                >
                    <h2 className="text-2xl md:text-3xl font-mono text-white mb-10 uppercase tracking-widest">{t('skills_programming')}</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 xl:gap-10">
                        {programming.map((prog, idx) => (
                            <div key={idx} className="flex flex-col gap-4 group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg group-hover:bg-neutral-800 transition-colors shrink-0 text-white">
                                        {prog.icon}
                                    </div>
                                    <h3 className="text-base font-bold group-hover:text-gray-300 transition-colors leading-tight">{prog.name}</h3>
                                </div>

                                <div className="space-y-1.5 w-full">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                                        <span>{t('skill_level')}</span>
                                        <span>{prog.level}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${prog.level}%` }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                            viewport={{ once: true }}
                                            className="h-full bg-white rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </ParallaxSection>
    );
};

export default SkillsSection;
