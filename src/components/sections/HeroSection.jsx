import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Shield, Award, Users } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-legal-navy pt-28 pb-16 lg:py-0">
      {/* Subtle ambient grid pattern in background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center z-10">
        
        {/* Accent Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-legal-cyan/5 border border-legal-cyan/20 text-legal-cyan text-xs font-semibold tracking-wider uppercase mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-legal-cyan animate-pulse" />
          The Future of Law is Digital
        </motion.div>

        {/* SEO Optimized H1 Heading - Full Width */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] mb-6 max-w-5xl"
        >
          Online Lawyer Consultation &{' '}
          <span className="bg-gradient-to-r from-legal-cyan via-[#4d94ff] to-indigo-400 bg-clip-text text-transparent">
            Expert Legal Advice
          </span>
        </motion.h1>

        {/* Subtitle / Paragraph */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed mb-8"
        >
          Connect directly with verified advocates, track case timelines in real-time, and get transparent legal services online. Your legal shield, simplified.
        </motion.p>

        {/* Primary & Secondary Call to Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={() => {
              document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-gradient-to-r from-legal-cyan to-[#0094aa] hover:from-[#00b8cc] hover:to-[#008699] text-[#050A14] font-bold rounded-xl text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_8px_30px_rgba(0,229,255,0.2)] cursor-pointer"
          >
            Hire an Advocate
          </button>
          <button
            onClick={() => {
              document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl text-sm tracking-wider uppercase transition-all duration-300 backdrop-blur-md cursor-pointer"
          >
            How It Works
          </button>
        </motion.div>

        {/* Trust Metrics / Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex justify-center gap-12 md:gap-16 mt-12 pt-8 border-t border-white/5 w-full max-w-lg"
        >
          {[
            { icon: Shield, label: 'Verified Lawyers', val: '100%' },
            { icon: Users, label: 'Happy Clients', val: '5k+' },
            { icon: Award, label: 'Case Success Rate', val: '95%' }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-2xl font-bold font-display text-white">{item.val}</span>
              <span className="text-[10px] md:text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <item.icon size={11} className="text-legal-cyan" />
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
