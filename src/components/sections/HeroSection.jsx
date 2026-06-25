import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Scale, Shield, Award, Users } from 'lucide-react';

// Lazy-loaded 3D Scene
const Hero3DScene = lazy(() => import('./Hero3DScene'));

// Localized premium skeleton loader for the 3D canvas area
const SkeletonLoader = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090f1d]/40 backdrop-blur-md">
    <div className="relative flex items-center justify-center">
      <div className="absolute w-24 h-24 rounded-full border border-legal-cyan/20 animate-ping opacity-75" />
      <div className="w-16 h-16 rounded-full bg-legal-cyan/10 border border-legal-cyan/30 flex items-center justify-center text-legal-cyan animate-pulse">
        <Scale size={24} />
      </div>
    </div>
    <span className="text-[10px] font-semibold text-slate-500 tracking-[0.2em] uppercase mt-6 animate-pulse">
      Loading 3D Visualizer
    </span>
  </div>
);

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-legal-navy pt-28 pb-16 lg:py-0">
      {/* Subtle ambient grid pattern in background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        
        {/* Left Column: Heading, Text, Buttons, and Badges (Renders Instantly) */}
        <div className="lg:col-span-7 text-left flex flex-col items-start">
          
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

          {/* SEO Optimized H1 Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-white leading-[1.1] mb-6"
          >
            Online Lawyer Consultation & <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-legal-cyan via-[#4d94ff] to-indigo-400 bg-clip-text text-transparent">
              Expert Legal Advice
            </span>
          </motion.h1>

          {/* Subtitle / Paragraph */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-slate-400 max-w-xl leading-relaxed mb-8"
          >
            Connect directly with verified advocates, track case timelines in real-time, and get transparent legal services online. Your legal shield, simplified.
          </motion.p>

          {/* Primary & Secondary Call to Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => {
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-legal-cyan to-[#0094aa] hover:from-[#00b8cc] hover:to-[#008699] text-[#050A14] font-bold rounded-xl text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_8px_30px_rgba(0,229,255,0.2)] cursor-pointer"
            >
              Hire an Advocate
            </button>
            <button
              onClick={() => {
                document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl text-sm tracking-wider uppercase transition-all duration-300 backdrop-blur-md cursor-pointer"
            >
              How It Works
            </button>
          </motion.div>

          {/* Trust Metrics / Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-3 gap-6 md:gap-8 mt-12 pt-8 border-t border-white/5 w-full max-w-lg"
          >
            {[
              { icon: Shield, label: 'Verified Lawyers', val: '100%' },
              { icon: Users, label: 'Happy Clients', val: '5k+' },
              { icon: Award, label: 'Case Success Rate', val: '95%' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-2xl font-bold font-display text-white">{item.val}</span>
                <span className="text-[10px] md:text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <item.icon size={11} className="text-legal-cyan" />
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>

        </div>

        {/* Right Column: Async Lazy-Loaded 3D Visualizer Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 w-full h-[360px] md:h-[450px] lg:h-[500px] relative rounded-3xl overflow-hidden border border-white/10 bg-slate-950/20 backdrop-blur-md shadow-2xl group"
        >
          {/* Futuristic frame corners */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-legal-cyan/30 rounded-tl pointer-events-none" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-legal-cyan/30 rounded-tr pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-legal-cyan/30 rounded-bl pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-legal-cyan/30 rounded-br pointer-events-none" />

          {/* Floating Live 3D Badge */}
          <div className="absolute top-6 left-6 z-20 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/10 pointer-events-none flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-legal-cyan animate-pulse" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Interactive 3D Scene</span>
          </div>

          {/* Suspended rendering - Rest of the page loads immediately */}
          <Suspense fallback={<SkeletonLoader />}>
            <Hero3DScene />
          </Suspense>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
