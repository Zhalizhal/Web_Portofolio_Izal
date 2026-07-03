import React from 'react';
import ParallaxSection from './ParallaxSection';
import { motion } from 'framer-motion';

const ExperienceSection: React.FC = () => {
    return (
        <ParallaxSection backgroundImage="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2669&auto=format&fit=crop">
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-white"
            >
                <h2 className="text-4xl md:text-6xl font-bold mb-12 border-l-4 border-blue-500 pl-6">Experience</h2>

                <div className="space-y-12 max-w-4xl">
                    <div className="group">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-blue-400 transition-colors">SVEIN STUDIO</h3>
                        <p className="text-sm font-mono text-gray-400 mb-2">2022 - Present</p>
                        <p className="text-xl text-gray-300">Architectural Rendering, 3D Artist, 3D Animator, R&D.</p>
                    </div>

                    <div className="group">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Freelance</h3>
                        <p className="text-sm font-mono text-gray-400 mb-2">2022 - Present</p>
                        <p className="text-xl text-gray-300">3D Artist, 3D Animator, 3D Modeller.</p>
                    </div>

                    <div className="group">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Computer Lab - UAD</h3>
                        <p className="text-xl text-gray-300">Assistant for Database, Statistics, Web Engineering, Intro to Multimedia, Computer Graphics.</p>
                    </div>
                </div>
            </motion.div>
        </ParallaxSection>
    );
};

export default ExperienceSection;
