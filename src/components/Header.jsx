import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Shield } from 'lucide-react';
import { LawyerAvatar } from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lawyer, setLawyer] = useState(null);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const acc = localStorage.getItem('lawyerAccount');
    if (acc) setLawyer(JSON.parse(acc));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isFirmHome = location.pathname === '/';
  const isDashboard = location.pathname.startsWith('/lawyer');

  const handleLogout = () => {
    localStorage.removeItem('lawyerAccount');
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <motion.header
      className="glass-header"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{
        padding: scrolled ? '12px 40px' : '20px 40px',
        transition: 'padding 0.3s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: scrolled
          ? 'rgba(5, 10, 20, 0.9)'
          : 'rgba(5, 10, 20, 0.6)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            style={{ fontSize: '1.7rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}
          >
            Legal<span style={{ background: 'linear-gradient(90deg, #00e5ff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Connect</span>
          </motion.div>
        </Link>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>

          {/* Home page links */}
          {isFirmHome && (
            <>
              <a href="#services" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.2s' }}
                onMouseOver={e => e.target.style.color = '#fff'}
                onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
              >
                Hire an Advocate
              </a>
              <a href="#about" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.2s' }}
                onMouseOver={e => e.target.style.color = '#fff'}
                onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
              >
                About Firm
              </a>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(0,229,255,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'linear-gradient(135deg, #00e5ff 0%, #0094aa 100%)',
                    color: '#050A14',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 22px',
                    fontWeight: '700',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}
                >
                  Advocate Login
                </motion.button>
              </Link>
            </>
          )}

          {/* Dashboard header */}
          {isDashboard && (
            <>
              {/* Portal Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '20px', padding: '6px 14px' }}>
                <Shield size={14} color="#00e5ff" />
                <span style={{ color: '#00e5ff', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.05em' }}>ADVOCATE PORTAL</span>
              </div>

              {/* Notification Bell */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                style={{ position: 'relative', cursor: 'pointer', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Bell size={18} color="rgba(255,255,255,0.8)" />
                <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#00e5ff', borderRadius: '50%', border: '1.5px solid #050A14' }} />
              </motion.div>

              {/* Profile Dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setDropdownOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    color: 'white',
                  }}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    <LawyerAvatar lawyer={lawyer} size={30} radius="8px" fontSize="0.8rem" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{lawyer?.name?.split(' ')[0] || 'Advocate'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{lawyer?.spec?.split(' ')[0] || 'Legal Pro'}</div>
                  </div>
                  <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} color="#94a3b8" />
                  </motion.div>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                        background: 'rgba(18, 20, 28, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '14px',
                        padding: '8px',
                        minWidth: '200px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        zIndex: 999,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '6px' }}>
                        <div style={{ borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                          <LawyerAvatar lawyer={lawyer} size={38} radius="10px" fontSize="1rem" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{lawyer?.name || 'Advocate'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{lawyer?.email || ''}</div>
                        </div>
                      </div>

                      {[
                        { icon: <User size={15} />, label: 'My Profile', action: () => setDropdownOpen(false) },
                        { icon: <Bell size={15} />, label: 'Notifications', action: () => setDropdownOpen(false) },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={item.action}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ color: '#94a3b8' }}>{item.icon}</span>
                          {item.label}
                        </button>
                      ))}

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '6px', paddingTop: '6px' }}>
                        <button
                          onClick={handleLogout}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.88rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* Login page back button */}
          {!isFirmHome && !isDashboard && location.pathname === '/login' && (
            <Link to="/">
              <button style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }}>
                ← Back to Firm
              </button>
            </Link>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
