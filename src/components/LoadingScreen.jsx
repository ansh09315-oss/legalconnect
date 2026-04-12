import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + Math.random() * 12 + 4;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onComplete]);

  const capped = Math.min(progress, 100);

  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9998] bg-legal-navy flex flex-col items-center justify-center"
    >
      {/* Animated ring */}
      <div className="relative w-24 h-24 mb-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,229,255,0.08)" strokeWidth="4" />
          <motion.circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="264"
            strokeDashoffset={264 - (264 * capped) / 100}
            style={{ filter: 'drop-shadow(0 0 8px #00e5ff)' }}
            transition={{ ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-legal-cyan text-lg font-mono font-bold">{Math.round(capped)}%</span>
        </div>
      </div>

      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-slate-400 text-sm tracking-widest uppercase font-mono"
      >
        Initializing Legal Portal
      </motion.p>

      {/* 3D Progress Bar */}
      <div className="mt-6 w-56 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${capped}%`,
            background: 'linear-gradient(90deg, #00e5ff, #818cf8)',
            boxShadow: '0 0 10px rgba(0,229,255,0.6)',
          }}
          transition={{ ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
