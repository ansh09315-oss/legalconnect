import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isFirmHome = location.pathname === '/';
  const isDashboard = location.pathname === '/portfolio';

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <motion.header 
      className="glass-header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ padding: scrolled ? '15px 40px' : '25px 40px', transition: 'padding 0.3s ease' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo" style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>
            prexis<span className="gold-text">Legal</span>
          </div>
        </Link>
        
        <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          {isFirmHome && (
            <>
              <a href="#about" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>About Firm</a>
              <a href="#connect" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>Connect</a>
              <Link to="/login">
                <button className="blue-glow-btn" style={{ marginLeft: '10px' }}>Advocate Log in</button>
              </Link>
            </>
          )}

          {isDashboard && (
            <>
              <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: '500' }}>Advocate Portal</span>
              <button onClick={handleLogout} className="blue-glow-btn" style={{ marginLeft: '10px' }}>Log out</button>
            </>
          )}

          {!isFirmHome && !isDashboard && location.pathname === '/login' && (
            <Link to="/">
              <button className="flat-btn" style={{ margin: 0, padding: '10px 20px' }}>Back to Firm</button>
            </Link>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
