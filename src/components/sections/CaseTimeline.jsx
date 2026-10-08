import React from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Find Your Advocate',
    color: '#00e5ff',
    glow: 'rgba(0,229,255,0.15)',
    border: 'rgba(0,229,255,0.25)',
    description:
      'Browse our directory of verified advocates filtered by specialisation, location, court, experience, and client ratings. Every lawyer is identity-verified before listing.',
    actions: [
      'Search by case type (property, criminal, family, corporate)',
      'Filter by court — High Court, District, Supreme Court',
      'Compare profiles, fees, and client reviews',
    ],
    cta: 'Find an Advocate',
    ctaHref: '#services',
  },
  {
    number: '02',
    icon: MessageSquare,
    title: 'Consult Online',
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.15)',
    border: 'rgba(129,140,248,0.25)',
    description:
      'Connect instantly via our encrypted AdvoTalk messaging platform. Share documents, discuss your case in full confidentiality, and get a clear legal opinion before committing.',
    actions: [
      'Instant chat with your chosen advocate',
      'Upload case documents securely',
      'Receive a clear written legal opinion',
    ],
    cta: 'Start Consultation',
    ctaHref: '#advotalk',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Hire & Track Progress',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
    border: 'rgba(52,211,153,0.25)',
    description:
      'Once you decide to hire, formalise the engagement on the platform. Your advocate keeps you updated at every case stage — no more chasing calls or wondering what\'s happening.',
    actions: [
      'Formal digital engagement agreement',
      'Real-time case stage updates',
      'Shared document vault & hearing reminders',
    ],
    cta: 'Hire an Advocate',
    ctaHref: '#services',
  },
];

const HowItWorks = () => {
  return (
    <section
      id="timeline"
      aria-labelledby="how-it-works-heading"
      className="py-24 bg-[#04080f]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-legal-cyan text-sm font-semibold tracking-[0.3em] uppercase">
            Simple 3-Step Process
          </span>
          <h2
            id="how-it-works-heading"
            className="text-4xl md:text-5xl font-display font-bold text-white mt-3 mb-4"
          >
            How It Works
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            From finding the right advocate to hiring and tracking your case —
            everything happens on one secure platform in minutes.
          </p>
        </motion.div>

        {/* 3 Step Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative group flex flex-col rounded-2xl p-7 border transition-all duration-300"
                style={{
                  background: `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
                  borderColor: step.border,
                  boxShadow: `0 0 0 0 ${step.glow}`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = `0 20px 60px ${step.glow}`;
                  e.currentTarget.style.borderColor = step.color + '60';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = `0 0 0 0 ${step.glow}`;
                  e.currentTarget.style.borderColor = step.border;
                }}
              >
                {/* Step Number */}
                <span
                  className="absolute top-6 right-7 text-6xl font-black font-display select-none pointer-events-none"
                  style={{ color: step.color, opacity: 0.07 }}
                >
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0"
                  style={{
                    background: step.glow,
                    border: `1px solid ${step.border}`,
                  }}
                >
                  <Icon size={26} style={{ color: step.color }} />
                </div>

                {/* Step Badge */}
                <span
                  className="text-xs font-bold tracking-widest uppercase mb-2"
                  style={{ color: step.color }}
                >
                  Step {step.number}
                </span>

                {/* Title */}
                <h3 className="text-xl font-display font-bold text-white mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  {step.description}
                </p>

                {/* Action List */}
                <ul className="space-y-2 mb-6 flex-1">
                  {step.actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: step.color }}
                      />
                      {action}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={step.ctaHref}
                  onClick={e => {
                    e.preventDefault();
                    document.getElementById(step.ctaHref.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 group/btn"
                  style={{ color: step.color }}
                >
                  {step.cta}
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover/btn:translate-x-1"
                  />
                </a>
              </motion.article>
            );
          })}
        </div>

        {/* Connector line decoration on large screens */}
        <div className="hidden md:flex items-center justify-center mt-4 gap-0 pointer-events-none select-none" aria-hidden="true">
          {[0, 1].map(i => (
            <div key={i} className="flex items-center" style={{ width: '33.33%' }}>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <ArrowRight size={14} className="text-white/10 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
