import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import HeroSection from './sections/HeroSection';
import AISummaryBlock from './sections/AISummaryBlock';
import ServicesPortal from './sections/ServicesPortal';
import CaseTimeline from './sections/CaseTimeline';
import AdvoTalkCTA from './sections/AdvoTalkCTA';
import FAQAccordion from './sections/FAQAccordion';
import ModernFooter from './sections/ModernFooter';
import LegalNavbar from './LegalNavbar';
import { useAuth } from '../contexts/AuthContext';

const LegalConnectHome = () => {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin');
      } else if (user?.role === 'lawyer') {
        navigate('/lawyer');
      } else if (user?.cases && user.cases.length > 0) {
        navigate('/client-dashboard');
      }
    }
  }, [isAuthenticated, user, isAdmin, navigate]);

  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  return (
    <>
      <LegalNavbar />
      <main id="main-content">
        {/* 1. Hero — H1, CTA above the fold */}
        <HeroSection />

        {/* 2. TL;DR / AI Summary — GEO & AEO optimised abstract block */}
        <AISummaryBlock />

        {/* 3. Services Portal — practice area cards */}
        <ServicesPortal />

        {/* 4. How It Works — 3-step process (consult → hire → track) */}
        <CaseTimeline />

        {/* 5. AdvoTalk CTA — conversion section */}
        <AdvoTalkCTA />

        {/* 6. FAQ Accordion — AEO / direct Q&A for AI engines */}
        <FAQAccordion />
      </main>

      {/* Footer with JSON-LD Schema */}
      <ModernFooter />
    </>
  );
};

export default LegalConnectHome;
