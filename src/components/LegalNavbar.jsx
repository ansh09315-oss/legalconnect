import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const LegalNavbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardPath, setDashboardPath] = useState('/login');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    
    if (isAuthenticated) {
      if (isAdmin) {
        setDashboardPath('/admin');
      } else if (user?.role === 'lawyer') {
        setDashboardPath('/lawyer');
      } else {
        setDashboardPath('/client');
      }
    } else {
      setDashboardPath('/login');
    }
    
    return () => window.removeEventListener('scroll', handler);
  }, [isAuthenticated, isAdmin, user]);

  const links = [
    { label: 'Services', href: '#services' },
    { label: 'Timeline', href: '#timeline' },
    { label: 'AdvoTalk', href: '#advotalk' },
    { label: 'Join as Advocate', href: '/register-lawyer' },
    { label: isAuthenticated ? 'Dashboard' : 'Login', href: dashboardPath },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-legal-navy/70 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/30'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="interactive flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="w-8 h-8 rounded-lg bg-legal-cyan/10 border border-legal-cyan/30 flex items-center justify-center"
            >
              <Scale size={18} className="text-legal-cyan" />
            </motion.div>
            <span className="font-display font-bold text-white text-lg tracking-tight">
              Legal<span className="text-legal-cyan">Connect</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const isPill = link.label === 'Login' || link.label === 'Dashboard';
              const isHash = link.href.startsWith('#');
              
              if (isHash) {
                return (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    whileHover={{ y: -2 }}
                    className="interactive text-sm font-medium transition-colors text-slate-400 hover:text-white"
                  >
                    {link.label}
                  </motion.a>
                );
              } else {
                return (
                  <motion.button
                    key={link.label}
                    onClick={() => navigate(link.href)}
                    whileHover={{ y: -2 }}
                    className={`interactive text-sm font-medium transition-colors ${
                      isPill
                        ? 'px-5 py-2 rounded-full border border-legal-cyan/40 text-legal-cyan hover:bg-legal-cyan/10'
                        : 'text-slate-400 hover:text-white'
                    } cursor-pointer bg-transparent`}
                  >
                    {link.label}
                  </motion.button>
                );
              }
            })}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="interactive md:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 cursor-pointer"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-4 right-4 z-40 bg-legal-navy/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl md:hidden"
          >
            <nav className="flex flex-col gap-4">
              {links.map((link, i) => {
                const isSpecial = link.label === 'Login' || link.label === 'Dashboard';
                const isHash = link.href.startsWith('#');

                if (isHash) {
                  return (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => setMenuOpen(false)}
                      className="interactive text-sm font-medium py-2 transition-colors text-slate-300 hover:text-white"
                    >
                      {link.label}
                    </motion.a>
                  );
                } else {
                  return (
                    <motion.button
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(link.href);
                      }}
                      className={`interactive text-sm font-medium py-2 transition-colors text-left cursor-pointer w-full bg-transparent ${
                        isSpecial
                          ? 'text-legal-cyan border-t border-white/5 pt-4 mt-2'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </motion.button>
                  );
                }
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LegalNavbar;
