import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import LegalNavbar from './LegalNavbar';
import LoadingScreen from './LoadingScreen';
import HeroSection from './sections/HeroSection';
import ServicesPortal from './sections/ServicesPortal';
import CaseTimeline from './sections/CaseTimeline';
import AdvoTalkCTA from './sections/AdvoTalkCTA';
import ModernFooter from './sections/ModernFooter';

const LegalConnectHome = () => {
  const [loaded, setLoaded] = useState(false);
  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  return (
    <>
      <AnimatePresence>
        {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}
      </AnimatePresence>

      {loaded && (
        <>
          <LegalNavbar />
          <main>
            <HeroSection />
            <ServicesPortal />
            <CaseTimeline />
            <AdvoTalkCTA />
          </main>
          <ModernFooter />
        </>
      )}
    </>
  );
};

export default LegalConnectHome;
