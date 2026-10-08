import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How do I hire an advocate online through Legal Connect?',
    answer:
      'Hiring an advocate on Legal Connect takes three steps: (1) Search our verified directory by case type and location, (2) message your chosen advocate via our encrypted AdvoTalk chat to discuss your case, and (3) formally engage them with a digital agreement. The entire process — from finding to hiring — can be completed in under 30 minutes from any device.',
  },
  {
    question: 'Are the lawyers on Legal Connect verified and licensed?',
    answer:
      'Yes. Every advocate listed on Legal Connect undergoes a strict three-layer verification process: (a) government-issued identity check, (b) State Bar Council enrolment number validation, and (c) a peer review of their professional history. No advocate appears on the platform without passing all three checks.',
  },
  {
    question: 'What types of legal cases does Legal Connect handle?',
    answer:
      'Legal Connect connects clients with verified advocates specialising in property disputes, criminal defence, family law (divorce, custody, maintenance), corporate & startup law, labour & employment disputes, consumer complaints, and civil matters across District Courts, High Courts, and the Supreme Court of India.',
  },
  {
    question: 'How much does a consultation cost on Legal Connect?',
    answer:
      'Consultation fees are set by each advocate and are displayed transparently on their profile before you initiate a chat. There are no hidden platform charges. You only pay the fee agreed with your advocate, and all transactions are secured through our platform.',
  },
  {
    question: 'Can I track my case progress after hiring a lawyer?',
    answer:
      'Absolutely. Every client gets a dedicated case dashboard that tracks your matter in real time across four stages: Filed → Under Review → In Hearing → Verdict. Your advocate updates the status after each hearing, and you receive instant notifications. You can also access your shared document vault at any time.',
  },
  {
    question: 'Is my conversation with my advocate confidential?',
    answer:
      'Yes. All communications on Legal Connect are end-to-end encrypted and are protected under attorney-client privilege. Uploaded documents are stored in a private, encrypted vault. Legal Connect staff cannot read your messages or access your case files.',
  },
  {
    question: 'How do I find a property lawyer near me in India?',
    answer:
      'Use the search bar on the Legal Connect services page and select "Property Law" as the practice area, then filter by your city or the relevant court. You\'ll see a list of verified property advocates with their profiles, fees, and ratings. You can message any of them instantly — no appointment required.',
  },
  {
    question: 'What happens if I am not satisfied with my advocate?',
    answer:
      'Legal Connect offers a structured dispute resolution process. If you are unsatisfied with your advocate\'s service, you can flag the engagement within your dashboard. Our legal operations team will review the matter and, if valid, assist you in transitioning to a different verified advocate without losing your case history.',
  },
];

const FAQItem = ({ faq, index, isOpen, onToggle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className="border-b border-white/5 last:border-b-0"
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-legal-cyan/50 rounded"
      >
        <h3 className="text-white font-semibold text-sm md:text-base leading-snug group-hover:text-legal-cyan transition-colors duration-200 pr-4">
          {faq.question}
        </h3>
        <span
          className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-300"
          style={{
            background: isOpen ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isOpen ? 'rgba(0,229,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
            color: isOpen ? '#00e5ff' : '#475569',
          }}
        >
          {isOpen ? <Minus size={13} /> : <Plus size={13} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-slate-400 text-sm leading-relaxed max-w-3xl">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-24 bg-[#04080f]"
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-legal-cyan/5 border border-legal-cyan/20 text-legal-cyan text-xs font-semibold tracking-wider uppercase mb-5">
            <HelpCircle size={13} />
            Frequently Asked Questions
          </div>
          <h2
            id="faq-heading"
            className="text-3xl md:text-5xl font-display font-bold text-white mb-4"
          >
            Got Questions?{' '}
            <span className="bg-gradient-to-r from-legal-cyan to-indigo-400 bg-clip-text text-transparent">
              We Have Answers.
            </span>
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            Everything you need to know before engaging a lawyer through Legal Connect — answered directly and honestly.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm divide-y-0 px-6 md:px-8"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </motion.div>

        {/* Schema-ready structured data note (for developers) */}
        <p className="text-center text-slate-700 text-xs mt-8">
          This FAQ is structured for AI and search engine extraction (AEO/GEO optimised).
        </p>
      </div>
    </section>
  );
};

export default FAQAccordion;
