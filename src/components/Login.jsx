import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User } from 'lucide-react';
import Header from './Header';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Try Live Database Authentication first (MongoDB via Netlify Serverless)
      const response = await axios.post('/.netlify/functions/api/auth/login', {
        name: username.trim(),
        phone: password.trim()
      });

      if (response.data.status === 'success') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('clientAccount', JSON.stringify({
          name: response.data.user.name,
          phone: response.data.user.phone,
          hiredLawyer: response.data.user.hiredLawyer
        }));
        navigate('/client-dashboard');
        return;
      }
    } catch (apiErr) {
      console.warn("Live DB Check failed, executing fast LocalStorage pass.", apiErr);
    }

    // Simulate backend authentication using stored Client Account (Fallback)
    setTimeout(() => {
      const storedAccountData = localStorage.getItem('clientAccount');
      
      if (storedAccountData) {
        const clientAcc = JSON.parse(storedAccountData);
        // Authenticate client by Name and Phone
        if (username.trim().toLowerCase() === clientAcc.name.trim().toLowerCase() && password === clientAcc.phone) {
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/client-dashboard');
          return;
        }
      }

      // Legacy advocate fallback bypass
      if (username.toLowerCase() === 'trivedi' && password === 'password') {
        navigate('/portfolio');
        return;
      }

      setError('Invalid credentials. Use the Exact Name and Mobile Number from your Case Form.');
      setLoading(false);
    }, 800);
  };

  return (
    <>
      <Header />
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        
        {/* Abstract Background Elements */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'var(--accent-blue-glow)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '400px', height: '400px', background: 'var(--accent-gold-glow)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }}></div>

        <motion.div 
          className="bento-card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '450px', zIndex: 1, padding: '50px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
             <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Client <span className="gold-text">Login Portal</span></h2>
             <p className="text-muted text-sm">Secure access to your active cases and advocate.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            <div style={{ position: 'relative' }}>
               <User size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: 'var(--text-secondary)' }} />
               <input 
                 type="text" 
                 placeholder="Username" 
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '15px 15px 15px 45px', borderRadius: '10px', color: 'white', fontFamily: 'Inter', outline: 'none' }}
                 required
               />
            </div>

            <div style={{ position: 'relative' }}>
               <Lock size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '15px', color: 'var(--text-secondary)' }} />
               <input 
                 type="password" 
                 placeholder="Password (Mobile Number)"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)} 
                 style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '15px 15px 15px 45px', borderRadius: '10px', color: 'white', fontFamily: 'Inter', outline: 'none' }}
                 required
               />
            </div>

            {error && <div style={{ color: '#ff4d4d', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}

            <button 
              type="submit" 
              className="gold-glow-btn" 
              style={{ padding: '15px', marginTop: '10px', opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.85rem' }}>
             <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>&larr; Return to Firm Home</Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
