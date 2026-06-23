import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Menu, X, Shield, User, ArrowRight, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const LegalNavbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardPath, setDashboardPath] = useState('/login');
  const [portalModalOpen, setPortalModalOpen] = useState(false);

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
              const isLogin = link.label === 'Login';
              return isLogin ? (
                <motion.button
                  key={link.label}
                  onClick={() => setPortalModalOpen(true)}
                  whileHover={{ y: -2 }}
                  className="interactive text-sm font-medium transition-colors px-5 py-2 rounded-full border border-legal-cyan/40 text-legal-cyan hover:bg-legal-cyan/10 cursor-pointer bg-transparent"
                >
                  {link.label}
                </motion.button>
              ) : (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ y: -2 }}
                  className={`interactive text-sm font-medium transition-colors ${
                    link.label === 'Dashboard'
                      ? 'px-5 py-2 rounded-full border border-legal-cyan/40 text-legal-cyan hover:bg-legal-cyan/10'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </motion.a>
              );
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
                const isLogin = link.label === 'Login';
                return isLogin ? (
                  <motion.button
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => {
                      setMenuOpen(false);
                      setPortalModalOpen(true);
                    }}
                    className="interactive text-sm font-medium py-2 transition-colors text-left text-legal-cyan border-t border-white/5 pt-4 mt-2 cursor-pointer w-full bg-transparent"
                  >
                    {link.label}
                  </motion.button>
                ) : (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => setMenuOpen(false)}
                    className={`interactive text-sm font-medium py-2 transition-colors ${
                      link.label === 'Dashboard'
                        ? 'text-legal-cyan border-t border-white/5 pt-4 mt-2'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </motion.a>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portal Selection Modal */}
      <AnimatePresence>
        {portalModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setPortalModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setPortalModalOpen(false)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4">
                  <Scale size={26} />
                </div>
                <h3 className="font-display font-bold text-2xl text-white">Choose Portal</h3>
                <p className="text-slate-400 text-sm mt-1">Select how you would like to access LegalConnect</p>
              </div>

              {/* Portals Grid */}
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Advocate Portal */}
                <div className="flex flex-col items-center text-center bg-white/5 border border-white/10 hover:border-cyan-500/40 rounded-2xl p-6 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
                    <Shield size={22} />
                  </div>
                  <h4 className="font-display font-semibold text-lg text-white mb-2">Advocate Portal</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6 flex-grow">
                    Access case files, coordinate with clients, and manage your practice schedules.
                  </p>
                  <button
                    onClick={() => {
                      setPortalModalOpen(false);
                      navigate('/login');
                    }}
                    className="interactive w-full py-3 bg-gradient-to-r from-cyan-400 to-cyan-600 text-slate-900 font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Login as Advocate <ArrowRight size={16} />
                  </button>
                </div>

                {/* Client Portal */}
                <div className="flex flex-col items-center text-center bg-white/5 border border-white/10 hover:border-indigo-400/40 rounded-2xl p-6 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4">
                    <User size={22} />
                  </div>
                  <h4 className="font-display font-semibold text-lg text-white mb-2">Client Portal</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6 flex-grow">
                    Hire advocates, monitor active legal matters, and message or call counsel directly.
                  </p>
                  <div className="flex flex-col gap-2.5 w-full">
                    <button
                      onClick={() => {
                        setPortalModalOpen(false);
                        navigate('/login');
                      }}
                      className="interactive w-full py-3 bg-gradient-to-r from-indigo-400 to-indigo-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Login as Client <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setPortalModalOpen(false);
                        navigate('/register');
                      }}
                      className="w-full py-2.5 bg-white/5 border border-indigo-500/30 hover:border-indigo-400/60 text-indigo-400 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      Register as Client
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LegalNavbar;
