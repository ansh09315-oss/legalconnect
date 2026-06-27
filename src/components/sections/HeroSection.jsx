import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Activity, Users, CheckCircle2, Sparkles, Send, MessageSquare } from 'lucide-react';

const HeroStaticDashboard = () => {
  return (
    <div className="relative w-full h-full flex flex-col p-6 justify-between bg-zinc-950/40 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Background neutral glows */}
      <div className="absolute top-[-20%] right-[-10%] w-72 h-72 rounded-full bg-zinc-100/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-60 h-60 rounded-full bg-zinc-400/5 blur-[70px] pointer-events-none" />

      {/* Mock Dashboard Top Nav */}
      <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4 mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
        </div>
        <span className="text-[10px] text-zinc-500 tracking-wider uppercase font-semibold">Legal Connect Console</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800/40 border border-zinc-700/50 rounded-md text-[9px] text-zinc-300 font-bold">
          <Lock size={9} /> Secure
        </div>
      </div>

      {/* Main Mock Content */}
      <div className="flex-1 flex flex-col gap-4 z-10">
        
        {/* Floating Active Case Card */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 shadow-lg animate-float-gravity">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs text-zinc-200 font-bold tracking-wide">Case Tracking File #LC-4920</h4>
            <span className="text-[9px] text-zinc-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse" /> Active Case
            </span>
          </div>
          
          {/* Progress Timeline */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="flex flex-col items-center">
              <CheckCircle2 size={12} className="text-zinc-400" />
              <span className="text-[8px] text-zinc-500 mt-1 font-semibold">1. Case Intake</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 size={12} className="text-zinc-400" />
              <span className="text-[8px] text-zinc-500 mt-1 font-semibold">2. Verification</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full border border-dashed border-zinc-400 animate-spin" />
              <span className="text-[8px] text-zinc-300 mt-1 font-bold">3. Legal Match</span>
            </div>
          </div>
        </div>

        {/* Floating Match Engine Card */}
        <div 
          className="p-4 rounded-xl bg-gradient-to-r from-zinc-900/30 to-zinc-800/30 border border-zinc-800/80 shadow-lg animate-float-gravity"
          style={{ animationDelay: '1.5s' }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={11} className="text-zinc-300" />
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Advocate Matching Engine</span>
          </div>
          <p className="text-xs text-zinc-200 font-medium">Verified Lawyer Assigned: Adarsh Trivedi</p>
          <p className="text-[9px] text-zinc-400 font-semibold mt-1">Specialization: Corporate & Civil Litigation</p>
        </div>

        {/* Floating Chat Bubble Mock */}
        <div 
          className="p-3.5 rounded-xl bg-zinc-900/20 border border-zinc-800/40 shadow-md flex gap-3 items-start animate-float-gravity"
          style={{ animationDelay: '3s' }}
        >
          <div className="w-7 h-7 rounded-lg bg-zinc-800/50 border border-zinc-700/55 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
            AT
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-400 font-bold">Advocate Adarsh</span>
              <span className="text-[8px] text-zinc-500">10:42 AM</span>
            </div>
            <p className="text-[10px] text-zinc-300 leading-normal mt-0.5">
              I have reviewed your corporate contract terms. We are ready to proceed with your filing today.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden bg-[#08080a] pt-32 pb-20">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a08_1px,transparent_1px),linear-gradient(to_bottom,#27272a08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Abstract Glowing shapes */}
      <div className="absolute w-[40rem] h-[25rem] top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-100/5 blur-[120px] pointer-events-none" />
      <div className="absolute w-[30rem] h-[20rem] top-1/3 right-1/4 translate-x-1/2 rounded-full bg-zinc-300/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Heading, Text, CTAs */}
          <div className="lg:col-span-7 text-left flex flex-col items-start">
            
            {/* Tag */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800/10 border border-zinc-800 text-zinc-300 text-xs font-semibold tracking-wider uppercase mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
              Direct-to-Advocate Digital Platform
            </motion.div>

            {/* SEO Optimized H1 Heading */}
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-[1.1] mb-6">
              Legal Connect — <br className="hidden md:inline" />
              <span className="bg-gradient-to-r from-zinc-50 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                Online Lawyer Consultation & <br className="hidden md:inline" /> Expert Legal Advice
              </span>
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed mb-8 font-sans">
              Connect directly with verified advocates, track case timelines in real-time, and get secure, transparent legal consultation online. No retainer uncertainty, no hidden bureaucracy.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              <button
                onClick={() => {
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_8px_30px_rgba(255,255,255,0.05)] cursor-pointer"
              >
                Consult with Advocates
              </button>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-zinc-800 hover:bg-zinc-900/50 text-zinc-300 font-semibold rounded-xl text-sm tracking-wider uppercase transition-all duration-300 backdrop-blur-md cursor-pointer"
              >
                Explore Features
              </button>
            </div>
            
          </div>

          {/* Right Column: Premium Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 w-full h-[360px] md:h-[430px] relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/20 backdrop-blur-md shadow-2xl p-1"
          >
            {/* 21st.dev style frame corners */}
            <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t-2 border-l-2 border-zinc-700/30 rounded-tl pointer-events-none" />
            <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t-2 border-r-2 border-zinc-700/30 rounded-tr pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b-2 border-l-2 border-zinc-700/30 rounded-bl pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b-2 border-r-2 border-zinc-700/30 rounded-br pointer-events-none" />

            <HeroStaticDashboard />
          </motion.div>

        </div>

        {/* Trust & Social Proof Row */}
        <div className="mt-20 pt-10 border-t border-zinc-850 grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-zinc-950/40 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800 shadow-inner">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold font-display text-zinc-100">100%</div>
            <div className="text-xs text-zinc-400 mt-2.5 flex items-center gap-1.5 font-sans font-medium">
              <ShieldCheck size={14} className="text-zinc-400" /> Bar Council Verified
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold font-display text-zinc-100">10k+</div>
            <div className="text-xs text-zinc-400 mt-2.5 flex items-center gap-1.5 font-sans font-medium">
              <Users size={14} className="text-zinc-400" /> Client Cases Resolved
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold font-display text-zinc-100">256-Bit</div>
            <div className="text-xs text-zinc-400 mt-2.5 flex items-center gap-1.5 font-sans font-medium">
              <Lock size={14} className="text-zinc-400" /> SSL Secured Vault
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold font-display text-zinc-100">10 Min</div>
            <div className="text-xs text-zinc-400 mt-2.5 flex items-center gap-1.5 font-sans font-medium">
              <Activity size={14} className="text-zinc-400" /> Average Response Time
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
