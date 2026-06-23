import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ShieldCheck, Scale, UserPlus, ArrowRight } from 'lucide-react';
import Header from './Header';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Shared fields
  const [identifier, setIdentifier] = useState('');   // name or email
  const [password, setPassword] = useState('');

  // Register-only fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const reset = () => {
    setError('');
    setSuccess('');
  };

  /* ─── LOGIN ─── */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your name/email and password.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { supabase } = await import('../lib/supabaseClient');

      let isBackendAvailable = false;
      
      // 1. Try Lawyer Login via Backend
      try {
        let res = await fetch('/.netlify/functions/api/auth/login-supabase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: identifier.trim(), password: password.trim(), role: 'lawyer' })
        });

        if (res.status === 404) { // Fallback if serverless prefix stripped
          res = await fetch('/.netlify/functions/api/auth/login-supabase'.replace('/api/auth', '/auth'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier.trim(), password: password.trim(), role: 'lawyer' })
          });
        }

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          let data = await res.json();
          isBackendAvailable = true;
          if (data && data.status === 'success') {
            login(data.token, data.user);
            localStorage.setItem('lawyerAccount', JSON.stringify(data.user)); // Keep for legacy compatibility 
            navigate('/lawyer');
            return;
          }
        }
      } catch (backendErr) {
        console.warn("Backend lawyer login error (falling back to direct Supabase):", backendErr);
      }

      // 2. If not lawyer, try Client Login via Backend
      try {
        let resClient = await fetch('/.netlify/functions/api/auth/login-supabase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: identifier.trim(), password: password.trim(), role: 'client' })
        });

        if (resClient.status === 404) {
          resClient = await fetch('/.netlify/functions/api/auth/login-supabase'.replace('/api/auth', '/auth'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier.trim(), password: password.trim(), role: 'client' })
          });
        }

        const contentType = resClient.headers.get('content-type');
        if (resClient.ok && contentType && contentType.includes('application/json')) {
          let clientData = await resClient.json();
          isBackendAvailable = true;
          if (clientData && clientData.status === 'success') {
            login(clientData.token, clientData.user);
            localStorage.setItem('clientAccount', JSON.stringify(clientData.user)); // Keep for legacy
            navigate('/client');
            return;
          }
        }
      } catch (backendErr) {
        console.warn("Backend client login error (falling back to direct Supabase):", backendErr);
      }

      // 3. Fallback to Direct Supabase Queries (for local dev mode)
      const idLower = identifier.trim().toLowerCase();

      // Check lawyers first
      const { data: dbLawyers, error: lawyerErr } = await supabase
        .from('lawyers')
        .select('*')
        .or(`email.eq.${idLower},phone.eq.${identifier.trim()}`);

      if (!lawyerErr && dbLawyers && dbLawyers.length > 0) {
        const matchedLawyer = dbLawyers.find(u => u.password === password.trim() && u.status === 'approved');
        if (matchedLawyer) {
          const userObj = { ...matchedLawyer, role: 'lawyer' };
          const mockToken = 'mock_' + btoa(JSON.stringify(userObj));
          login(mockToken, userObj);
          localStorage.setItem('lawyerAccount', JSON.stringify(userObj));
          navigate('/lawyer');
          return;
        }
      }

      // Check clients next
      const { data: dbClients, error: clientErr } = await supabase
        .from('clients')
        .select('*')
        .or(`email.eq.${idLower},phone.eq.${identifier.trim()}`);

      if (!clientErr && dbClients && dbClients.length > 0) {
        const matchedClient = dbClients.find(u => u.password === password.trim());
        if (matchedClient) {
          const userObj = { ...matchedClient, role: 'client' };
          const mockToken = 'mock_' + btoa(JSON.stringify(userObj));
          login(mockToken, userObj);
          localStorage.setItem('clientAccount', JSON.stringify(userObj));
          navigate('/client');
          return;
        }
      }

      /* 4 — Legacy clientAccount (old local storage format fallback) */
      const legacyStr = localStorage.getItem('clientAccount');
      if (legacyStr) {
        const legacy = JSON.parse(legacyStr);
        if (
          (legacy.email?.toLowerCase() === idLower || legacy.phone === identifier.trim()) &&
          (legacy.password === password.trim() || legacy.phone === password.trim())
        ) {
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/client');
          return;
        }
      }

      setError('No account found with those credentials. Please check and try again.');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── CLIENT REGISTER (quick form in Login page) ─── */
  const handleRegister = async (e) => {
    e.preventDefault();
    reset();
    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setError('Name, phone and password are required.');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      // Check duplicate client in Supabase
      const { data: existing, error: checkErr } = await supabase
        .from('clients')
        .select('id, email, phone')
        .or(`email.eq.${regEmail.trim().toLowerCase()},phone.eq.${regPhone.trim()}`);

      if (checkErr) {
        throw new Error('Database check failed. Please try again.');
      }

      if (existing && existing.length > 0) {
        setError('An account with this phone/email already exists. Please log in.');
        setLoading(false);
        return;
      }

      const newClient = {
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword.trim(),
      };

      const { error: insertErr } = await supabase
        .from('clients')
        .insert([newClient]);

      if (insertErr) throw insertErr;

      // Authenticate with the new backend to get JWT
      let resAuth = await fetch('/.netlify/functions/api/auth/login-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: regPhone.trim(), password: regPassword.trim(), role: 'client' })
      });
      if (resAuth.status === 404) {
        resAuth = await fetch('/.netlify/functions/api/auth/login-supabase'.replace('/api/auth', '/auth'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: regPhone.trim(), password: regPassword.trim(), role: 'client' })
        });
      }
      
      const authData = await resAuth.json();
      if (resAuth.ok && authData.status === 'success') {
        login(authData.token, authData.user);
        localStorage.setItem('clientAccount', JSON.stringify(authData.user));
        setSuccess('Account created! Redirecting to your dashboard…');
        setTimeout(() => navigate('/client'), 1200);
      } else {
        throw new Error('Could not authenticate new account.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Shared styles ─── */
  const fieldRow = { position: 'relative' };
  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    padding: '13px 14px 13px 44px', borderRadius: 12, color: 'white',
    fontFamily: 'Inter, sans-serif', fontSize: '0.92rem', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  };
  const iconPos = { position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' };

  return (
    <>
      <Header />
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', overflow: 'hidden', paddingTop: 100, paddingBottom: 40 }}>

        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: '15%', left: '8%', width: 350, height: 350,
          background: 'radial-gradient(circle,rgba(0,229,255,0.12) 0%,transparent 70%)',
          filter: 'blur(60px)', borderRadius: '50%', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 400, height: 400,
          background: 'radial-gradient(circle,rgba(129,140,248,0.1) 0%,transparent 70%)',
          filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 }} />

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          style={{ width: '100%', maxWidth: 460, zIndex: 1, margin: '0 16px',
            background: 'rgba(18,20,30,0.75)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: '40px 40px', backdropFilter: 'blur(22px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

          {/* Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ width: 58, height: 58, borderRadius: 16,
              background: 'linear-gradient(135deg,rgba(0,229,255,0.15),rgba(129,140,248,0.15))',
              border: '1px solid rgba(0,229,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={28} color="#00e5ff" />
            </div>
          </div>

          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.7rem', fontWeight: 800,
            color: 'white', textAlign: 'center', marginBottom: 6 }}>LegalConnect Portal</h1>
          <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.88rem', marginBottom: 28 }}>
            Secure access for clients, advocates & admin
          </p>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12,
            padding: 4, marginBottom: 28, border: '1px solid rgba(255,255,255,0.06)' }}>
            {[['login', 'Sign In'], ['register', 'Create Account']].map(([id, label]) => (
              <button key={id} type="button" onClick={() => { setTab(id); reset(); }}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: tab === id ? 'rgba(0,229,255,0.12)' : 'transparent',
                  color: tab === id ? '#00e5ff' : '#64748b',
                  fontWeight: tab === id ? 700 : 500, fontSize: '0.88rem',
                  transition: 'all 0.2s', fontFamily: 'Inter,sans-serif' }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ── */}
          <AnimatePresence mode="wait">
            {tab === 'login' && (
              <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }} onSubmit={handleLogin}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                <div style={fieldRow}>
                  <User size={16} style={iconPos} />
                  <input type="text" placeholder="Email or Phone Number" value={identifier}
                    onChange={e => setIdentifier(e.target.value)} required style={inp}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>

                <div style={fieldRow}>
                  <Lock size={16} style={iconPos} />
                  <input type={showPwd ? 'text' : 'password'} placeholder="Password" value={password}
                    onChange={e => setPassword(e.target.value)} required
                    style={{ ...inp, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && <Feedback type="error">{error}</Feedback>}
                {success && <Feedback type="success">{success}</Feedback>}

                <SubmitBtn loading={loading} icon={<ShieldCheck size={17} />} label="Sign In" loadLabel="Signing in…" />
              </motion.form>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && (
              <motion.form key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} onSubmit={handleRegister}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                <div style={fieldRow}>
                  <User size={16} style={iconPos} />
                  <input type="text" placeholder="Full Name *" value={regName}
                    onChange={e => setRegName(e.target.value)} required style={inp}
                    onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>

                <div style={fieldRow}>
                  <svg style={{ ...iconPos, width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input type="email" placeholder="Email Address" value={regEmail}
                    onChange={e => setRegEmail(e.target.value)} style={inp}
                    onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>

                <div style={fieldRow}>
                  <svg style={{ ...iconPos, width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/></svg>
                  <input type="tel" placeholder="Phone Number *" value={regPhone}
                    onChange={e => setRegPhone(e.target.value)} required style={inp}
                    onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>

                <div style={fieldRow}>
                  <Lock size={16} style={iconPos} />
                  <input type={showPwd ? 'text' : 'password'} placeholder="Password (min. 6 chars) *"
                    value={regPassword} onChange={e => setRegPassword(e.target.value)} required
                    style={{ ...inp, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div style={fieldRow}>
                  <Lock size={16} style={iconPos} />
                  <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password *"
                    value={regConfirm} onChange={e => setRegConfirm(e.target.value)} required
                    style={{ ...inp, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && <Feedback type="error">{error}</Feedback>}
                {success && <Feedback type="success">{success}</Feedback>}

                <SubmitBtn loading={loading} icon={<UserPlus size={17} />} label="Create Account"
                  loadLabel="Creating account…" color="linear-gradient(135deg,#818cf8,#6366f1)" />

                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>
                  Are you a lawyer?{' '}
                  <Link to="/register-lawyer" style={{ color: '#00e5ff', textDecoration: 'none', fontWeight: 600 }}>
                    Join as Advocate →
                  </Link>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link to="/" style={{ color: '#334155', textDecoration: 'none', fontSize: '0.83rem' }}>
              ← Return to Home
            </Link>
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

/* ─── Small helpers ─── */
const Feedback = ({ type, children }) => (
  <div style={{
    padding: '10px 14px', borderRadius: 10, fontSize: '0.83rem', lineHeight: 1.5,
    background: type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
    border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
    color: type === 'error' ? '#f87171' : '#34d399',
  }}>{children}</div>
);

const SubmitBtn = ({ loading, icon, label, loadLabel, color }) => (
  <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }}
    style={{ padding: 14, borderRadius: 12, border: 'none', marginTop: 4,
      cursor: loading ? 'not-allowed' : 'pointer',
      background: loading ? 'rgba(0,229,255,0.25)' : (color || 'linear-gradient(135deg,#00e5ff,#0094aa)'),
      color: color ? 'white' : '#050A14', fontWeight: 700, fontSize: '0.95rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontFamily: 'Inter,sans-serif', transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1 }}>
    {loading ? (
      <><div style={{ width: 18, height: 18, border: `2px solid ${color ? 'white' : '#050A14'}`,
        borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />{loadLabel}</>
    ) : (
      <>{icon}{label}<ArrowRight size={16} /></>
    )}
  </motion.button>
);

export default Login;
