/**
 * LegalConnectHomePage.jsx
 * Production-ready, single-file React homepage for "Legal Connect"
 * Theme: Pitch Black (#000) | White text | #00e5ff Electric Cyan accents
 * Optimized for: SEO | GEO | AEO | SXO | Core Web Vitals
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Scale,
  Menu,
  X,
  Search,
  Video,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Star,
  Lock,
  Clock,
  Briefcase,
  Gavel,
  Building2,
  Heart,
  ArrowRight,
  Check,
  Sparkles,
  MapPin,
  PhoneCall,
  FileText,
  BadgeCheck,
} from 'lucide-react';

/* ─── DESIGN TOKENS ───────────────────────────────────── */
const CYAN = '#00e5ff';
const CYAN_DIM = 'rgba(0,229,255,0.12)';
const CYAN_BORDER = 'rgba(0,229,255,0.25)';
const CYAN_GLOW = '0 0 24px rgba(0,229,255,0.35)';

/* ─── STATIC DATA ─────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Find Advocates', href: '#find-advocates' },
  { label: 'Practice Areas', href: '#practice-areas' },
  { label: 'How It Works',   href: '#how-it-works'   },
  { label: 'Pricing',        href: '#pricing'        },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Search & Filter',
    description:
      'Browse our directory of verified advocates by location, budget, specialisation, and years of experience. Use smart filters to find the exact legal expertise your case demands.',
  },
  {
    step: '02',
    icon: Video,
    title: 'Instant Consultation',
    description:
      'Connect immediately via secure, end-to-end encrypted video, audio, or text chat. Get real legal advice from certified advocates without leaving your home.',
  },
  {
    step: '03',
    icon: ShieldCheck,
    title: 'Securely Hire',
    description:
      'Retain your chosen advocate with fully transparent, milestone-based payment schedules. Our escrow model ensures you only pay when deliverables are confirmed.',
  },
];

const PRACTICE_AREAS = [
  {
    icon: Heart,
    title: 'Family Law',
    description: 'Divorce, child custody, adoption, and matrimonial property disputes handled with confidentiality and care.',
    tags: ['Divorce', 'Custody', 'Adoption'],
    category: 'Family Law',
  },
  {
    icon: Briefcase,
    title: 'Corporate & Startup',
    description: 'Company incorporation, shareholder agreements, due diligence, venture term sheets, and regulatory compliance.',
    tags: ['Incorporation', 'Contracts', 'Compliance'],
    category: 'Corporate Law',
  },
  {
    icon: Gavel,
    title: 'Criminal Defense',
    description: 'Bail hearings, FIR representation, trial advocacy, and appeals handled by experienced defense counsel.',
    tags: ['Bail', 'FIR', 'Trial', 'Appeals'],
    category: 'Criminal Law',
  },
  {
    icon: Building2,
    title: 'Property & Real Estate',
    description: 'Title verification, sale deed drafting, builder disputes, RERA complaints, and landlord-tenant litigation.',
    tags: ['Title Deed', 'RERA', 'Disputes'],
    category: 'Property Law',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How do I hire an advocate online through Legal Connect?',
    answer:
      'Hiring an advocate on Legal Connect is a three-step process. First, search our verified directory using filters for practice area, location, and budget. Second, view detailed advocate profiles including credentials, reviews, and pricing. Third, book a consultation directly from the profile page. Once you select a preferred advocate, you can formally retain them via our secure milestone payment system — no cash exchanged in person, and no hidden charges.',
  },
  {
    question: 'Are all lawyers on Legal Connect verified?',
    answer:
      'Yes. Every advocate listed on Legal Connect undergoes a mandatory multi-step verification process. This includes Bar Council registration validation, identity document checks, educational credential verification, and a peer review assessment. Only advocates who pass all verification stages receive the "Verified Badge" visible on their public profile. This process ensures you always consult legitimate, qualified legal professionals.',
  },
  {
    question: 'How much does an online legal consultation cost?',
    answer:
      'Consultation fees on Legal Connect vary by advocate, specialisation, and session duration. Advocates set their own transparent, upfront rates — typically ranging from ₹500 for a 15-minute advice session to ₹5,000+ for a full case strategy review. All fees are displayed clearly before you book, with zero hidden charges. We also offer a free 10-minute introductory call with selected advocates through our "Free First Consult" programme.',
  },
];

const TRUST_STATS = [
  { value: '10,000+', label: 'Cases Resolved',     icon: FileText   },
  { value: '1,200+',  label: 'Verified Advocates', icon: BadgeCheck },
  { value: '4.9 / 5', label: 'Average Rating',     icon: Star       },
  { value: '10 min',  label: 'Avg. Response Time', icon: Clock      },
];

const FOOTER_COLS = [
  {
    heading: 'Company',
    links: ['About Us', 'Careers', 'Press', 'Blog', 'Contact Us'],
  },
  {
    heading: 'Legal Categories',
    links: ['Family Law', 'Corporate Law', 'Criminal Defense', 'Property Law', 'Intellectual Property'],
  },
  {
    heading: 'Resources',
    links: ['Legal Guides', 'Case Studies', 'Advocate Login', 'API Documentation', 'Privacy Policy'],
  },
];

/* ─── REUSABLE BUTTONS ────────────────────────────────── */

/** Primary CTA — filled cyan */
const CyanButton = ({ children, className = '', onClick, href }) => {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-black
    transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black ${className}`;
  const style = {
    background: CYAN,
    boxShadow: CYAN_GLOW,
    focusRingColor: CYAN,
  };
  if (href)
    return <a href={href} className={cls} style={style}>{children}</a>;
  return <button onClick={onClick} className={cls} style={style}>{children}</button>;
};

/** Outline CTA — cyan border + white text */
const OutlineButton = ({ children, className = '', onClick, href }) => {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl border px-7 py-3.5 text-sm font-semibold
    text-white transition-all duration-200 hover:-translate-y-0.5 hover:text-black active:translate-y-0
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black ${className}`;
  const style = {
    borderColor: CYAN,
    '--tw-ring-color': CYAN,
  };
  const [hovered, setHovered] = useState(false);
  const hoverStyle = hovered
    ? { ...style, background: CYAN, boxShadow: CYAN_GLOW }
    : style;
  if (href)
    return (
      <a
        href={href}
        className={cls}
        style={hoverStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </a>
    );
  return (
    <button
      onClick={onClick}
      className={cls}
      style={hoverStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
};

/** FAQ accordion item */
const FaqItem = ({ question, answer, isOpen, onToggle }) => (
  <div
    className="rounded-xl overflow-hidden transition-all duration-300"
    style={{
      border: `1px solid ${isOpen ? CYAN : 'rgba(255,255,255,0.1)'}`,
      background: isOpen ? CYAN_DIM : 'rgba(255,255,255,0.03)',
      boxShadow: isOpen ? CYAN_GLOW : 'none',
    }}
  >
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left
        focus:outline-none focus:ring-2 focus:ring-inset"
      style={{ '--tw-ring-color': CYAN }}
    >
      <h3 className="text-base font-semibold text-white leading-snug">{question}</h3>
      <span style={{ color: CYAN }} className="shrink-0">
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </span>
    </button>
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: isOpen ? '20rem' : 0, opacity: isOpen ? 1 : 0 }}
    >
      <p
        className="px-6 pb-5 text-sm leading-relaxed pt-2"
        style={{ color: 'rgba(255,255,255,0.65)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        {answer}
      </p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */

const LegalConnectHomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin } = useAuth();

  // Navigate to ServicesPortal with category pre-selected
  const openCategory = (category) => {
    navigate(`/?category=${encodeURIComponent(category)}`);
    setTimeout(() => {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) navigate('/admin');
      else if (user?.role === 'lawyer') navigate('/lawyer');
      else if (user?.cases?.length > 0) navigate('/client-dashboard');
    }
  }, [isAuthenticated, user, isAdmin, navigate]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex]     = useState(null);
  const toggleFaq = (idx) => setOpenFaqIndex(openFaqIndex === idx ? null : idx);

  return (
    <div className="min-h-screen antialiased" style={{ background: '#000', color: '#fff' }}>

      {/* ════════════════════════════════════════
          A. HEADER / NAV
      ════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 w-full backdrop-blur-md"
        style={{ background: 'rgba(0,0,0,0.85)', borderBottom: `1px solid ${CYAN_BORDER}` }}
      >
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        >
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2.5 text-xl font-bold text-white"
            aria-label="Legal Connect — Home"
          >
            <Scale size={26} style={{ color: CYAN }} aria-hidden="true" />
            Legal<span style={{ color: CYAN }}>Connect</span>
          </a>

          {/* Desktop nav links */}
          <ul className="hidden items-center gap-8 md:flex" role="list">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="text-sm font-medium transition-colors focus:outline-none focus:underline"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                  onMouseEnter={e => (e.target.style.color = CYAN)}
                  onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.65)')}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/login"
              className="text-sm font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              onMouseEnter={e => (e.target.style.color = '#fff')}
              onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.65)')}
            >
              Login
            </a>
            <a
              href="/register-lawyer"
              className="rounded-xl px-4 py-2 text-sm font-bold text-black transition-all hover:-translate-y-0.5"
              style={{ background: CYAN, boxShadow: CYAN_GLOW }}
            >
              Join as Advocate
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="rounded-lg p-2 md:hidden"
            style={{ color: CYAN }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile drawer */}
        <div
          id="mobile-nav"
          className="overflow-hidden transition-all duration-300 md:hidden"
          style={{
            maxHeight: mobileMenuOpen ? '24rem' : 0,
            opacity: mobileMenuOpen ? 1 : 0,
            borderTop: mobileMenuOpen ? `1px solid ${CYAN_BORDER}` : 'none',
          }}
        >
          <ul className="flex flex-col px-4 py-4 gap-1" role="list">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="pt-3 mt-1" style={{ borderTop: `1px solid ${CYAN_BORDER}` }}>
              <a href="/login" className="block px-3 py-2.5 text-sm text-white/60 hover:text-white">Login</a>
            </li>
            <li>
              <a
                href="/register-lawyer"
                className="block rounded-xl px-3 py-2.5 text-center text-sm font-bold text-black"
                style={{ background: CYAN }}
              >
                Join as Advocate
              </a>
            </li>
          </ul>
        </div>
      </header>

      <main id="main-content">

        {/* ════════════════════════════════════════
            B. HERO SECTION
        ════════════════════════════════════════ */}
        <section
          id="hero"
          aria-labelledby="hero-heading"
          className="relative overflow-hidden py-20 sm:py-28 lg:py-36"
          style={{ background: '#000' }}
        >
          {/* Grid overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                `linear-gradient(${CYAN_BORDER} 1px, transparent 1px),
                 linear-gradient(90deg, ${CYAN_BORDER} 1px, transparent 1px)`,
              backgroundSize: '3rem 3rem',
              maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 100%)',
            }}
          />
          {/* Cyan radial glow */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 rounded-full pointer-events-none"
            style={{
              width: 600,
              height: 600,
              background: `radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)`,
              transform: 'translate(20%, -40%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 rounded-full pointer-events-none"
            style={{
              width: 400,
              height: 400,
              background: `radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)`,
              transform: 'translate(-30%, 40%)',
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">

              {/* Trust badge */}
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{
                  border: `1px solid ${CYAN_BORDER}`,
                  background: CYAN_DIM,
                  color: CYAN,
                }}
              >
                <BadgeCheck size={14} aria-hidden="true" />
                100% Bar Council Verified Advocates
              </div>

              {/* H1 */}
              <h1
                id="hero-heading"
                className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
                style={{ color: '#fff' }}
              >
                Find & Hire Trusted,{' '}
                <span style={{ color: CYAN }}>Verified Advocates</span> Online.
              </h1>

              {/* Subheading */}
              <p className="mt-6 text-lg leading-relaxed sm:text-xl" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Legal Connect gives you 24/7 on-demand access to India's top verified legal
                minds. Consult, retain, and collaborate with licensed advocates in minutes —
                entirely online, fully encrypted, and completely transparent on cost.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <CyanButton href="#find-advocates" className="text-base px-8 py-4">
                  <PhoneCall size={18} aria-hidden="true" />
                  Consult an Advocate Online
                </CyanButton>
                <OutlineButton href="#practice-areas" className="text-base px-8 py-4">
                  <Search size={18} aria-hidden="true" />
                  Browse Legal Experts
                </OutlineButton>
              </div>

            </div>

            {/* Trust stats */}
            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-5 sm:grid-cols-4">
              {TRUST_STATS.map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center rounded-2xl px-4 py-6 text-center transition-all duration-300 hover:-translate-y-1"
                  style={{
                    border: `1px solid ${CYAN_BORDER}`,
                    background: CYAN_DIM,
                  }}
                >
                  <Icon size={22} className="mb-2" style={{ color: CYAN }} aria-hidden="true" />
                  <span className="text-2xl font-bold text-white">{value}</span>
                  <span className="mt-1 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            C. AI SUMMARY / TL;DR
        ════════════════════════════════════════ */}
        <section
          id="ai-summary"
          aria-label="AI Summary — Legal Connect Platform Overview"
          className="py-12"
          style={{ background: '#000', borderTop: `1px solid rgba(255,255,255,0.06)`, borderBottom: `1px solid rgba(255,255,255,0.06)` }}
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                border: `1px solid ${CYAN_BORDER}`,
                background: CYAN_DIM,
                boxShadow: `0 0 40px rgba(0,229,255,0.08)`,
              }}
            >
              {/* Badge row */}
              <div className="mb-5 flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
                  style={{ background: 'rgba(0,229,255,0.18)', color: CYAN, border: `1px solid ${CYAN_BORDER}` }}
                >
                  <Sparkles size={11} aria-hidden="true" />
                  AI Summary
                </span>
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Structured for LLM & AI search engines
                </span>
              </div>

              <h2 className="mb-5 text-xl font-bold text-white">
                What is Legal Connect? — Quick Overview
              </h2>

              <ul className="space-y-4" role="list" aria-label="Key platform facts">
                {[
                  { icon: BadgeCheck, text: '100% Bar Council Verified: Every advocate is manually verified against official Bar Council registration records before listing.' },
                  { icon: Lock,       text: 'End-to-End Encrypted Consultations: All video, audio, and text sessions are protected with AES-256 encryption — attorney-client privilege upheld digitally.' },
                  { icon: Check,      text: 'Transparent, Fixed-Rate Pricing: Advocate fees are displayed in full before booking. No surprise invoices, no retainer shock.' },
                  { icon: FileText,   text: 'Integrated Digital Case Management: Clients and advocates share documents, track milestones, and manage filings inside a single secure dashboard.' },
                  { icon: MapPin,     text: 'Pan-India Reach: Access verified advocates across all 28 Indian states and major union territories, available in English and regional languages.' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <Icon size={17} className="mt-0.5 shrink-0" style={{ color: CYAN }} aria-hidden="true" />
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            D. HOW IT WORKS
        ════════════════════════════════════════ */}
        <section
          id="how-it-works"
          aria-labelledby="how-heading"
          className="py-20 sm:py-24"
          style={{ background: '#050505' }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-2xl text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: CYAN }}>
                Simple 3-Step Process
              </span>
              <h2
                id="how-heading"
                className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
              >
                How Legal Connect Works
              </h2>
              <p className="mt-4 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
                From finding the right advocate to retaining them — the entire legal journey
                completed online in three transparent steps.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {HOW_IT_WORKS_STEPS.map(({ step, icon: Icon, title, description }) => (
                <div
                  key={step}
                  className="group relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5"
                  style={{
                    border: `1px solid rgba(255,255,255,0.08)`,
                    background: 'rgba(255,255,255,0.03)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = `1px solid ${CYAN_BORDER}`;
                    e.currentTarget.style.boxShadow = CYAN_GLOW;
                    e.currentTarget.style.background = CYAN_DIM;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  {/* Step number */}
                  <span
                    className="mb-4 block text-5xl font-black font-mono leading-none select-none"
                    style={{ color: CYAN_BORDER }}
                  >
                    {step}
                  </span>

                  {/* Icon circle */}
                  <div
                    className="mb-4 inline-flex rounded-xl p-3"
                    style={{ border: `1px solid ${CYAN_BORDER}`, background: CYAN_DIM }}
                  >
                    <Icon size={24} style={{ color: CYAN }} aria-hidden="true" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {description}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════
            E. PRACTICE AREAS
        ════════════════════════════════════════ */}
        <section
          id="practice-areas"
          aria-labelledby="practice-heading"
          className="py-20 sm:py-24"
          style={{ background: '#000', borderTop: `1px solid rgba(255,255,255,0.06)` }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-2xl text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: CYAN }}>
                Specialized Legal Counsel
              </span>
              <h2
                id="practice-heading"
                className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
              >
                Browse by Practice Area
              </h2>
              <p className="mt-4 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Connect with advocates specializing in every dimension of Indian law — personally
                matched to your exact legal requirement.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PRACTICE_AREAS.map(({ icon: Icon, title, description, tags, category }) => (
                <a
                  key={title}
                  href={`/?category=${category}#services`}
                  onClick={(e) => { e.preventDefault(); openCategory(category); }}
                  className="group flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 focus:outline-none cursor-pointer"
                  aria-label={`Browse ${title} advocates`}
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = `1px solid ${CYAN_BORDER}`;
                    e.currentTarget.style.boxShadow = CYAN_GLOW;
                    e.currentTarget.style.background = CYAN_DIM;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  {/* Icon */}
                  <div
                    className="mb-5 inline-flex w-fit rounded-xl p-3 transition-all duration-300"
                    style={{ border: `1px solid ${CYAN_BORDER}`, background: CYAN_DIM }}
                  >
                    <Icon size={24} style={{ color: CYAN }} aria-hidden="true" />
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                  <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ background: 'rgba(0,229,255,0.1)', color: CYAN, border: `1px solid ${CYAN_BORDER}` }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    className="flex items-center gap-1.5 text-xs font-bold transition-all duration-200 group-hover:gap-2.5"
                    style={{ color: CYAN }}
                  >
                    Find Specialists <ArrowRight size={13} aria-hidden="true" />
                  </div>
                </a>
              ))}
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════
            F. FAQ / AEO ACCORDION
        ════════════════════════════════════════ */}
        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="py-20 sm:py-24"
          style={{ background: '#050505', borderTop: `1px solid rgba(255,255,255,0.06)` }}
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: CYAN }}>
                Answer Engine Optimized
              </span>
              <h2
                id="faq-heading"
                className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
              >
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Direct, authoritative answers to the most common questions about online legal
                consultation through Legal Connect.
              </p>
            </div>

            <div className="space-y-4" role="list" aria-label="Frequently Asked Questions">
              {FAQ_ITEMS.map((item, idx) => (
                <article key={idx} role="listitem" itemScope itemType="https://schema.org/Question">
                  <FaqItem
                    question={item.question}
                    answer={item.answer}
                    isOpen={openFaqIndex === idx}
                    onToggle={() => toggleFaq(idx)}
                  />
                </article>
              ))}
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════
            FINAL CTA STRIP
        ════════════════════════════════════════ */}
        <section
          aria-label="Call to action — Start legal consultation"
          className="py-16 sm:py-20 relative overflow-hidden"
          style={{ background: '#000', borderTop: `1px solid ${CYAN_BORDER}` }}
        >
          {/* Glow orb */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className="rounded-full"
              style={{
                width: 500,
                height: 300,
                background: `radial-gradient(ellipse, rgba(0,229,255,0.12) 0%, transparent 70%)`,
              }}
            />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <span
              className="mb-4 inline-block text-xs font-bold uppercase tracking-widest"
              style={{ color: CYAN }}
            >
              Ready to Get Legal Help?
            </span>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Your Verified Advocate is{' '}
              <span style={{ color: CYAN }}>One Click Away.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Join over 10,000 clients who resolved their legal matters with verified, expert
              advocates — fully online, fully secure, fully transparent.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <CyanButton href="#find-advocates" className="text-base px-8 py-4">
                <PhoneCall size={18} aria-hidden="true" />
                Find My Advocate
              </CyanButton>
              <a
                href="/register-lawyer"
                className="text-sm font-semibold underline underline-offset-4 transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => (e.target.style.color = CYAN)}
                onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.5)')}
              >
                Are you an Advocate? Join Free →
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ════════════════════════════════════════
          G. FOOTER
      ════════════════════════════════════════ */}
      <footer
        aria-label="Site footer"
        itemScope
        itemType="https://schema.org/WPFooter"
        style={{ background: '#000', borderTop: `1px solid ${CYAN_BORDER}` }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand column */}
            <div>
              <a
                href="/"
                className="mb-4 flex items-center gap-2 text-lg font-bold text-white"
                aria-label="Legal Connect — Home"
              >
                <Scale size={22} style={{ color: CYAN }} aria-hidden="true" />
                Legal<span style={{ color: CYAN }}>Connect</span>
              </a>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                India's most trusted platform for verified online legal consultation. Connecting
                everyday citizens with licensed advocates since 2024.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <ShieldCheck size={14} style={{ color: CYAN }} aria-hidden="true" />
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Bar Council Compliant
                </span>
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_COLS.map(({ heading, links }) => (
              <nav key={heading} aria-label={`${heading} links`}>
                <h3
                  className="mb-4 text-xs font-bold uppercase tracking-widest"
                  style={{ color: CYAN }}
                >
                  {heading}
                </h3>
                <ul className="space-y-2.5" role="list">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm transition-colors focus:outline-none focus:underline"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                        onMouseEnter={e => (e.target.style.color = CYAN)}
                        onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.4)')}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/*
            SCHEMA COMPLIANCE MARKER
            ─────────────────────────────────────────────────────────────
            Inject the following JSON-LD in <head> via index.html or Helmet:

            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "LegalService",
              "name": "Legal Connect",
              "description": "India's #1 platform for verified online lawyer consultations.",
              "url": "https://legalconnect.in",
              "areaServed": "IN",
              "availableLanguage": ["English", "Hindi"],
              "hasCredential": "Bar Council of India Verified",
              "provider": { "@type": "Organization", "name": "Legal Connect Pvt. Ltd." }
            }
            </script>
            ─────────────────────────────────────────────────────────────
          */}

          <div
            className="mt-10 pt-8 flex flex-col items-center justify-between gap-3 sm:flex-row"
            style={{ borderTop: `1px solid rgba(255,255,255,0.07)` }}
          >
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              © {new Date().getFullYear()} Legal Connect Pvt. Ltd. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Platform compliant with Bar Council of India Digital Advocacy guidelines.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LegalConnectHomePage;
