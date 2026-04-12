import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'AdvoTalk', href: '#advotalk' },
  { label: 'Login', href: '/login' },
];

const LegalNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

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
            {navLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                whileHover={{ y: -2 }}
                className={`interactive text-sm font-medium transition-colors ${
                  link.label === 'Login'
                    ? 'px-5 py-2 rounded-full border border-legal-cyan/40 text-legal-cyan hover:bg-legal-cyan/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="interactive md:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300"
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
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setMenuOpen(false)}
                  className={`interactive text-sm font-medium py-2 transition-colors ${
                    link.label === 'Login'
                      ? 'text-legal-cyan border-t border-white/5 pt-4 mt-2'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LegalNavbar;
