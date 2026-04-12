import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import HeroSection from './sections/HeroSection';
import ServicesPortal from './sections/ServicesPortal';
import CaseTimeline from './sections/CaseTimeline';
import AdvoTalkCTA from './sections/AdvoTalkCTA';
import ModernFooter from './sections/ModernFooter';
import LegalNavbar from './LegalNavbar';

const LegalConnectHome = () => {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If securely logged in, instantly bypass the showcase and drop into the dashboard
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/client-dashboard');
    }
  }, [navigate]);

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
