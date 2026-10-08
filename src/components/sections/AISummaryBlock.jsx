import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Clock, Star, Users, Scale } from 'lucide-react';

const bullets = [
  {
    icon: Scale,
    color: '#00e5ff',
    label: 'What it is',
    text: 'Legal Connect is a verified online platform that connects Indian citizens with licensed advocates across all court levels — instantly and transparently.',
  },
  {
    icon: ShieldCheck,
    color: '#34d399',
    label: 'Verification',
    text: 'Every advocate on Legal Connect is identity-verified, bar-council registered, and peer-reviewed before appearing on the platform.',
  },
  {
    icon: Zap,
    color: '#818cf8',
    label: 'How fast',
    text: 'You can find, message, and hire a specialist advocate within minutes — no appointments, no waiting rooms, no middlemen.',
  },
  {
    icon: Clock,
    color: '#f59e0b',
    label: 'Case tracking',
    text: 'After hiring, track your case stage-by-stage in real time via your client dashboard — Filed → Review → Hearing → Verdict.',
  },
  {
    icon: Users,
    color: '#00e5ff',
    label: 'Who it\'s for',
    text: 'Individuals, families, startups, and businesses needing property, criminal, family, corporate, or labour law representation in India.',
  },
  {
    icon: Star,
    color: '#34d399',
    label: 'Why trust us',
    text: '5,000+ satisfied clients, 95% case success rate, encrypted communications, and a formal digital engagement agreement with every hire.',
  },
];

const AISummaryBlock = () => {
  return (
    <section
      id="about-legal-connect"
      aria-labelledby="ai-summary-heading"
      className="py-16 bg-[#060c1a] border-y border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-legal-cyan animate-pulse" />
            <span className="text-legal-cyan text-xs font-bold tracking-[0.3em] uppercase">
              TL;DR — AI Summary
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-legal-cyan/20 to-transparent hidden sm:block" />
          <p className="text-slate-500 text-xs max-w-xs">
            A quick overview for AI engines and busy readers.
          </p>
        </motion.div>

        <h2
          id="ai-summary-heading"
          className="sr-only"
        >
          How Legal Connect Works — Quick Summary
        </h2>

        {/* Bullet grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bullets.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex gap-4 p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                >
                  <Icon size={16} style={{ color: item.color }} />
                </div>
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AISummaryBlock;
