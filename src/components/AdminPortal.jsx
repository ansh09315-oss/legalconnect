import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Users, Briefcase, FileText, Activity, CheckCircle,
  XCircle, RefreshCw, Shield, Clock, ChevronRight,
  LogOut, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ─── Avatar helper ─── */
const Avatar = ({ lawyer, size = 44 }) => {
  const initials = lawyer?.name
    ? lawyer.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : '?';
  return lawyer?.photo_url ? (
    <img src={lawyer.photo_url} alt={lawyer.name}
      style={{ width: size, height: size, borderRadius: 12, objectFit: 'cover', display: 'block', flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: 12, flexShrink: 0,
      background: 'linear-gradient(135deg,#00e5ff,#818cf8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.33, color: 'white' }}>
      {initials}
    </div>
  );
};

/* ─── Stat card ─── */
const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    whileHover={{ y: -4, boxShadow: `0 12px 40px ${color}18` }}
    style={{ background: 'rgba(18,20,30,0.6)', backdropFilter: 'blur(16px)',
      border: `1px solid ${color}20`, borderRadius: 20, padding: '24px',
      transition: 'all 0.3s', cursor: 'default' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <div style={{ width: 46, height: 46, borderRadius: 12,
        background: `${color}15`, border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={color} />
      </div>
      <ChevronRight size={16} color="#334155" />
    </div>
    <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
      {value}
    </div>
    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
      {label}
    </div>
  </motion.div>
);

/* ─── Status pill ─── */
const Pill = ({ label, color }) => (
  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
    background: `${color}15`, color, border: `1px solid ${color}35`, letterSpacing: '0.04em' }}>
    {label}
  </span>
);

/* ══════════════════════════════════════ */
const AdminPortal = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [cases,   setCases]   = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'lawyers' | 'clients' | 'cases'
  const [expandedLawyerId, setExpandedLawyerId] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [
        { data: p },
        { data: c },
        { data: l },
        { data: cl }
      ] = await Promise.all([
        supabase.from('lawyers').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('cases').select('*').order('created_at', { ascending: false }),
        supabase.from('lawyers').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
      ]);

      if (p) setPending(p);
      if (c) setCases(c);
      if (l) setLawyers(l);
      if (cl) setClients(cl);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase.from('lawyers').update({ status }).eq('id', id);
      if (error) throw error;
      
      // Move to correct state lists
      if (status === 'approved') {
        const approvedLawyer = pending.find(l => l.id === id);
        if (approvedLawyer) {
          setLawyers(prev => [ { ...approvedLawyer, status: 'approved' }, ...prev ]);
        }
      }
      setPending(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const removeLawyer = async (id) => {
    if (window.confirm("Are you sure you want to remove this advocate permanently? This will also delete all their assigned cases to prevent foreign key errors. This action cannot be undone.")) {
      try {
        // 1. Delete dependent cases first
        const { error: casesErr } = await supabase.from('cases').delete().eq('lawyer_id', id);
        if (casesErr) throw casesErr;

        // 2. Delete the lawyer
        const { error: lawyerErr } = await supabase.from('lawyers').delete().eq('id', id);
        if (lawyerErr) throw lawyerErr;

        setLawyers(prev => prev.filter(l => l.id !== id));
        if (expandedLawyerId === id) setExpandedLawyerId(null);
      } catch (err) {
        alert("Failed to remove advocate: " + err.message);
      }
    }
  };

  const getClientCasesCount = (phone) => {
    return cases.filter(c => c.client_phone === phone).length;
  };

  const getLawyerClients = (lawyerId) => {
    const lawyerCases = cases.filter(c => c.lawyer_id === lawyerId);
    const lawyerClients = [];
    lawyerCases.forEach(caseRecord => {
      // Find matching client record in database
      const client = clients.find(cl => cl.phone === caseRecord.client_phone);
      // Avoid duplicate client listings for the same advocate (e.g. if they have multiple cases)
      const exists = lawyerClients.some(lc => lc.phone === caseRecord.client_phone);
      if (!exists) {
        lawyerClients.push({
          name: client?.name || caseRecord.client_name || "Unknown Client",
          email: client?.email || "N/A",
          phone: caseRecord.client_phone,
          caseStatus: caseRecord.status || "active",
        });
      }
    });
    return lawyerClients;
  };

  const toggleExpandLawyer = (id) => {
    setExpandedLawyerId(prev => prev === id ? null : id);
  };

  const card = {
    background: 'rgba(18,20,30,0.6)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 24,
    overflow: 'hidden',
  };

  const caseStatusColor = { pending: '#f59e0b', active: '#10b981', rejected: '#ef4444', closed: '#64748b' };

  return (
    <div style={{ minHeight: '100vh', background: '#050A14', color: 'white', fontFamily: 'Inter,sans-serif' }}>
      {/* ambient */}
      <div style={{ position:'fixed', top:'-10%', right:'-5%', width:'40%', height:'40%',
        background:'rgba(0,229,255,0.03)', filter:'blur(100px)', borderRadius:'50%', pointerEvents:'none', zIndex:0 }} />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 40px', position: 'relative', zIndex: 1 }}>

        {/* ── HEADER ── */}
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ padding: '5px 12px', background: 'rgba(0,229,255,0.1)',
                border: '1px solid rgba(0,229,255,0.35)', borderRadius: 20,
                fontSize: '0.72rem', fontWeight: 700, color: '#00e5ff',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={12} /> Superuser Access
              </div>
            </div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.4rem', fontWeight: 800,
              background: 'linear-gradient(90deg,#fff 60%,#94a3b8)', WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent' }}>
              Admin Portal
            </h1>
            <p style={{ color: '#64748b', marginTop: 6 }}>
              Oversight dashboard for lawyers, clients, and platform activities.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
              onClick={() => fetchAll(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '10px 18px', color: '#94a3b8', cursor: 'pointer', fontSize: '0.88rem' }}>
              <motion.span animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.6, repeat: refreshing ? Infinity : 0 }}>
                <RefreshCw size={15} />
              </motion.span>
              Refresh Data
            </motion.button>

            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
              onClick={() => {
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('isAdmin');
                navigate('/');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 12, padding: '10px 18px', color: '#f87171', cursor: 'pointer', fontSize: '0.88rem' }}>
              <LogOut size={15} /> Logout
            </motion.button>
          </div>
        </header>

        {/* ── STAT CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 36 }} className="admin-stats">
          <StatCard icon={Briefcase}  label="Active Cases"       value={cases.filter(c=>c.status==='active').length}   color="#00e5ff" delay={0}    />
          <StatCard icon={Users}      label="Pending Approvals"  value={pending.length}                                color="#818cf8" delay={0.05} />
          <StatCard icon={FileText}   label="Active Advocates"   value={lawyers.length}                                color="#10b981" delay={0.1}  />
          <StatCard icon={Users}      label="Total Clients"      value={clients.length}                                color="#f59e0b" delay={0.15} />
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: 4, width: 'fit-content' }}>
          {[
            ['approvals', 'Pending Approvals', pending.length],
            ['lawyers', 'Active Advocates', lawyers.length],
            ['clients', 'Clients Overview', clients.length],
            ['cases', 'Case Activity', cases.length]
          ].map(([id, label, count]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: activeTab === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === id ? 'white' : '#64748b',
                fontWeight: activeTab === id ? 700 : 500, fontSize: '0.88rem',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s' }}>
              {label}
              {count > 0 && (
                <span style={{ background: activeTab === id ? '#00e5ff' : '#334155',
                  color: activeTab === id ? '#050A14' : '#94a3b8',
                  borderRadius: 20, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 800 }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          
          {/* PENDING APPROVALS */}
          {activeTab === 'approvals' && (
            <motion.div key="approvals" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}
              style={{ ...card }}>
              <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.2rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Users size={20} color="#818cf8" /> Pending Advocate Registrations
                </h2>
                <Pill label={`${pending.length} pending`} color="#818cf8" />
              </div>

              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
                  <div style={{ width:36, height:36, border:'3px solid rgba(129,140,248,0.3)',
                    borderTopColor:'#818cf8', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
                </div>
              ) : pending.length === 0 ? (
                <div style={{ padding:'60px', textAlign:'center', color:'#475569' }}>
                  <CheckCircle size={40} style={{ opacity:.3, margin:'0 auto 12px' }} />
                  <div>All registrations have been reviewed.</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column' }}>
                  {pending.map((lawyer, idx) => (
                    <motion.div key={lawyer.id}
                      initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: idx*0.05 }}
                      style={{ display:'flex', alignItems:'flex-start', gap:20, padding:'24px 28px',
                      borderBottom: idx < pending.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition:'background .2s' }}
                      onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                      onMouseOut={e=>e.currentTarget.style.background='transparent'}>

                      <Avatar lawyer={lawyer} size={52} />

                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
                          <span style={{ fontWeight:700, fontSize:'1.05rem' }}>{lawyer.name}</span>
                          <Pill label={lawyer.spec} color="#00e5ff" />
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',
                          gap:'6px 24px', fontSize:'0.8rem', color:'#94a3b8' }}>
                          {[
                            ['Email',          lawyer.email],
                            ['Phone',          lawyer.phone],
                            ['Bar No.',        lawyer.bar_no],
                            ['AOR No.',        lawyer.aor_no || 'N/A'],
                            ['Court',          lawyer.court],
                            ['Practice Areas', lawyer.areas?.join(', ') || 'N/A'],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <span style={{ color:'#475569', marginRight:5 }}>{k}:</span>
                              <span style={{ color:'#cbd5e1' }}>{v}</span>
                            </div>
                          ))}
                          {lawyer.address && (
                            <div style={{ gridColumn:'1/-1' }}>
                              <span style={{ color:'#475569', marginRight:5 }}>Address:</span>
                              <span style={{ color:'#cbd5e1' }}>{lawyer.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                          onClick={() => updateStatus(lawyer.id, 'approved')}
                          style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px',
                            background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)',
                            borderRadius:10, color:'#10b981', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>
                          <CheckCircle size={15} /> Approve
                        </motion.button>
                        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                          onClick={() => updateStatus(lawyer.id, 'rejected')}
                          style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px',
                            background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
                            borderRadius:10, color:'#ef4444', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>
                          <XCircle size={15} /> Reject
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ACTIVE ADVOCATES */}
          {activeTab === 'lawyers' && (
            <motion.div key="lawyers" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}
              style={{ ...card }}>
              <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.2rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={20} color="#10b981" /> Active Platform Advocates
                </h2>
                <Pill label={`${lawyers.length} active`} color="#10b981" />
              </div>

              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
                  <div style={{ width:36, height:36, border:'3px solid rgba(16,185,129,0.3)',
                    borderTopColor:'#10b981', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
                </div>
              ) : lawyers.length === 0 ? (
                <div style={{ padding:'60px', textAlign:'center', color:'#475569' }}>
                  <Users size={40} style={{ opacity:.3, margin:'0 auto 12px' }} />
                  <div>No approved advocates found on the platform.</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column' }}>
                  {lawyers.map((lawyer, idx) => {
                    const lawyerClients = getLawyerClients(lawyer.id);
                    const isExpanded = expandedLawyerId === lawyer.id;

                    return (
                      <motion.div key={lawyer.id}
                        initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: idx*0.05 }}
                        style={{ display:'flex', flexDirection:'column', padding:'24px 28px',
                        borderBottom: idx < lawyers.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        transition:'background .2s' }}
                        onMouseOver={e=>{if(!isExpanded) e.currentTarget.style.background='rgba(255,255,255,0.01)'}}
                        onMouseOut={e=>{if(!isExpanded) e.currentTarget.style.background='transparent'}}>

                        <div style={{ display:'flex', alignItems:'flex-start', gap:20 }}>
                          <Avatar lawyer={lawyer} size={52} />

                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
                              <span style={{ fontWeight:700, fontSize:'1.05rem' }}>{lawyer.name}</span>
                              <Pill label={lawyer.spec} color="#10b981" />
                              
                              {/* Clients Dropdown Toggle */}
                              <button 
                                onClick={() => toggleExpandLawyer(lawyer.id)}
                                style={{
                                  background: isExpanded ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                                  border: isExpanded ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: '20px',
                                  padding: '3px 12px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: isExpanded ? '#00e5ff' : '#94a3b8',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  fontFamily: 'Inter,sans-serif',
                                  transition: 'all 0.2s'
                                }}
                              >
                                {lawyerClients.length} {lawyerClients.length === 1 ? 'Client' : 'Clients'} {isExpanded ? '▲' : '▼'}
                              </button>
                            </div>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',
                              gap:'6px 24px', fontSize:'0.8rem', color:'#94a3b8' }}>
                              {[
                                ['Email',          lawyer.email],
                                ['Phone',          lawyer.phone],
                                ['Bar No.',        lawyer.bar_no],
                                ['AOR No.',        lawyer.aor_no || 'N/A'],
                                ['Court',          lawyer.court],
                                ['Practice Areas', lawyer.areas?.join(', ') || 'N/A'],
                              ].map(([k, v]) => (
                                <div key={k}>
                                  <span style={{ color:'#475569', marginRight:5 }}>{k}:</span>
                                  <span style={{ color:'#cbd5e1' }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div style={{ flexShrink:0 }}>
                            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                              onClick={() => removeLawyer(lawyer.id)}
                              style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px',
                                background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
                                borderRadius:10, color:'#f87171', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>
                              <Trash2 size={15} /> Remove Advocate
                            </motion.button>
                          </div>
                        </div>

                        {/* Collapsible Clients List */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                              marginTop: 20,
                              background: 'rgba(5,10,20,0.4)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: 16,
                              padding: 20
                            }}
                          >
                            <h5 style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0', fontWeight: 700 }}>
                              Assigned Clients & Case Statuses
                            </h5>

                            {lawyerClients.length === 0 ? (
                              <div style={{ fontSize: '0.85rem', color: '#475569', padding: '4px 0' }}>
                                No clients currently assigned to this advocate.
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {lawyerClients.map((c, cIdx) => (
                                  <div key={cIdx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.03)',
                                    borderRadius: 10,
                                    fontSize: '0.85rem'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                      <span style={{ color: 'white', fontWeight: 700 }}>{c.name}</span>
                                      <span style={{ color: '#334155' }}>|</span>
                                      <span style={{ color: '#cbd5e1' }}>{c.email}</span>
                                      <span style={{ color: '#334155' }}>|</span>
                                      <span style={{ color: '#cbd5e1' }}>{c.phone}</span>
                                    </div>
                                    <span style={{
                                      padding: '3px 10px',
                                      borderRadius: 14,
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.03em',
                                      background: caseStatusColor[c.caseStatus] + '18',
                                      color: caseStatusColor[c.caseStatus],
                                      border: '1px solid ' + caseStatusColor[c.caseStatus] + '35'
                                    }}>
                                      {c.caseStatus}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* CLIENTS OVERVIEW */}
          {activeTab === 'clients' && (
            <motion.div key="clients" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}
              style={{ ...card }}>
              <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.2rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Users size={20} color="#f59e0b" /> Registered Clients & Details
                </h2>
                <Pill label={`${clients.length} clients`} color="#f59e0b" />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 120px 140px',
                gap:16, padding:'14px 28px', fontSize:'0.7rem', fontWeight:700,
                color:'#475569', textTransform:'uppercase', letterSpacing:'0.07em',
                borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div>Client Name</div><div>Email</div><div>Phone</div><div>Active Cases</div><div>Joined Date</div>
              </div>

              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
                  <div style={{ width:36, height:36, border:'3px solid rgba(245,158,11,0.3)',
                    borderTopColor:'#f59e0b', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
                </div>
              ) : clients.length === 0 ? (
                <div style={{ padding:'60px', textAlign:'center', color:'#475569' }}>
                  <Users size={40} style={{ opacity:.3, margin:'0 auto 12px' }} />
                  <div>No registered clients found on the platform.</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column' }}>
                  {clients.map((client, idx) => (
                    <motion.div key={client.id}
                      initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: idx*0.05 }}
                      style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 120px 140px',
                        gap:16, padding:'18px 28px', fontSize:'0.88rem',
                        borderBottom: idx < clients.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                        transition:'background .15s' }}
                      onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                      onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                      <div style={{ color:'white', fontWeight:600 }}>{client.name}</div>
                      <div style={{ color:'#94a3b8' }}>{client.email || 'N/A'}</div>
                      <div style={{ color:'#94a3b8' }}>{client.phone}</div>
                      <div>
                        <span style={{
                          padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700,
                          background: getClientCasesCount(client.phone) > 0 ? 'rgba(0,229,255,0.12)' : 'rgba(255,255,255,0.04)',
                          color: getClientCasesCount(client.phone) > 0 ? '#00e5ff' : '#cbd5e1'
                        }}>
                          {getClientCasesCount(client.phone)} cases
                        </span>
                      </div>
                      <div style={{ color:'#475569', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:5 }}>
                        <Clock size={12} /> {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* PLATFORM CASES */}
          {activeTab === 'cases' && (
            <motion.div key="cases" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}
              style={{ ...card }}>
              <div style={{ padding:'24px 28px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.2rem', fontWeight:700,
                  display:'flex', alignItems:'center', gap:10 }}>
                  <Briefcase size={20} color="#00e5ff" /> Recent Platform Activity
                </h2>
              </div>

              {/* Table header */}
              <div style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr 120px 120px',
                gap:16, padding:'14px 28px', fontSize:'0.7rem', fontWeight:700,
                color:'#475569', textTransform:'uppercase', letterSpacing:'0.07em',
                borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div>Case ID</div><div>Client Phone</div><div>Lawyer ID</div><div>Status</div><div>Date</div>
              </div>

              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}>
                  <div style={{ width:36, height:36, border:'3px solid rgba(0,229,255,0.2)',
                    borderTopColor:'#00e5ff', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
                </div>
              ) : cases.length === 0 ? (
                /* fallback demo rows */
                [1,2,3].map(i => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr 120px 120px',
                    gap:16, padding:'16px 28px', fontSize:'0.88rem',
                    borderBottom:'1px solid rgba(255,255,255,0.03)',
                    transition:'background .15s' }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ fontFamily:'monospace', color:'#00e5ff', fontSize:'0.82rem' }}>#CAS-{1000+i}</div>
                    <div style={{ color:'white', fontWeight:500 }}>+91 987654321{i}</div>
                    <div style={{ color:'#94a3b8' }}>Adarsh Trivedi</div>
                    <div><Pill label="Active" color="#10b981" /></div>
                    <div style={{ color:'#475569', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:5 }}>
                      <Clock size={12} /> May 04, 2026
                    </div>
                  </div>
                ))
              ) : (
                cases.map((c, i) => (
                  <div key={c.id} style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr 120px 120px',
                    gap:16, padding:'16px 28px', fontSize:'0.88rem',
                    borderBottom: i < cases.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    transition:'background .15s' }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ fontFamily:'monospace', color:'#00e5ff', fontSize:'0.82rem' }}>
                      #{String(c.id).slice(0,8)}
                    </div>
                    <div style={{ color:'white', fontWeight:500 }}>{c.client_phone}</div>
                    <div style={{ color:'#94a3b8', fontSize:'0.8rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {c.lawyer_id}
                    </div>
                    <div>
                      <Pill label={c.status} color={caseStatusColor[c.status] || '#64748b'} />
                    </div>
                    <div style={{ color:'#475569', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:5 }}>
                      <Clock size={12} /> {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:900px){.admin-stats{grid-template-columns:1fr 1fr!important}}`}</style>
    </div>
  );
};

export default AdminPortal;
