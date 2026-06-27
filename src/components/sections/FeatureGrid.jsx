import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Activity, Lock, ShieldCheck, Scale } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Instant Matchmaking',
    description: 'Our digital matching engine immediately connects your query with verified advocates specializing in your specific case category.',
    color: 'from-blue-500/20 to-indigo-500/20',
    iconColor: 'text-blue-400',
    borderColor: 'group-hover:border-blue-500/30'
  },
  {
    icon: MessageSquare,
    title: 'Secure Consultations',
    description: 'Consult directly with legal specialists through secure, encrypted messaging, voice, or video channels, ensuring client privilege.',
    color: 'from-indigo-500/20 to-violet-500/20',
    iconColor: 'text-indigo-400',
    borderColor: 'group-hover:border-indigo-500/30'
  },
  {
    icon: Activity,
    title: 'Real-Time Case Milestones',
    description: 'Track legal proceedings step-by-step. Monitor active status, filings, court dates, and counsel checklist updates in real-time.',
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
    borderColor: 'group-hover:border-cyan-500/30'
  },
  {
    icon: Lock,
    title: 'Digital Document Vault',
    description: 'Safely upload and store petitions, evidence files, and case records inside a secure, encrypted repository with federal grade security.',
    color: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-400',
    borderColor: 'group-hover:border-purple-500/30'
  },
  {
    icon: ShieldCheck,
    title: 'Verified Advocate Network',
    description: 'Every advocate profile is manually vetted. We verify Bar Council registration status, qualifications, and case histories.',
    color: 'from-indigo-500/20 to-blue-500/20',
    iconColor: 'text-indigo-400',
    borderColor: 'group-hover:border-blue-500/30'
  },
  {
    icon: Scale,
    title: 'Flat & Transparent Fees',
    description: 'Eliminate billing surprises. Review standard fixed consultation costs and flat service fees upfront before committing.',
    color: 'from-blue-500/20 to-violet-500/20',
    iconColor: 'text-blue-400',
    borderColor: 'group-hover:border-violet-500/30'
  }
];

const FeatureGrid = () => {
  return (
    <section id="features" className="relative py-24 bg-[#030014] overflow-hidden">
      {/* Background ambient light gradients */}
      <div className="absolute w-[30rem] h-[30rem] bottom-0 right-[-10%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute w-[30rem] h-[30rem] top-0 left-[-10%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 font-sans">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase inline-block mb-4"
          >
            Digital Suite
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight"
          >
            Engineered for Speed, Transparency, <br /> and Secure Consultation
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm md:text-base text-slate-400 mt-4 leading-relaxed"
          >
            A high-performance legal consulting ecosystem combining vetted counsel with digital case management tools.
          </motion.p>
        </div>

        {/* Features Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`group interactive p-8 rounded-2xl bg-[#090622]/40 backdrop-blur-xl border border-white/5 hover:bg-slate-900/40 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[260px] ${feature.borderColor}`}
              >
                {/* Subtle backglow gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />
                
                <div>
                  {/* Icon Block */}
                  <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shrink-0 transition-colors ${feature.iconColor} group-hover:bg-blue-500/10 group-hover:border-blue-500/30`}>
                    <Icon size={22} />
                  </div>
                  
                  {/* Content (Immediate text nodes for SEO) */}
                  <h3 className="text-lg font-display font-bold text-white tracking-wide mb-3 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
                
                {/* Subtle Indicator */}
                <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  <span>Vetted Security</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 group-hover:bg-blue-500 animate-pulse" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FeatureGrid;
