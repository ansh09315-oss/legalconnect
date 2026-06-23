import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Scale, BookOpen, Star, TrendingUp, ExternalLink, ChevronRight, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── Shared Avatar ─── */
const LawyerAvatar = ({ lawyer, size = 64, radius = '50%', fontSize = '1.6rem' }) => {
  const initials = lawyer?.name
    ? lawyer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  return lawyer?.photo_url ? (
    <img
      src={lawyer.photo_url}
      alt={lawyer.name}
      style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', display: 'block' }}
    />
  ) : (
    <div style={{ width: size, height: size, borderRadius: radius, background: 'linear-gradient(135deg, #00e5ff 0%, #818cf8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize, color: 'white', flexShrink: 0 }}>
      {initials}
    </div>
  );
};

export { LawyerAvatar };

const StatBadge = ({ label, value, color }) => (
  <div style={{
    background: 'rgba(0,0,0,0.25)',
    borderRadius: '10px',
    padding: '12px',
    textAlign: 'center',
    border: `1px solid ${color}20`,
  }}>
    <div style={{ fontSize: '1.4rem', fontWeight: '800', color, fontFamily: 'Outfit, sans-serif' }}>{value}</div>
    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px', letterSpacing: '0.03em' }}>{label}</div>
  </div>
);

const ContactRow = ({ icon, label, value, truncate = false }) => (
  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
    <div style={{
      width: '34px', height: '34px', borderRadius: '8px',
      background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
      <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', ...(truncate ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : { lineHeight: '1.4' }) }}>
        {value || 'N/A'}
      </div>
    </div>
  </div>
);

const Sidebar = () => {
  const [lawyer, setLawyer] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem('lawyerAccount');
    if (!cached) return;
    const parsed = JSON.parse(cached);
    setLawyer(parsed); // show instantly from cache

    // Re-fetch from Supabase to get latest photo_url and other fields
    import('../lib/supabaseClient').then(({ supabase }) => {
      supabase
        .from('lawyers')
        .select('*')
        .eq('id', parsed.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setLawyer(data);
            localStorage.setItem('lawyerAccount', JSON.stringify(data));
          }
        });
    });
  }, []);


  const practiceAreaIcons = [Scale, BookOpen, Star, TrendingUp];

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Practice Areas ── */}
      <motion.div
        className="bento-card"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ padding: '24px' }}
      >
        <h3 className="bento-card-header" style={{ marginBottom: '6px' }}>Practice Areas</h3>
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '18px' }}>Areas of legal expertise</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {lawyer?.areas?.length > 0 ? lawyer.areas.map((area, i) => {
            const Icon = practiceAreaIcons[i % practiceAreaIcons.length];
            return (
              <motion.div
                key={i}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px',
                  background: 'rgba(0,229,255,0.04)',
                  border: '1px solid rgba(0,229,255,0.08)',
                  borderRadius: '10px',
                  cursor: 'default',
                  transition: 'border-color 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.25)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.08)'}
              >
                <Icon size={15} color="#00e5ff" />
                <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', flex: 1 }}>{area}</span>
                <ChevronRight size={14} color="#475569" />
              </motion.div>
            );
          }) : (
            <div style={{ fontSize: '0.85rem', color: '#475569', textAlign: 'center', padding: '20px 0' }}>
              No practice areas defined yet.
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Stats Card ── */}
      <motion.div
        className="bento-card"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ padding: '24px' }}
      >
        <h3 className="bento-card-header" style={{ marginBottom: '18px' }}>Performance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <StatBadge label="Cases Won" value="94%" color="#10b981" />
          <StatBadge label="Clients" value="47" color="#00e5ff" />
          <StatBadge label="Experience" value={lawyer?.exp ? `${lawyer.exp}yr` : '—'} color="#818cf8" />
          <StatBadge label="Rating" value="4.9★" color="#f59e0b" />
        </div>
      </motion.div>

      {/* ── Contact Details ── */}
      <motion.div
        className="bento-card"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ padding: '24px' }}
      >
        <h3 className="bento-card-header" style={{ marginBottom: '6px' }}>Contact Details</h3>
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '20px' }}>Your professional information</div>

        {/* Profile photo at top of contact card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <LawyerAvatar lawyer={lawyer} size={72} radius="16px" fontSize="1.8rem" />
            <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '16px', height: '16px', background: '#10b981', borderRadius: '50%', border: '2.5px solid #050A14' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lawyer?.name || 'Advocate'}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lawyer?.spec || 'Legal Professional'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ContactRow
            icon={<Phone size={16} color="#00e5ff" />}
            label="Phone"
            value={lawyer?.phone}
            truncate
          />
          <ContactRow
            icon={<Mail size={16} color="#818cf8" />}
            label="Email"
            value={lawyer?.email}
            truncate
          />
          <ContactRow
            icon={<MapPin size={16} color="#f59e0b" />}
            label="Office Address"
            value={lawyer?.address || lawyer?.court}
          />
        </div>

        {/* Map mini-card */}
        <div style={{
          marginTop: '20px',
          height: '90px',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #0d1117, #1a1c2a)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <svg width="100%" height="100%" viewBox="0 0 300 90" style={{ opacity: 0.25 }}>
            <path d="M0 30 L60 55 L100 20 L160 60 L220 35 L300 55" stroke="#00a2ff" strokeWidth="1.5" fill="none" />
            <path d="M30 90 L60 55 L90 70 M160 60 L180 90" stroke="#00a2ff" strokeWidth="1" fill="none" />
            <path d="M0 70 L40 50 M220 35 L260 0" stroke="#00a2ff" strokeWidth="0.8" fill="none" strokeDasharray="4,4" />
          </svg>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          }}>
            <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 12px #ef4444' }} />
            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.3)' }} />
          </div>
          <div style={{ position: 'absolute', bottom: '8px', right: '10px', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.7rem' }}>
            <ExternalLink size={11} /> View Map
          </div>
        </div>

        <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(0,229,255,0.2)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', padding: '11px 0',
              background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(129,140,248,0.15))',
              border: '1px solid rgba(0,229,255,0.3)',
              borderRadius: '10px', color: '#00e5ff',
              fontWeight: '600', fontFamily: 'Outfit, sans-serif',
              fontSize: '0.88rem', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Client Consultation
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', padding: '11px 0',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: 'rgba(255,255,255,0.7)',
              fontWeight: '500', fontFamily: 'Outfit, sans-serif',
              fontSize: '0.88rem', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
          >
            Inter-Lawyer Network
          </motion.button>
        </div>
      </motion.div>

    </aside>
  );
};

export default Sidebar;
