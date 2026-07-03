import React from 'react';
import { motion } from 'framer-motion';

const Logo: React.FC = () => {
    return (
        <div className="w-8 h-8 relative [perspective:1000px] group cursor-pointer">
            <motion.div
                className="w-full h-full relative [transform-style:preserve-3d]"
                animate={{ rotateX: 360, rotateY: 360 }}
                transition={{
                    duration: 10,
                    ease: "linear",
                    repeat: Infinity
                }}
            >
                {/* Front */}
                <div className="absolute inset-0 bg-blue-500 opacity-90 [transform:translateZ(16px)] border border-blue-400"></div>
                {/* Back */}
                <div className="absolute inset-0 bg-blue-600 opacity-90 [transform:rotateY(180deg)translateZ(16px)] border border-blue-400"></div>
                {/* Right */}
                <div className="absolute inset-0 bg-blue-400 opacity-90 [transform:rotateY(90deg)translateZ(16px)] border border-blue-300"></div>
                {/* Left */}
                <div className="absolute inset-0 bg-blue-400 opacity-90 [transform:rotateY(-90deg)translateZ(16px)] border border-blue-300"></div>
                {/* Top */}
                <div className="absolute inset-0 bg-blue-300 opacity-90 [transform:rotateX(90deg)translateZ(16px)] border border-blue-200"></div>
                {/* Bottom */}
                <div className="absolute inset-0 bg-blue-700 opacity-90 [transform:rotateX(-90deg)translateZ(16px)] border border-blue-500"></div>
            </motion.div>
        </div>
    );
};

export default Logo;
