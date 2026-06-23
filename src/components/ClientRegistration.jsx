import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, CheckCircle2, ChevronLeft, Scale } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const ClientRegistration = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (data.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check duplicate client in Supabase
      const { data: existing, error: checkErr } = await supabase
        .from('clients')
        .select('id, email, phone')
        .or(`email.eq.${data.email.trim().toLowerCase()},phone.eq.${data.phone.trim()}`);

      if (checkErr) {
        throw new Error('Database check failed. Please try again.');
      }

      if (existing && existing.length > 0) {
        setError('An account with this email/phone already exists.');
        setIsSubmitting(false);
        return;
      }

      const newClient = {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        password: data.password.trim(),
      };

      const { error: insertErr } = await supabase
        .from('clients')
        .insert([newClient]);

      if (insertErr) throw insertErr;

      // Authenticate with the new backend to get JWT
      let resAuth = await fetch('/.netlify/functions/api/auth/login-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: data.phone.trim(), password: data.password.trim(), role: 'client' })
      });
      if (resAuth.status === 404) {
        resAuth = await fetch('/.netlify/functions/api/auth/login-supabase'.replace('/api/auth', '/auth'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: data.phone.trim(), password: data.password.trim(), role: 'client' })
        });
      }
      
      const authData = await resAuth.json();
      if (resAuth.ok && authData.status === 'success') {
        login(authData.token, authData.user);
        localStorage.setItem('clientAccount', JSON.stringify(authData.user));
      } else {
        throw new Error('Could not authenticate new account.');
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '13px 44px 13px 44px', color: 'white', fontSize: '0.95rem',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#050A14', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'rgba(18,20,30,0.8)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16,185,129,0.2)', borderRadius: 24, padding: 48,
            maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.35)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={40} color="#34d399" />
          </div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.9rem', fontWeight: 800, color: 'white', marginBottom: 12 }}>
            Account Created!
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>
            Your client account has been created. You can now log in with your email/phone and password.
          </p>
          <motion.button onClick={() => navigate('/login')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#00e5ff,#0094aa)',
              color: '#050A14', border: 'none', borderRadius: 12, fontWeight: 800,
              fontFamily: 'Outfit,sans-serif', fontSize: '1rem', cursor: 'pointer' }}>
            Go to Login →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050A14', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '60px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%',
        background: 'rgba(0,229,255,0.04)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '40%', height: '40%',
        background: 'rgba(129,140,248,0.04)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 480, width: '100%', position: 'relative', zIndex: 10 }}>
        <button onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', background: 'transparent',
            border: 'none', fontSize: '0.9rem', cursor: 'pointer', marginBottom: 24 }}
          onMouseOver={e => e.currentTarget.style.color = 'white'}
          onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
          <ChevronLeft size={18} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(18,20,30,0.75)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '40px 36px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, background: 'rgba(129,140,248,0.1)',
              border: '1px solid rgba(129,140,248,0.25)', borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={26} color="#818cf8" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.7rem', fontWeight: 800, color: 'white' }}>
                Client Registration
              </h1>
              <p style={{ color: '#818cf8', fontSize: '0.85rem', marginTop: 2 }}>Create your legal account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Name */}
            <div style={{ position: 'relative' }}>
              <User size={17} style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#475569' }} />
              <input type="text" name="name" required placeholder="Full Name"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#475569' }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input type="email" name="email" required placeholder="Email Address"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            {/* Phone */}
            <div style={{ position: 'relative' }}>
              <Phone size={17} style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#475569' }} />
              <input type="tel" name="phone" required placeholder="Phone Number"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#475569' }} />
              <input type={showPwd ? 'text' : 'password'} name="password" required placeholder="Password (min. 6 chars)"
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#475569' }} />
              <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" required placeholder="Confirm Password"
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              <button type="button" onClick={() => setShowConfirm(p => !p)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div style={{ color: '#f87171', fontSize: '0.83rem', padding: '9px 14px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                {error}
              </div>
            )}

            <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ width: '100%', padding: 14, marginTop: 4,
                background: isSubmitting ? 'rgba(129,140,248,0.4)' : 'linear-gradient(135deg,#818cf8,#6366f1)',
                color: 'white', border: 'none', borderRadius: 12, fontWeight: 700,
                fontFamily: 'Outfit,sans-serif', fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {isSubmitting ? (
                <><div style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Creating Account…</>
              ) : 'Create Account →'}
            </motion.button>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Log In</Link>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
              Are you a lawyer?{' '}
              <Link to="/register-lawyer" style={{ color: '#00e5ff', textDecoration: 'none', fontWeight: 600 }}>
                Join as Advocate
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ClientRegistration;
