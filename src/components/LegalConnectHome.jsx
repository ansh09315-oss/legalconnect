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
      <main>
        <HeroSection />
        <ServicesPortal />
        <CaseTimeline />
        <AdvoTalkCTA />
      </main>
      <ModernFooter />
    </>
  );
};

export default LegalConnectHome;
