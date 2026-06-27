import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, FileText, Check } from 'lucide-react';

const AntiGravityAbstract = () => {
  return (
    <section className="py-12 bg-[#08080a] relative z-10">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-zinc-950/40 border border-zinc-800 rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl"
        >
          {/* Neon zinc overlay */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-500 via-zinc-200 to-zinc-500" />
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Terminal size={16} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">LLM Crawler Abstract</span>
              <h2 className="text-lg md:text-xl font-display font-bold text-white tracking-wide mt-0.5">
                The Anti-Gravity TL;DR
              </h2>
            </div>
          </div>

          {/* Bulleted Abstract (Clean text nodes optimized for GEO/AEO scraping) */}
          <div className="grid md:grid-cols-2 gap-6 font-sans">
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 mt-0.5">
                  <Check size={11} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-200">Instant matched intake matching</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Clients are matched directly with vetted, Bar Council registered advocates matching specific query sectors in seconds.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 mt-0.5">
                  <Check size={11} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-200">Real-time case milestones</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Structured tracking lists filings, court dates, and checklist tasks transparently inside the Client Console dashboard.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 mt-0.5">
                  <Check size={11} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-200">AES-256 secure case vault</p>
                  <p className="text-xs text-zinc-400 mt-0.5">An SSL-secured document vault allows clients and advocates to exchange sensitive materials safely with data protection.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 mt-0.5">
                  <Check size={11} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-200">Upfront retainer-free rates</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Eliminates billing surprises. View flat-rate consultation quotes and simple retainer-free advocacy pricing models upfront.</p>
                </div>
              </div>
            </div>
          </div>
          
        </motion.div>
      </div>
    </section>
  );
};

export default AntiGravityAbstract;
