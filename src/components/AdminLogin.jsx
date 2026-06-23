import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, ShieldAlert } from 'lucide-react';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your admin credentials.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let isBackendAvailable = false;
      let data = null;

      try {
        // Try the primary path (serverless-http strips the function name from the URL)
        // Function is named "api" so it's at /.netlify/functions/api
        // serverless-http strips "/api" leaving "/auth/admin-login"
        let res = await fetch('/.netlify/functions/api/auth/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password: password.trim() }),
        });

        // Fallback: try with the /api prefix stripped (alternate serverless-http behaviour)
        if (res.status === 404) {
          res = await fetch('/.netlify/functions/api/auth/admin-login'.replace('/api/auth', '/auth'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username.trim(), password: password.trim() }),
          });
        }

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          data = await res.json();
          isBackendAvailable = true;
        }
      } catch (backendErr) {
        console.warn("Backend admin login error (falling back to local check):", backendErr);
      }

      if (isBackendAvailable && data && data.status === 'success') {
        login(data.token, { id: 'admin', role: 'admin' });
        setSuccess('Authentication successful! Accessing console...');
        setTimeout(() => {
          navigate('/admin');
        }, 1200);
        return;
      }

      // Fallback for local development (no netlify function active)
      const validUsername = 'admin';
      const validPassword = 'Ansh2015';

      if (
        username.trim().toLowerCase() === validUsername.toLowerCase() &&
        password.trim() === validPassword
      ) {
        const mockToken = 'mock_' + btoa(JSON.stringify({ id: 'admin', role: 'admin' }));
        login(mockToken, { id: 'admin', role: 'admin' });
        setSuccess('Authentication successful! Accessing console (local dev mode)...');
        setTimeout(() => {
          navigate('/admin');
        }, 1200);
      } else {
        setError('Invalid admin credentials. Access Denied.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldRow = { position: 'relative' };
  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    padding: '13px 14px 13px 44px', borderRadius: 12, color: 'white',
    fontFamily: 'Inter, sans-serif', fontSize: '0.92rem', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  };
  const iconPos = { position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#f43f5e', pointerEvents: 'none' };

  return (
    <>
      <Header />
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', overflow: 'hidden', paddingTop: 100, paddingBottom: 40 }}>

        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: '15%', left: '8%', width: 350, height: 350,
          background: 'radial-gradient(circle,rgba(244,63,94,0.12) 0%,transparent 70%)',
          filter: 'blur(60px)', borderRadius: '50%', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 400, height: 400,
          background: 'radial-gradient(circle,rgba(225,29,72,0.1) 0%,transparent 70%)',
          filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 }} />

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          style={{ width: '100%', maxWidth: 460, zIndex: 1, margin: '0 16px',
            background: 'rgba(18,20,30,0.85)', border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: 24, padding: '40px 40px', backdropFilter: 'blur(22px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>

          {/* Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ width: 58, height: 58, borderRadius: 16,
              background: 'linear-gradient(135deg,rgba(244,63,94,0.15),rgba(225,29,72,0.15))',
              border: '1px solid rgba(244,63,94,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={28} color="#f43f5e" />
            </div>
          </div>

          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.7rem', fontWeight: 800,
            color: 'white', textAlign: 'center', marginBottom: 6 }}>Admin Console</h1>
          <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '0.88rem', marginBottom: 28 }}>
            Authorized Administrative Personnel Only
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={fieldRow}>
              <User size={16} style={iconPos} />
              <input type="text" placeholder="Admin Username" value={username}
                onChange={e => setUsername(e.target.value)} required style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(244,63,94,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>

            <div style={fieldRow}>
              <Lock size={16} style={iconPos} />
              <input type={showPwd ? 'text' : 'password'} placeholder="Admin Password" value={password}
                onChange={e => setPassword(e.target.value)} required
                style={{ ...inp, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = 'rgba(244,63,94,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <Feedback type="error">{error}</Feedback>}
            {success && <Feedback type="success">{success}</Feedback>}

            <SubmitBtn loading={loading} icon={<ShieldCheck size={17} />} label="Access Admin Panel" loadLabel="Authenticating..." />
          </form>

          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.83rem' }}>
              ← Return to Home
            </Link>
            <Link to="/login" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.83rem' }}>
              User Login Portal →
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

const SubmitBtn = ({ loading, icon, label, loadLabel }) => (
  <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }}
    style={{ padding: 14, borderRadius: 12, border: 'none', marginTop: 4,
      cursor: loading ? 'not-allowed' : 'pointer',
      background: loading ? 'rgba(244,63,94,0.3)' : 'linear-gradient(135deg,#f43f5e,#e11d48)',
      color: 'white', fontWeight: 700, fontSize: '0.95rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontFamily: 'Inter,sans-serif', transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1 }}>
    {loading ? (
      <><div style={{ width: 18, height: 18, border: `2px solid white`,
        borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />{loadLabel}</>
    ) : (
      <>{icon}{label}<ArrowRight size={16} /></>
    )}
  </motion.button>
);

export default AdminLogin;
