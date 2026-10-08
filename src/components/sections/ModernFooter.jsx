import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Send, Rss, MessageCircle, Scale } from 'lucide-react';

const socials = [
  { icon: Globe, href: '#', label: 'Website' },
  { icon: Send, href: '#', label: 'Telegram' },
  { icon: Rss, href: '#', label: 'Blog' },
  { icon: MessageCircle, href: '#', label: 'Chat' },
];

const links = {
  Services: ['Find Advocate', 'AdvoTalk', 'Document Vault', 'Case Tracker'],
  Company: ['About Us', 'Careers', 'Blog', 'Press'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer'],
};

/* ── JSON-LD Schema for SEO / AEO ── */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LegalService',
      name: 'Legal Connect',
      description:
        'Legal Connect is an online platform connecting Indian citizens with verified, bar-council-registered advocates for consultations and full case representation.',
      url: 'https://legalconnect.in',
      areaServed: 'IN',
      serviceType: [
        'Online Lawyer Consultation',
        'Legal Advice',
        'Property Dispute Lawyer',
        'Criminal Defence Advocate',
        'Family Law Consultation',
        'Corporate Legal Services',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Legal Services',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Find Verified Advocate' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Online Legal Consultation' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Case Progress Tracking' } },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I hire an advocate online through Legal Connect?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Hiring an advocate on Legal Connect takes three steps: Search our verified directory by case type and location, message your chosen advocate via AdvoTalk chat, and formally engage them with a digital agreement.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are the lawyers on Legal Connect verified and licensed?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Every advocate undergoes a three-layer verification: identity check, State Bar Council enrolment validation, and peer review before listing.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I find a property lawyer near me in India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use the search bar on Legal Connect, select Property Law as the practice area, then filter by your city or relevant court to see verified property advocates instantly.',
          },
        },
      ],
    },
  ],
};

const SocialIcon = ({ social, index }) => {
  const Icon = social.icon;
  return (
    <motion.a
      href={social.href}
      aria-label={social.label}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.15 }}
      className="interactive w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-legal-cyan hover:border-legal-cyan/40 hover:bg-legal-cyan/5 transition-colors"
    >
      <Icon size={18} />
    </motion.a>
  );
};

const ModernFooter = () => {
  return (
    <footer className="border-t border-white/5 bg-[#04080f] pt-16 pb-8">
      {/* JSON-LD Schema injection point */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-8 h-8 rounded-lg bg-legal-cyan/10 border border-legal-cyan/30 flex items-center justify-center">
                <Scale size={18} className="text-legal-cyan" />
              </div>
              <span className="text-white font-display font-bold text-xl">LegalConnect</span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 text-sm leading-relaxed max-w-xs"
            >
              The new dimension of digital law. Connecting citizens to expert legal minds through technology.
            </motion.p>
            <div className="flex items-center gap-2 mt-6">
              {socials.map((s, i) => (
                <SocialIcon key={s.label} social={s} index={i} />
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items], catIndex) => (
            <div key={category}>
              <motion.h4
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.08 }}
                className="text-white font-semibold text-sm mb-4 uppercase tracking-widest"
              >
                {category}
              </motion.h4>
              <ul className="space-y-3">
                {items.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: catIndex * 0.08 + i * 0.05 }}
                  >
                    <a
                      href="#"
                      className="interactive text-slate-500 text-sm hover:text-legal-cyan transition-colors"
                    >
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/5 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} LegalConnect. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs font-mono tracking-wide">
            Built with precision by the LegalConnect team.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;
