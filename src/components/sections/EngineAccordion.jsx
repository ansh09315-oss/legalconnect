import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqItems = [
  {
    question: "How does Legal Connect match clients with verified advocates?",
    answer: "The platform's matching engine parses client intake details—specialization, query context, and court jurisdiction—and filters profiles of vetted advocates in the database. Every profile holds manual Bar Council registration verification to ensure authentic legal counsel matchmaker mappings."
  },
  {
    question: "Is data stored in the digital case document vault secure?",
    answer: "Yes. Evidentiary records, contract files, and counsel messages are fully encrypted in transit and at rest using SSL/TLS 1.3 protocol standards. Storage compartments are isolated so access remains exclusively restricted to you and your matched advocate."
  },
  {
    question: "What is the cost of booking an online lawyer consultation?",
    answer: "Advocate consulting rates are displayed flat and upfront directly on their profiles. The platform uses a retainer-free flat-billing model, meaning clients only pay for the specific session or services rendered with zero hidden fees."
  },
  {
    question: "Can clients track their legal case progress in real-time?",
    answer: "Yes. The Client Console contains a case milestone tracker. Matched advocates update the timeline as they progress (e.g., petition draft, document authentication, court filing, hearing), showing progress stages on the dashboard instantly."
  }
];

const AccordionItem = ({ item, isOpen, onClick, idx }) => {
  return (
    <div className="border-b border-zinc-800 py-4 font-sans">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between text-left py-2 font-display font-semibold text-zinc-100 hover:text-white transition-colors group cursor-pointer"
      >
        <span className="text-sm md:text-base flex items-center gap-3">
          <HelpCircle size={16} className="text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-zinc-500 group-hover:text-zinc-300 shrink-0 ml-4"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mt-2.5 pl-7 border-l border-zinc-800">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EngineAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-24 bg-[#08080a] border-t border-zinc-900 relative z-10">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="px-3 py-1 rounded-full bg-zinc-800/10 border border-zinc-850 text-zinc-400 text-xs font-semibold tracking-wider uppercase inline-block mb-4">
            AEO FAQ Engine
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
            Core Engine Q&A
          </h2>
          <h3 className="text-xs md:text-sm text-zinc-500 mt-2 font-medium">
            Structured direct responses optimized for AI search engines and lawyer directory lookup indexing.
          </h3>
        </div>

        {/* Accordion List */}
        <div className="bg-zinc-950/20 border border-zinc-850 rounded-2xl p-6 md:p-8 shadow-lg">
          {faqItems.map((item, idx) => (
            <AccordionItem
              key={idx}
              item={item}
              isOpen={openIndex === idx}
              onClick={() => handleToggle(idx)}
              idx={idx}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default EngineAccordion;
