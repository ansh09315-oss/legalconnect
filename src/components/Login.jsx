import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, User, Lock, Mail, Phone, ShieldCheck,
  ArrowRight, Eye, EyeOff, Briefcase, UserPlus, ChevronRight
} from 'lucide-react';
import Header from './Header';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import bcrypt from 'bcryptjs';

const verifyPassword = (inputPassword, storedPassword) => {
  if (!storedPassword) return false;
  if (storedPassword === inputPassword) return true;
  if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
    try {
      return bcrypt.compareSync(inputPassword, storedPassword);
    } catch (e) {
      console.error('Bcrypt comparison failed:', e);
    }
  }
  return false;
};

/* ──────────────────────────────────────────
   Shared small helpers
────────────────────────────────────────── */
const Feedback = ({ type, children }) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      padding: '10px 14px', borderRadius: 10, fontSize: '0.82rem', lineHeight: 1.5,
      background: type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
      border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
      color: type === 'error' ? '#f87171' : '#34d399',
    }}
  >{children}</motion.div>
);

const InputField = ({ icon: Icon, accent = '#00e5ff', ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={16} style={{
        position: 'absolute', top: '50%', left: 14,
        transform: 'translateY(-50%)',
        color: focused ? accent : '#475569', transition: 'color 0.2s', pointerEvents: 'none'
      }} />
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? `${accent}55` : 'rgba(255,255,255,0.08)'}`,
          padding: '12px 14px 12px 44px', borderRadius: 12, color: 'white',
          fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', outline: 'none',
          transition: 'border-color 0.2s', boxSizing: 'border-box',
          ...(props.style || {})
        }}
      />
    </div>
  );
};

const SubmitBtn = ({ loading, label, loadLabel, accent = '#00e5ff', textColor = '#050A14' }) => (
  <motion.button
    type="submit"
    disabled={loading}
    whileHover={{ scale: loading ? 1 : 1.02 }}
    whileTap={{ scale: loading ? 1 : 0.97 }}
    style={{
      padding: '13px 20px', borderRadius: 12, border: 'none', marginTop: 4,
      cursor: loading ? 'not-allowed' : 'pointer',
      background: loading ? `${accent}44` : `linear-gradient(135deg, ${accent}, ${accent}bb)`,
      color: textColor, fontWeight: 700, fontSize: '0.95rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontFamily: 'Inter,sans-serif', transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1,
      width: '100%', boxShadow: loading ? 'none' : `0 8px 24px ${accent}33`
    }}
  >
    {loading ? (
      <><div style={{
        width: 18, height: 18, border: `2px solid ${textColor}`,
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />{loadLabel}</>
    ) : (
      <><ShieldCheck size={17} />{label}<ArrowRight size={16} /></>
    )}
  </motion.button>
);

/* ──────────────────────────────────────────
   Advocate Login Form
────────────────────────────────────────── */
const AdvocateLoginForm = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your email/phone and password.');
      return;
    }
    setLoading(true);
    setError('');

    const idLower = identifier.trim().toLowerCase();

    try {
      // 1. Try backend Netlify function first
      try {
        let res = await fetch('/.netlify/functions/api/auth/login-advocate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() })
        });
        if (res.status === 404) {
          res = await fetch('/.netlify/functions/api/auth/login-supabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier.trim(), password: password.trim(), role: 'lawyer' })
          });
        }
        const ct = res.headers.get('content-type');
        if (res.ok && ct?.includes('application/json')) {
          const data = await res.json();
          if (data?.status === 'success') {
            login(data.token, { ...data.user, role: 'lawyer' });
            localStorage.setItem('lawyerAccount', JSON.stringify({ ...data.user, role: 'lawyer' }));
            navigate('/lawyer');
            return;
          }
          if (data?.error) { setError(data.error); setLoading(false); return; }
        }
      } catch (_) { /* fall through to direct Supabase */ }

      // 2. Direct Supabase fallback (dev mode)
      const { data: rows, error: dbErr } = await supabase
        .from('lawyer_profiles')
        .select('*')
        .or(`email.eq.${idLower},phone.eq.${identifier.trim()}`);

      // Also check legacy 'lawyers' table
      const { data: legacyRows } = await supabase
        .from('lawyers')
        .select('*')
        .or(`email.eq.${idLower},phone.eq.${identifier.trim()}`);

      const allRows = [...(rows || []), ...(legacyRows || [])];

      if (allRows.length > 0) {
        const matched = allRows.find(u => verifyPassword(password.trim(), u.password));
        if (matched) {
          if (matched.status !== 'approved') {
            setError('Your advocate account is pending admin approval. You will be notified once verified.');
            setLoading(false);
            return;
          }
          const userObj = { ...matched, role: 'lawyer' };
          const mockToken = 'mock_' + btoa(JSON.stringify(userObj));
          login(mockToken, userObj);
          localStorage.setItem('lawyerAccount', JSON.stringify(userObj));
          navigate('/lawyer');
          return;
        }
        setError('Incorrect password. Please try again.');
      } else {
        setError('No advocate account found with this email or phone number.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      key="advocate-login"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <InputField
        icon={Mail}
        accent="#f43f5e"
        type="text"
        placeholder="Email or Phone Number"
        value={identifier}
        onChange={e => setIdentifier(e.target.value)}
        required
      />
      <div style={{ position: 'relative' }}>
        <InputField
          icon={Lock}
          accent="#f43f5e"
          type={showPwd ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ paddingRight: 44 }}
        />
        <button type="button" onClick={() => setShowPwd(p => !p)}
          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
          {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && <Feedback type="error">{error}</Feedback>}

      <SubmitBtn loading={loading} label="Login as Advocate"
        loadLabel="Verifying…" accent="#f43f5e" textColor="white" />

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>
        Not registered?{' '}
        <Link to="/register-lawyer"
          style={{ color: '#f43f5e', textDecoration: 'none', fontWeight: 600 }}>
          Apply as Advocate →
        </Link>
      </p>
    </motion.form>
  );
};

/* ──────────────────────────────────────────
   Client Login / Register Form
────────────────────────────────────────── */
const ClientForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const reset = () => { setError(''); setSuccess(''); };

  /* ── Login ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your email/phone and password.');
      return;
    }
    setLoading(true);
    reset();
    const idLower = identifier.trim().toLowerCase();

    try {
      // 1. Try backend
      try {
        let res = await fetch('/.netlify/functions/api/auth/login-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() })
        });
        if (res.status === 404) {
          res = await fetch('/.netlify/functions/api/auth/login-supabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier.trim(), password: password.trim(), role: 'client' })
          });
        }
        const ct = res.headers.get('content-type');
        if (res.ok && ct?.includes('application/json')) {
          const data = await res.json();
          if (data?.status === 'success') {
            login(data.token, { ...data.user, role: 'client' });
            localStorage.setItem('clientAccount', JSON.stringify({ ...data.user, role: 'client' }));
            navigate('/client');
            return;
          }
          if (data?.error) { setError(data.error); setLoading(false); return; }
        }
      } catch (_) { /* fall through */ }

      // 2. Direct Supabase fallback (dev mode) — check both new and legacy tables
      const { data: newRows } = await supabase
        .from('client_profiles')
        .select('*')
        .or(`email.eq.${idLower},phone.eq.${identifier.trim()}`);

      const { data: legacyRows } = await supabase
        .from('clients')
        .select('*')
        .or(`email.eq.${idLower},phone.eq.${identifier.trim()}`);

      const allRows = [...(newRows || []), ...(legacyRows || [])];

      if (allRows.length > 0) {
        const matched = allRows.find(u => verifyPassword(password.trim(), u.password));
        if (matched) {
          const userObj = { ...matched, role: 'client' };
          const mockToken = 'mock_' + btoa(JSON.stringify(userObj));
          login(mockToken, userObj);
          localStorage.setItem('clientAccount', JSON.stringify(userObj));
          navigate('/client');
          return;
        }
        setError('Incorrect password. Please try again.');
      } else {
        setError('No client account found with this email or phone number.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Register ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    reset();
    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setError('Name, phone and password are required.');
      return;
    }
    if (regPassword !== regConfirm) { setError('Passwords do not match.'); return; }
    if (regPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      // Check for duplicate in both tables
      const { data: existingNew } = await supabase
        .from('client_profiles')
        .select('id')
        .or(`email.eq.${regEmail.trim().toLowerCase()},phone.eq.${regPhone.trim()}`);

      const { data: existingLegacy } = await supabase
        .from('clients')
        .select('id')
        .or(`email.eq.${regEmail.trim().toLowerCase()},phone.eq.${regPhone.trim()}`);

      if ((existingNew?.length || 0) + (existingLegacy?.length || 0) > 0) {
        setError('An account with this phone or email already exists. Please sign in.');
        setLoading(false);
        return;
      }

      const newClient = {
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword.trim(),
      };

      // Insert into new client_profiles table
      const { error: insertErr } = await supabase
        .from('client_profiles')
        .insert([newClient]);

      // Also insert into legacy clients table for backwards compatibility
      await supabase.from('clients').insert([newClient]).then(() => {});

      if (insertErr) throw insertErr;

      // Auto-login after registration
      const userObj = { ...newClient, role: 'client' };
      const mockToken = 'mock_' + btoa(JSON.stringify(userObj));
      login(mockToken, userObj);
      localStorage.setItem('clientAccount', JSON.stringify(userObj));
      setSuccess('Account created! Redirecting to your dashboard…');
      setTimeout(() => navigate('/client'), 1200);
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const accent = '#00e5ff';

  return (
    <motion.div
      key="client-form"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
    >
      {/* Tab switcher */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 10,
        padding: 4, marginBottom: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
        {[['login', 'Sign In'], ['register', 'Create Account']].map(([id, label]) => (
          <button key={id} type="button" onClick={() => { setTab(id); reset(); }}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: tab === id ? 'rgba(0,229,255,0.1)' : 'transparent',
              color: tab === id ? accent : '#64748b',
              fontWeight: tab === id ? 700 : 500, fontSize: '0.85rem',
              transition: 'all 0.2s', fontFamily: 'Inter,sans-serif'
            }}>{label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'login' && (
          <motion.form key="client-login"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }} onSubmit={handleLogin}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField icon={User} accent={accent} type="text"
              placeholder="Email or Phone Number" value={identifier}
              onChange={e => setIdentifier(e.target.value)} required />
            <div style={{ position: 'relative' }}>
              <InputField icon={Lock} accent={accent}
                type={showPwd ? 'text' : 'password'} placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)}
                required style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <Feedback type="error">{error}</Feedback>}
            <SubmitBtn loading={loading} label="Sign In as Client"
              loadLabel="Signing in…" accent={accent} textColor="#050A14" />
          </motion.form>
        )}

        {tab === 'register' && (
          <motion.form key="client-register"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }} onSubmit={handleRegister}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InputField icon={User} accent={accent} type="text"
              placeholder="Full Name *" value={regName}
              onChange={e => setRegName(e.target.value)} required />
            <InputField icon={Phone} accent={accent} type="tel"
              placeholder="Phone Number *" value={regPhone}
              onChange={e => setRegPhone(e.target.value)} required />
            <InputField icon={Mail} accent={accent} type="email"
              placeholder="Email Address (optional)" value={regEmail}
              onChange={e => setRegEmail(e.target.value)} />
            <div style={{ position: 'relative' }}>
              <InputField icon={Lock} accent={accent}
                type={showPwd ? 'text' : 'password'}
                placeholder="Password (min. 6 chars) *"
                value={regPassword} onChange={e => setRegPassword(e.target.value)}
                required style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <InputField icon={Lock} accent={accent}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password *"
                value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                required style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowConfirm(p => !p)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <Feedback type="error">{error}</Feedback>}
            {success && <Feedback type="success">{success}</Feedback>}
            <SubmitBtn loading={loading} label="Create Client Account"
              loadLabel="Creating account…" accent="#818cf8" textColor="white" />
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#475569' }}>
              Are you a lawyer?{' '}
              <Link to="/register-lawyer" style={{ color: accent, textDecoration: 'none', fontWeight: 600 }}>
                Join as Advocate →
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ──────────────────────────────────────────
   Main Dual-Portal Login Page
────────────────────────────────────────── */
const Login = () => {
  const [activePortal, setActivePortal] = useState(null); // null | 'advocate' | 'client'

  const portals = [
    {
      id: 'advocate',
      icon: Scale,
      title: 'Advocate Portal',
      subtitle: 'Access your case console & client assignments',
      accent: '#f43f5e',
      gradient: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(225,29,72,0.08))',
      border: 'rgba(244,63,94,0.25)',
      glow: 'rgba(244,63,94,0.15)',
      badge: 'For Registered Lawyers',
    },
    {
      id: 'client',
      icon: Briefcase,
      title: 'Client Portal',
      subtitle: 'Manage your cases, hire advocates & track progress',
      accent: '#00e5ff',
      gradient: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(129,140,248,0.08))',
      border: 'rgba(0,229,255,0.2)',
      glow: 'rgba(0,229,255,0.12)',
      badge: 'For Clients & Individuals',
    }
  ];

  return (
    <>
      <Header />
      <div style={{
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', overflow: 'hidden', paddingTop: 100, paddingBottom: 60,
        padding: '100px 20px 60px'
      }}>
        {/* Ambient background blobs */}
        <div style={{
          position: 'fixed', top: '10%', left: '5%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(244,63,94,0.07) 0%, transparent 70%)',
          filter: 'blur(80px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none'
        }} />
        <div style={{
          position: 'fixed', bottom: '10%', right: '5%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)',
          filter: 'blur(80px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none'
        }} />

        <div style={{ width: '100%', maxWidth: 900, zIndex: 1 }}>
          {/* Header text */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(244,63,94,0.15))',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Scale size={30} color="#00e5ff" />
              </div>
            </div>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              fontWeight: 800, color: 'white', marginBottom: 10
            }}>LegalConnect Portal</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Select your portal to continue
            </p>
          </motion.div>

          {/* Portal Cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24, marginBottom: 32
          }}>
            {portals.map((portal, i) => {
              const IconComp = portal.icon;
              const isActive = activePortal === portal.id;
              return (
                <motion.div
                  key={portal.id}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActivePortal(isActive ? null : portal.id)}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: isActive ? portal.gradient : 'rgba(18,20,30,0.7)',
                    border: `1px solid ${isActive ? portal.border : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 20, padding: '28px 28px',
                    cursor: 'pointer', backdropFilter: 'blur(20px)',
                    boxShadow: isActive ? `0 20px 60px ${portal.glow}` : '0 4px 20px rgba(0,0,0,0.3)',
                    transition: 'box-shadow 0.3s, border-color 0.3s, background 0.3s',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  {/* Glow orb */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                      borderRadius: '50%', background: `radial-gradient(circle, ${portal.glow} 0%, transparent 70%)`,
                      pointerEvents: 'none'
                    }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: 15,
                      background: `${portal.accent}18`,
                      border: `1px solid ${portal.accent}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <IconComp size={26} color={portal.accent} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem',
                        fontWeight: 800, color: 'white' }}>{portal.title}</div>
                      <div style={{
                        display: 'inline-block', marginTop: 4, padding: '2px 10px',
                        borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                        background: `${portal.accent}15`, color: portal.accent,
                        border: `1px solid ${portal.accent}25`
                      }}>{portal.badge}</div>
                    </div>
                    <ChevronRight size={20} color={isActive ? portal.accent : '#475569'}
                      style={{ marginLeft: 'auto', transition: 'transform 0.3s, color 0.3s',
                        transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.87rem', lineHeight: 1.5, margin: 0 }}>
                    {portal.subtitle}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Expanded Form panel */}
          <AnimatePresence mode="wait">
            {activePortal && (
              <motion.div
                key={activePortal}
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  background: 'rgba(12,14,24,0.85)',
                  border: `1px solid ${activePortal === 'advocate' ? 'rgba(244,63,94,0.2)' : 'rgba(0,229,255,0.15)'}`,
                  borderRadius: 20, padding: '36px 36px', backdropFilter: 'blur(24px)',
                  maxWidth: 480, margin: '0 auto',
                  boxShadow: `0 30px 80px ${activePortal === 'advocate' ? 'rgba(244,63,94,0.1)' : 'rgba(0,229,255,0.08)'}`
                }}>
                  {/* Form header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 11,
                      background: activePortal === 'advocate' ? 'rgba(244,63,94,0.15)' : 'rgba(0,229,255,0.12)',
                      border: `1px solid ${activePortal === 'advocate' ? 'rgba(244,63,94,0.3)' : 'rgba(0,229,255,0.25)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {activePortal === 'advocate' ? <Scale size={20} color="#f43f5e" /> : <User size={20} color="#00e5ff" />}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>
                        {activePortal === 'advocate' ? 'Advocate Login' : 'Client Access'}
                      </div>
                      <div style={{ color: '#475569', fontSize: '0.78rem' }}>
                        {activePortal === 'advocate' ? 'Secured advocate console entry' : 'Manage your legal matters'}
                      </div>
                    </div>
                  </div>

                  {activePortal === 'advocate' ? <AdvocateLoginForm /> : <ClientForm />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Admin Login link */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ textAlign: 'center', marginTop: 32 }}
          >
            <Link to="/admin-login" style={{ color: '#334155', textDecoration: 'none', fontSize: '0.8rem',
              display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={13} />Admin Console →
            </Link>
            {' · '}
            <Link to="/" style={{ color: '#334155', textDecoration: 'none', fontSize: '0.8rem' }}>
              ← Return to Home
            </Link>
          </motion.div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default Login;
