import React from 'react';
import HeroSection from '../components/profile/HeroSection';
import ExperienceEducationSection from '../components/profile/ExperienceEducationSection';
import SkillsSection from '../components/profile/SkillsSection';
import ContactSection from '../components/profile/ContactSection';

const Profile: React.FC = () => {
    return (
        <div className="bg-black text-white font-sans">
            <HeroSection />
            <ExperienceEducationSection />
            <SkillsSection />
            <ContactSection />
        </div>
    );
};

export default Profile;
