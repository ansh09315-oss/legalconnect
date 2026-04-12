import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';

const Footer = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <footer style={{ 
      position: 'relative',
      padding: '60px 40px',
      borderTop: '1px solid var(--glass-border)',
      background: 'rgba(5, 5, 7, 0.8)',
      marginTop: '100px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '40px' }}>
        
        <div style={{ maxWidth: '400px' }}>
          <div className="logo" style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>
            prexis<span className="gold-text">Legal</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
            A premier legal advocate firm centered on Adarsh Trivedi, providing unparalleled legal solutions and strategy.
          </p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <span style={{ color: 'var(--accent-gold)' }}>Contact: 7052099743</span> | 
            <span style={{ color: 'var(--accent-gold)' }}>trivediadarsh13@gmail.com</span>
          </div>
        </div>

        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '20px', fontSize: '1.2rem' }}>Location</h4>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
            Office 2nd Floor, Shri Ram Paras Tower<br />
            Semra, Matiyari, Lucknow 226028<br />
            <br />
            <span style={{ fontSize: '0.85em', color: 'var(--accent-blue)' }}>(Landmark: Opp. BMW Showroom)</span>
          </p>
        </div>

      </div>

      {/* AI Chatbot Shell */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="glass-panel"
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '40px',
              width: '350px',
              height: '450px',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '15px 20px', background: 'rgba(0, 162, 255, 0.1)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'inline-block', boxShadow: '0 0 10px var(--accent-blue)' }}></span>
                Prexis AI Assistant
              </h4>
              <X size={18} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setChatOpen(false)} />
            </div>
            
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '12px 12px 12px 0', fontSize: '0.9rem' }}>
                Hello. I am the Prexis AI Intake Assistant. Please describe your legal issue so I can categorize your case.
              </div>
            </div>

            <div style={{ padding: '15px', borderTop: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '8px 12px', outline: 'none' }}
                />
                <button style={{ background: 'var(--accent-blue)', border: 'none', width: '36px', height: '36px', borderRadius: '6px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '40px',
          width: '50px',
          height: '50px',
          borderRadius: '25px',
          background: 'var(--accent-blue)',
          boxShadow: '0 0 20px var(--accent-blue-glow)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        <MessageSquare size={24} />
      </motion.button>
    </footer>
  );
};

export default Footer;
