import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Scale, CheckCircle2, ChevronLeft, Camera, User, Upload, Eye, EyeOff, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const inputCls = 'w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-legal-cyan/50 focus:outline-none transition-colors placeholder-slate-600';

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const PhotoPicker = ({ preview, onFileChange }) => {
  const inputRef = useRef();
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <motion.div whileHover={{ scale: 1.04 }} onClick={() => inputRef.current.click()}
        style={{ width: 110, height: 110, borderRadius: '50%',
          border: preview ? '3px solid #00e5ff' : '2px dashed rgba(0,229,255,0.4)',
          background: preview ? 'transparent' : 'rgba(0,229,255,0.05)',
          overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', position: 'relative',
          boxShadow: preview ? '0 0 30px rgba(0,229,255,0.25)' : 'none', transition: 'all 0.3s ease' }}>
        {preview ? (
          <>
            <img src={preview} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
              onMouseOver={e => e.currentTarget.style.opacity = 1}
              onMouseOut={e => e.currentTarget.style.opacity = 0}>
              <Camera size={28} color="white" />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(0,229,255,0.6)' }}>
            <User size={36} strokeWidth={1.5} />
          </div>
        )}
      </motion.div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }} onChange={onFileChange} />
      <motion.button type="button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        onClick={() => inputRef.current.click()}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,255,0.1)',
          border: '1px solid rgba(0,229,255,0.3)', borderRadius: 10, padding: '8px 18px',
          color: '#00e5ff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
        <Upload size={15} /> {preview ? 'Change Photo' : 'Upload Profile Photo'}
      </motion.button>
      <p style={{ fontSize: '0.72rem', color: '#475569' }}>JPG, PNG or WebP · Max 5 MB (optional)</p>
    </div>
  );
};

const LawyerRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [showPwd, setShowPwd] = useState(false);  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5 MB.'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

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
      // ── Uniqueness check for email and phone ──
      const { data: existing, error: checkErr } = await supabase
        .from('lawyer_profiles')
        .select('id, email, phone')
        .or(`email.eq.${data.email.trim()},phone.eq.${data.phone.trim()}`);

      if (checkErr) {
        console.error('Check error:', checkErr);
        setError('Failed to check existing accounts. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (existing && existing.length > 0) {
        const emailMatch = existing.some(l => l.email?.toLowerCase() === data.email.trim().toLowerCase());
        const phoneMatch = existing.some(l => l.phone === data.phone.trim());
        if (emailMatch && phoneMatch) {
          setError('An advocate account with this email and phone number already exists.');
        } else if (emailMatch) {
          setError('An advocate account with this email already exists.');
        } else {
          setError('An advocate account with this phone number already exists.');
        }
        setIsSubmitting(false);
        return;
      }

      let photoUrl = null;

      // ── Photo upload (fully isolated — never blocks registration) ──
      if (photoFile) {
        setUploadProgress('Uploading photo…');
        try {
          const ext = photoFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: storageError } = await supabase.storage
            .from('lawyer-photos')
            .upload(fileName, photoFile, { contentType: photoFile.type, upsert: false });

          if (!storageError) {
            const { data: urlData } = supabase.storage.from('lawyer-photos').getPublicUrl(fileName);
            photoUrl = urlData?.publicUrl || null;
          } else {
            console.warn('Photo upload skipped (storage error):', storageError.message);
          }
        } catch (uploadErr) {
          console.warn('Photo upload skipped (network/bucket error):', uploadErr.message);
          photoUrl = null;
        }
      }

      setUploadProgress('Creating your account…');
      const areasArray = data.areas ? data.areas.split(',').map(a => a.trim()) : [];

      // Build payload
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        court: data.court,
        bar_no: data.barNo,
        aor_no: data.aorNo || null,
        spec: data.spec,
        areas: areasArray,
        address: data.address,
        status: 'pending',
      };

      if (data.password) payload.password = data.password;
      if (photoUrl) payload.photo_url = photoUrl;

      let { error: insertError } = await supabase.from('lawyer_profiles').insert([payload]);

      if (!insertError) {
        // Also insert into legacy lawyers table for backward compatibility
        try {
          await supabase.from('lawyers').insert([payload]);
        } catch (e) {
          console.warn('Legacy insert error:', e);
        }
      }

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed: ' + (err.message || 'Please try again.'));
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#050A14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'rgba(18,20,30,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,229,255,0.15)',
            borderRadius: 24, padding: 48, maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={40} color="#34d399" />
          </div>
          {photoPreview && (
            <img src={photoPreview} alt="Your photo" style={{ width: 90, height: 90, borderRadius: '50%',
              objectFit: 'cover', border: '3px solid #00e5ff', margin: '0 auto 20px', display: 'block' }} />
          )}
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: 16 }}>
            Application Submitted!
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>
            Your application is under review by our admin. Once approved, you can log in with your email and password.
          </p>
          <motion.button onClick={() => navigate('/')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#00e5ff,#0094aa)',
              color: '#050A14', border: 'none', borderRadius: 12, fontWeight: 800,
              fontFamily: 'Outfit,sans-serif', fontSize: '1rem', cursor: 'pointer' }}>
            Return to Homepage
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050A14', position: 'relative', overflow: 'hidden',
      padding: '80px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 80% 10%,rgba(0,229,255,0.06) 0%,transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 680, width: '100%', position: 'relative', zIndex: 10 }}>
        <button onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', background: 'transparent',
            border: 'none', fontSize: '0.9rem', cursor: 'pointer', marginBottom: 28, transition: 'color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.color = 'white'}
          onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
          <ChevronLeft size={20} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ background: 'rgba(18,20,30,0.7)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,229,255,0.15)', borderRadius: 24, padding: '40px 48px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
            <div style={{ width: 56, height: 56, background: 'rgba(0,229,255,0.1)',
              border: '1px solid rgba(0,229,255,0.25)', borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale color="#00e5ff" size={28} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2rem', fontWeight: 800, color: 'white' }}>Join as Advocate</h1>
              <p style={{ color: '#00e5ff', fontSize: '0.9rem', marginTop: 2 }}>Expand your practice digitally.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Photo */}
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Profile Photo (Optional)</div>
              <PhotoPicker preview={photoPreview} onFileChange={handleFileChange} />
            </div>

            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <Field label="Full Name *">
                <input type="text" name="name" required className={inputCls} placeholder="Adv. Jane Doe" />
              </Field>
              <Field label="Email Address *">
                <input type="email" name="email" required className={inputCls} placeholder="advocate@example.com" />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <Field label="Phone Number *">
                <input type="tel" name="phone" required className={inputCls} placeholder="+91 9876543210" />
              </Field>
              <Field label="Primary Court / Jurisdiction *">
                <input type="text" name="court" required className={inputCls} placeholder="High Court Lucknow" />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <Field label="Bar Registration No. *">
                <input type="text" name="barNo" required className={inputCls} placeholder="UP 1234/2020" />
              </Field>
              <Field label="AOR No. (Optional)">
                <input type="text" name="aorNo" className={inputCls} placeholder="B/S 1234/2024" />
              </Field>
            </div>

            <Field label="Specialization *">
              <input type="text" name="spec" required className={inputCls} placeholder="Corporate & Arbitration" />
            </Field>

            <Field label="Practice Areas (Comma Separated) *">
              <input type="text" name="areas" required className={inputCls} placeholder="Corporate, Civil, Litigation" />
            </Field>

            <Field label="Office Address *">
              <textarea name="address" required rows="2" className={inputCls} placeholder="Full office address..." style={{ resize: 'none' }} />
            </Field>

            {/* Password Section */}
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Lock size={16} color="#00e5ff" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Set Login Password</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <Field label="Password *">
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} name="password" required className={inputCls}
                      placeholder="Min. 6 characters" style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm Password *">
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" required className={inputCls}
                      placeholder="Repeat password" style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            {error && (
              <div style={{ color: '#f87171', fontSize: '0.82rem', padding: '10px 14px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10 }}>
                {error}
              </div>
            )}

            {uploadProgress && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#00e5ff', fontSize: '0.85rem' }}>
                <div style={{ width: 14, height: 14, border: '2px solid #00e5ff', borderTopColor: 'transparent',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                {uploadProgress}
              </div>
            )}

            <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: 16,
                background: isSubmitting ? 'rgba(0,229,255,0.4)' : 'linear-gradient(135deg,#00e5ff 0%,#0094aa 100%)',
                color: '#050A14', border: 'none', borderRadius: 14,
                fontWeight: 800, fontFamily: 'Outfit,sans-serif', fontSize: '1rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {isSubmitting ? (
                <><div style={{ width: 20, height: 20, border: '2.5px solid #050A14', borderTopColor: 'transparent',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Submitting…</>
              ) : 'Submit Application →'}
            </motion.button>
          </form>
        </motion.div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LawyerRegistration;
