import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FileText, Search, Scale, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const cases = [
  {
    id: 'LC-2024-001',
    title: 'Property Dispute Settlement',
    type: 'Civil',
    advocate: 'Priya Mehra',
    progress: 75,
    status: 'In Hearing',
    statusColor: '#00e5ff',
    steps: [
      { label: 'Filed', icon: FileText, done: true },
      { label: 'Review', icon: Search, done: true },
      { label: 'Hearing', icon: Scale, done: false, active: true },
      { label: 'Verdict', icon: CheckCircle, done: false },
    ],
  },
  {
    id: 'LC-2024-019',
    title: 'Corporate IP Infringement',
    type: 'Corporate',
    advocate: 'Rahul Singh',
    progress: 40,
    status: 'Under Review',
    statusColor: '#818cf8',
    steps: [
      { label: 'Filed', icon: FileText, done: true },
      { label: 'Review', icon: Search, done: false, active: true },
      { label: 'Hearing', icon: Scale, done: false },
      { label: 'Verdict', icon: CheckCircle, done: false },
    ],
  },
  {
    id: 'LC-2024-033',
    title: 'Wrongful Termination Claim',
    type: 'Labour',
    advocate: 'Sneha Patel',
    progress: 92,
    status: 'Near Verdict',
    statusColor: '#34d399',
    steps: [
      { label: 'Filed', icon: FileText, done: true },
      { label: 'Review', icon: Search, done: true },
      { label: 'Hearing', icon: Scale, done: true },
      { label: 'Verdict', icon: CheckCircle, done: false, active: true },
    ],
  },
];

const ProgressBar = ({ progress, color }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={isInView ? { width: `${progress}%` } : { width: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  );
};

const CaseCard = ({ caseItem, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="glass-card p-6 rounded-2xl border border-white/10"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs text-slate-500 font-mono mb-1">{caseItem.id}</p>
          <h3 className="text-white font-semibold text-base leading-tight">{caseItem.title}</h3>
          <p className="text-slate-400 text-sm mt-1">Advocate: {caseItem.advocate}</p>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
          style={{
            background: `${caseItem.statusColor}1A`,
            color: caseItem.statusColor,
            border: `1px solid ${caseItem.statusColor}33`,
          }}
        >
          {caseItem.status}
        </span>
      </div>

      {/* Step Tracker */}
      <div className="flex items-center gap-2 mb-5">
        {caseItem.steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: step.done
                      ? caseItem.statusColor + '33'
                      : step.active
                      ? caseItem.statusColor + '1A'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${step.done || step.active ? caseItem.statusColor + '80' : 'rgba(255,255,255,0.08)'}`,
                  }}
                  animate={step.active ? { boxShadow: [`0 0 0px ${caseItem.statusColor}`, `0 0 10px ${caseItem.statusColor}80`, `0 0 0px ${caseItem.statusColor}`] } : {}}
                  transition={step.active ? { duration: 2, repeat: Infinity } : {}}
                >
                  <Icon size={14} style={{ color: step.done || step.active ? caseItem.statusColor : '#475569' }} />
                </motion.div>
                <span className="text-xs text-slate-500">{step.label}</span>
              </div>
              {i < caseItem.steps.length - 1 && (
                <div className="flex-1 h-px mb-4" style={{ background: step.done ? caseItem.statusColor + '60' : 'rgba(255,255,255,0.06)' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <ProgressBar progress={caseItem.progress} color={caseItem.statusColor} />
        <span className="text-xs font-semibold" style={{ color: caseItem.statusColor }}>
          {caseItem.progress}%
        </span>
      </div>
    </motion.div>
  );
};

const CaseTimeline = () => {
  return (
    <section id="timeline" className="py-24 bg-[#04080f]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-legal-cyan text-sm font-semibold tracking-[0.3em] uppercase">Real-Time Updates</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mt-2">
            Live Case Timeline
          </h2>
          <p className="text-slate-400 mt-3 max-w-lg">
            Track your ongoing cases with granular, real-time stage updates.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <CaseCard key={c.id} caseItem={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseTimeline;
