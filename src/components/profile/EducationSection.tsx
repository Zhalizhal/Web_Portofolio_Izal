import React from 'react';
import ParallaxSection from './ParallaxSection';
import { motion } from 'framer-motion';

const EducationSection: React.FC = () => {
    return (
        <ParallaxSection backgroundImage="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-white w-full"
            >
                <h2 className="text-4xl md:text-6xl font-bold mb-16 text-right border-r-4 border-blue-500 pr-6">Education</h2>

                <div className="flex flex-col items-end space-y-12 text-right">
                    <div>
                        <h3 className="text-3xl font-bold mb-1">Universitas Ahmad Dahlan</h3>
                        <p className="text-xl text-blue-400">Teknik Informatika (2017 - 2021)</p>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold mb-1">SMK N 1 Lamongan</h3>
                        <p className="text-xl text-blue-400">Multimedia (2014 - 2017)</p>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold mb-1">MTS M 04 Bulubrangsi</h3>
                    </div>
                </div>
            </motion.div>
        </ParallaxSection>
    );
};

export default EducationSection;
