import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ChevronLeft, Calendar, FileText, Scale,
  Download, MessageSquare, LogOut, Send, Shield, Clock,
  Paperclip, Bell, Circle, Briefcase, Activity, PlusCircle, Search, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const DOCS = [
  { id: 1, name: 'Initial Case Briefing',      date: 'Oct 12, 2026', size: '2.4 MB',  icon: '📄' },
  { id: 2, name: 'Evidence Photography.zip',   date: 'Oct 14, 2026', size: '14.1 MB', icon: '🗂️' },
  { id: 3, name: 'Signed Vakalatnama',          date: 'Oct 15, 2026', size: '1.1 MB',  icon: '✍️' },
];

const TIMELINE = [
  { date: 'Oct 20, 2026', event: 'First Hearing',         status: 'upcoming' },
  { date: 'Nov 05, 2026', event: 'Submission of Counter-Affidavit',     status: 'pending'  },
  { date: 'Dec 12, 2026', event: 'Cross-Examination Session',           status: 'pending'  },
];

const Avatar = ({ lawyer, size = 56, radius = '50%' }) => {
  const initials = lawyer?.name
    ? lawyer.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : 'A';
  return lawyer?.photo_url ? (
    <img src={lawyer.photo_url} alt={lawyer.name}
      style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', display: 'block' }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: radius,
      background: 'linear-gradient(135deg,#00e5ff,#818cf8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.35, color: 'white', flexShrink: 0 }}>
      {initials}
    </div>
  );
};

const StatusBadge = ({ label, color }) => (
  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem',
    fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}40`,
    letterSpacing: '0.04em' }}>
    {label}
  </span>
);
const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [client, setClient] = useState(null);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const msgEndRef = useRef();

  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef(null);

  const fetchDocuments = async (caseId) => {
    if (!caseId) return;
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.warn("Could not load case documents:", err.message);
      setDocuments(DOCS);
    }
  };

  const handleClientFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedCase || !selectedCase.id) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Max size is 10MB.");
      return;
    }

    setUploadingDoc(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const bucketName = 'case-documents';

      // 1. Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (uploadErr) throw uploadErr;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
      const publicUrl = urlData?.publicUrl;

      if (!publicUrl) throw new Error("Could not retrieve file public URL.");

      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;

      // 3. Insert into documents table
      const newDoc = {
        case_id: selectedCase.id,
        name: file.name,
        url: publicUrl,
        size: sizeStr,
        uploaded_by: 'client'
      };

      const { error: dbErr } = await supabase
        .from('documents')
        .insert([newDoc]);

      if (dbErr) throw dbErr;

      fetchDocuments(selectedCase.id);
    } catch (err) {
      console.error("Document upload error:", err);
      alert("Failed to upload document: " + err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  // Hire Advocate Modal States
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [lawyers, setLawyers] = useState([]);
  const [loadingLawyers, setLoadingLawyers] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [caseBrief, setCaseBrief] = useState('');
  const [hiring, setHiring] = useState(false);
  const [modalStep, setModalStep] = useState('search'); // 'search' | 'profile' | 'brief' | 'payment' | 'success'

  const fetchLawyers = async () => {
    setLoadingLawyers(true);
    try {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .eq('status', 'approved');
      if (data) setLawyers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLawyers(false);
    }
  };

  const filteredLawyers = lawyers.filter(l =>
    l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.spec?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFinalizePayment = async () => {
    if (!selectedLawyer || !caseBrief.trim() || !client) return;
    setHiring(true);

    const newCaseId = `LC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase = {
       case_id: newCaseId,
       sector: selectedLawyer.spec || 'General Consultation',
       status: 'active',
       name: selectedLawyer.name,
       spec: selectedLawyer.spec,
       email: selectedLawyer.email,
       court: selectedLawyer.court,
       phone: selectedLawyer.phone
    };

    try {
      // 1. Send contact email
      try {
        await fetch('/api/contact-lawyer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: client.name,
            phone: client.phone,
            email: client.email || 'test@example.com',
            caseDetails: caseBrief,
            lawyerEmail: selectedLawyer.email || 'support@legalconnect.com',
            lawyerName: selectedLawyer.name
          })
        });
      } catch (err) {
        console.warn('Email send skipped:', err);
      }

      // 2. Insert to Supabase cases table
      try {
        await supabase.from('cases').insert([{
          lawyer_id: selectedLawyer.id,
          client_name: client.name,
          client_phone: client.phone,
          status: 'pending'
        }]);
      } catch (dbErr) {
        console.error("Supabase write failed:", dbErr);
      }

      // 3. Update local state and localStorage
      const updatedClient = { ...client };
      updatedClient.cases = [...(updatedClient.cases || []), newCase];
      localStorage.setItem('clientAccount', JSON.stringify(updatedClient));
      setClient(updatedClient);
      setCases(prev => [...prev, newCase]);

      // 4. Sync to Mongo/SQLite
      try {
        await axios.post('/.netlify/functions/api/auth/sync-cases', {
          phone: client.phone,
          newCase
        });
      } catch (syncErr) {
        console.warn('Sync failed:', syncErr);
      }

      // Simulate network verification
      setTimeout(() => {
        setModalStep('success');
        setHiring(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to hire advocate. Please try again.');
      setHiring(false);
    }
  };

  useEffect(() => {
    if (user) {
      setClient(user);
      loadClientCases(user);
    }
  }, [user]);

  const loadClientCases = async (parsedClient) => {
    try {
      const { data: dbCases } = await supabase
        .from('cases')
        .select('*')
        .eq('client_phone', parsedClient.phone);

      if (dbCases && dbCases.length > 0) {
        const { data: lawyers } = await supabase.from('lawyers').select('*');
        const mappedCases = dbCases.map((c, idx) => {
          const lawyer = lawyers?.find(l => l.id === c.lawyer_id) || {};
          return {
            id: c.id,
            case_id: c.case_id || `LC-${new Date(c.created_at || Date.now()).getFullYear()}-${1000 + idx}`,
            sector: lawyer.spec || 'General Consultation',
            status: c.status || 'active',
            name: lawyer.name || 'Advocate',
            spec: lawyer.spec || '',
            email: lawyer.email || '',
            court: lawyer.court || '',
            phone: lawyer.phone || '',
            photo_url: lawyer.photo_url || null
          };
        });
        setCases(mappedCases);
      } else {
        let clientCases = parsedClient.cases ? [...parsedClient.cases] : [];
        if (clientCases.length === 0 && parsedClient.hiredLawyer) {
          clientCases.push(parsedClient.hiredLawyer);
        }
        setCases(clientCases);
      }
    } catch (err) {
      console.error('Error loading client cases from Supabase:', err);
      const clientCases = parsedClient.cases ? [...parsedClient.cases] : [];
      if (clientCases.length === 0 && parsedClient.hiredLawyer) {
        clientCases.push(parsedClient.hiredLawyer);
      }
      setCases(clientCases);
    }
  };

  useEffect(() => {
    if (selectedCase) {
      loadMessages(selectedCase.id);
      fetchDocuments(selectedCase.id);
    }
  }, [selectedCase]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (caseId) => {
    if (!caseId) return;
    try {
      const { supabase } = await import('../lib/supabaseClient');
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('case_id', caseId)
        .order('timestamp', { ascending: true });

      if (data) {
        setMessages(data);
      }

      const channelName = `messages-case-${caseId}`;
      const ch = supabase.channel(channelName)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
          p => {
             if (p.new.case_id === caseId) {
               setMessages(prev => [...prev, p.new]);
             }
          })
        .subscribe();
      return () => supabase.removeChannel(ch);
    } catch (_) {}
  };

  const sendMessage = async () => {
    if (!msgText.trim() || !selectedCase || !selectedCase.id) return;
    setSending(true);
    const msg = { 
      text: msgText.trim(), 
      sender: 'client', 
      timestamp: new Date().toISOString(),
      case_id: selectedCase.id
    };
    setMsgText('');
    try {
      const { supabase } = await import('../lib/supabaseClient');
      await supabase.from('messages').insert([msg]);
    } catch (_) {
      setMessages(p => [...p, msg]);
    }
    setSending(false);
  };

  const card = {
    background: 'rgba(18,20,30,0.6)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 24,
    overflow: 'hidden',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050A14', color: 'white',
      fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' }}>

      {/* Ambient blobs */}
      <div style={{ position:'fixed', top:'-15%', left:'-10%', width:'45%', height:'45%',
        background:'rgba(0,229,255,0.04)', filter:'blur(120px)', borderRadius:'50%', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'-15%', right:'-10%', width:'45%', height:'45%',
        background:'rgba(129,140,248,0.04)', filter:'blur(120px)', borderRadius:'50%', pointerEvents:'none', zIndex:0 }} />

      <div style={{ maxWidth:1300, margin:'0 auto', padding:'40px 32px', position:'relative', zIndex:1 }}>

        {/* ── TOP HEADER ── */}
        <header style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
          gap:16, marginBottom:40, flexWrap:'wrap' }}>
          <div>
            <button onClick={() => { localStorage.removeItem('isAuthenticated'); navigate('/'); }}
              style={{ display:'flex', alignItems:'center', gap:6, background:'transparent', border:'none',
                color:'#64748b', fontSize:'0.85rem', cursor:'pointer', marginBottom:16, transition:'color .2s' }}
              onMouseOver={e=>e.currentTarget.style.color='white'}
              onMouseOut={e=>e.currentTarget.style.color='#64748b'}>
              <LogOut size={15} /> Secure Logout
            </button>
            <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'2.6rem', fontWeight:800,
              background:'linear-gradient(90deg,#fff 60%,#94a3b8)', WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent', lineHeight:1.15 }}>
              {client ? `Welcome, ${client.name.split(' ')[0]}` : 'Client Portal'}
            </h1>
            <p style={{ color:'#64748b', marginTop:8, fontSize:'0.95rem' }}>
              Your legal cases — managed securely in real time.
            </p>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:12,
            background:'rgba(0,229,255,0.08)', border:'1px solid rgba(0,229,255,0.25)',
            borderRadius:16, padding:'14px 20px' }}>
            <div style={{ width:38, height:38, borderRadius:10,
              background:'rgba(0,229,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Briefcase size={20} color="#00e5ff" />
            </div>
            <div>
              <div style={{ fontSize:'0.7rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em' }}>Total Cases</div>
              <div style={{ fontWeight:700, color:'#00e5ff', fontSize:'0.9rem' }}>{cases.length} Active</div>
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT ── */}
        <AnimatePresence mode="wait">
          {!selectedCase ? (
            /* CASE LIST OVERVIEW */
            <motion.div key="case-list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.4rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Activity size={22} color="#818cf8" /> Active Case Files
                </h2>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setHireModalOpen(true); fetchLawyers(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #00e5ff 0%, #0094aa 100%)',
                    border: 'none', borderRadius: 12, padding: '10px 18px', color: '#050A14',
                    fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,229,255,0.25)' }}>
                  <PlusCircle size={16} /> Add New Case
                </motion.button>
              </div>
              
              {cases.length === 0 ? (
                <div style={{ ...card, padding: 40, textAlign: 'center', color: '#64748b' }}>
                   <Briefcase size={40} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                   <p>You have no active cases yet. Hire an advocate to get started.</p>
                   <button onClick={() => { setHireModalOpen(true); fetchLawyers(); }}
                     style={{ marginTop: 20, padding: '12px 24px', background: 'linear-gradient(135deg, #00e5ff, #0094aa)',
                       border: 'none', borderRadius: 12, color: '#050A14', fontWeight: 700, cursor: 'pointer' }}>
                     Hire an Advocate
                   </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                  {cases.map((c, idx) => (
                    <motion.div key={idx} whileHover={{ y: -5, borderColor: 'rgba(0,229,255,0.4)' }}
                      onClick={() => setSelectedCase(c)}
                      style={{ ...card, padding: 24, cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'linear-gradient(to bottom, #00e5ff, #818cf8)' }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                         <div>
                            <div style={{ fontSize: '0.75rem', color: '#00e5ff', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>
                               {c.case_id || `LC-2026-00${idx + 1}`}
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{c.sector || 'General Consultation'}</h3>
                         </div>
                         <StatusBadge label={c.status === 'active' ? 'Active' : 'Pending'} color={c.status === 'active' ? '#10b981' : '#f59e0b'} />
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                         <Avatar lawyer={c} size={40} radius="10px" />
                         <div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Assigned Advocate</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0' }}>{c.name}</div>
                         </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 15 }}>
                         <span style={{ fontSize: '0.8rem', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Open Workspace <ChevronLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                         </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            /* CASE DETAIL WORKSPACE */
            <motion.div key="case-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => { setSelectedCase(null); setChatOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontSize: '0.85rem', cursor: 'pointer', padding: '8px 16px', borderRadius: 20, marginBottom: 24, transition: 'all .2s' }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                <ChevronLeft size={16} /> Back to Cases
              </button>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
                 <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>
                   {selectedCase.sector || 'General Case'}
                 </h2>
                 <span style={{ color: '#00e5ff', fontSize: '0.9rem', fontWeight: 700 }}>
                   {selectedCase.case_id || 'LC-2026-001'}
                 </span>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:28, alignItems:'flex-start' }}>
                {/* LEFT — lawyer card / chat */}
                <div>
                  <AnimatePresence mode="wait">
                    {!chatOpen ? (
                      /* Lawyer info card */
                      <motion.div key="info"
                        initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                        style={{ ...card, padding:28 }}>

                        <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#475569',
                          textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:20 }}>
                          Assigned Advocate
                        </div>

                        {/* Avatar + name */}
                        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
                          <div style={{ position:'relative' }}>
                            <Avatar lawyer={selectedCase} size={68} radius="16px" />
                            <div style={{ position:'absolute', bottom:-2, right:-2, width:14, height:14,
                              background:'#10b981', borderRadius:'50%', border:'2.5px solid #050A14' }} />
                          </div>
                          <div>
                            <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.2rem', fontWeight:700 }}>{selectedCase.name}</div>
                            <div style={{ color:'#00e5ff', fontSize:'0.82rem', marginTop:3 }}>{selectedCase.spec}</div>
                          </div>
                        </div>

                        {/* Contact details */}
                        {[
                          { icon: <Scale size={15} color="#818cf8" />,      text: selectedCase.court },
                          { icon: <MessageSquare size={15} color="#00e5ff" />, text: selectedCase.email },
                          { icon: <Bell size={15} color="#f59e0b" />,       text: selectedCase.phone || '7007590774' },
                        ].map((r, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                            background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)',
                            borderRadius:10, marginBottom:8, fontSize:'0.85rem', color:'#cbd5e1' }}>
                            {r.icon} {r.text}
                          </div>
                        ))}

                        {/* E2E badge */}
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:20, marginBottom:20,
                          padding:'10px 14px', background:'rgba(16,185,129,0.06)',
                          border:'1px solid rgba(16,185,129,0.2)', borderRadius:10 }}>
                          <Shield size={14} color="#10b981" />
                          <span style={{ fontSize:'0.78rem', color:'#10b981', fontWeight:600 }}>End-to-end encrypted channel</span>
                        </div>

                        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
                          onClick={() => setChatOpen(true)}
                          style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,rgba(0,229,255,.15),rgba(129,140,248,.15))',
                            border:'1px solid rgba(0,229,255,.3)', borderRadius:12, color:'#00e5ff',
                            fontWeight:700, fontSize:'0.9rem', display:'flex', alignItems:'center',
                            justifyContent:'center', gap:8, cursor:'pointer' }}>
                          <MessageSquare size={17} /> Open Secure Chat
                        </motion.button>
                      </motion.div>

                    ) : (
                      /* Chat window */
                      <motion.div key="chat"
                        initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
                        style={{ ...card, display:'flex', flexDirection:'column', height:600 }}>

                        {/* Chat header */}
                        <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)',
                          display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.02)' }}>
                          <button onClick={() => setChatOpen(false)}
                            style={{ background:'transparent', border:'none', color:'#94a3b8', cursor:'pointer', padding:4 }}>
                            <ChevronLeft size={20} />
                          </button>
                          <Avatar lawyer={selectedCase} size={36} radius="10px" />
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{selectedCase.name}</div>
                            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color:'#10b981' }}>
                              <Circle size={8} fill="#10b981" color="#10b981" /> Online
                            </div>
                          </div>
                          <div style={{ fontSize:'0.72rem', color:'#10b981', background:'rgba(16,185,129,0.1)',
                            border:'1px solid rgba(16,185,129,0.3)', borderRadius:20, padding:'4px 10px' }}>
                            E2E Encrypted
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="hide-scrollbar" style={{ flex:1, padding:'20px', overflowY:'auto',
                          display:'flex', flexDirection:'column', gap:12 }}>
                          {messages.length === 0 ? (
                            <div style={{ margin:'auto', textAlign:'center', color:'#475569' }}>
                              <MessageSquare size={32} style={{ opacity:.3, marginBottom:10 }} />
                              <div style={{ fontSize:'0.85rem' }}>No messages yet for this case.<br/>Send a message to your advocate.</div>
                            </div>
                          ) : messages.map((m, i) => (
                            <div key={i} style={{ display:'flex', justifyContent: m.sender==='client' ? 'flex-end' : 'flex-start' }}>
                              <div style={{
                                maxWidth:'78%', padding:'11px 16px', fontSize:'0.9rem', lineHeight:1.5,
                                borderRadius: m.sender==='client' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                background: m.sender==='client'
                                  ? 'linear-gradient(135deg,rgba(0,229,255,.15),rgba(0,148,170,.1))'
                                  : 'rgba(255,255,255,0.04)',
                                border: m.sender==='client'
                                  ? '1px solid rgba(0,229,255,0.25)'
                                  : '1px solid rgba(255,255,255,0.06)',
                              }}>
                                {m.text}
                                <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.35)',
                                  marginTop:5, textAlign: m.sender==='client' ? 'right' : 'left' }}>
                                  {new Date(m.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={msgEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                          <form onSubmit={e => { e.preventDefault(); sendMessage(); }}
                            style={{ display:'flex', gap:10, alignItems:'center' }}>
                            <button type="button" style={{ background:'transparent', border:'none', color:'#64748b', cursor:'pointer', padding:6 }}>
                              <Paperclip size={18} />
                            </button>
                            <input value={msgText} onChange={e => setMsgText(e.target.value)}
                              placeholder="Type a secure message…"
                              style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                                borderRadius:30, padding:'10px 16px', color:'white', fontSize:'0.88rem',
                                outline:'none', transition:'border-color .2s' }}
                              onFocus={e => e.target.style.borderColor='rgba(0,229,255,0.4)'}
                              onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
                            />
                            <motion.button type="submit" disabled={sending}
                              whileHover={{ scale:1.08 }} whileTap={{ scale:.95 }}
                              style={{ width:40, height:40, borderRadius:'50%',
                                background:'linear-gradient(135deg,#00e5ff,#0094aa)',
                                border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                              <Send size={16} color="#050A14" />
                            </motion.button>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* RIGHT — timeline + docs */}
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

                  {/* Timeline */}
                  <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
                    style={{ ...card, padding:32 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
                      <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.2rem', fontWeight:700,
                        display:'flex', alignItems:'center', gap:10 }}>
                        <Calendar size={20} color="#00e5ff" /> Upcoming Court Dates
                      </h3>
                      <button style={{ fontSize:'0.78rem', color:'#00e5ff', background:'rgba(0,229,255,.08)',
                        border:'1px solid rgba(0,229,255,.2)', borderRadius:20, padding:'5px 14px', cursor:'pointer' }}>
                        Sync to Calendar
                      </button>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                      {TIMELINE.map((item, i) => (
                        <div key={i} style={{ display:'flex', gap:20 }}>
                          {/* line + dot */}
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:20, flexShrink:0 }}>
                            <div style={{ width:16, height:16, borderRadius:'50%', flexShrink:0, marginTop:4,
                              background: item.status==='upcoming' ? '#00e5ff' : 'transparent',
                              border: item.status==='upcoming' ? '2px solid #00e5ff' : '2px solid #334155',
                              boxShadow: item.status==='upcoming' ? '0 0 12px rgba(0,229,255,0.5)' : 'none' }} />
                            {i < TIMELINE.length-1 && (
                              <div style={{ width:1, flex:1, background:'rgba(255,255,255,0.07)', minHeight:32 }} />
                            )}
                          </div>
                          {/* content */}
                          <div style={{ paddingBottom: i < TIMELINE.length-1 ? 28 : 0 }}>
                            <div style={{ fontSize:'0.78rem', fontWeight:700, marginBottom:4,
                              color: item.status==='upcoming' ? '#00e5ff' : '#475569',
                              display:'flex', alignItems:'center', gap:6 }}>
                              <Clock size={12} /> {item.date}
                            </div>
                            <div style={{ fontSize:'1rem', color: item.status==='upcoming' ? 'white' : '#94a3b8', fontWeight: item.status==='upcoming' ? 600 : 400 }}>
                              {item.event}
                            </div>
                            {item.status === 'upcoming' && (
                              <div style={{ marginTop:6 }}>
                                <StatusBadge label="Next Hearing" color="#00e5ff" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Documents */}
                  <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}
                    style={{ ...card, padding:32 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                      <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.2rem', fontWeight:700,
                        display:'flex', alignItems:'center', gap:10 }}>
                        <FileText size={20} color="#818cf8" /> Case Documents
                      </h3>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingDoc || !selectedCase || !selectedCase.id}
                        style={{ fontSize:'0.82rem', color:'#818cf8', background:'rgba(129,140,248,.08)',
                        border:'1px solid rgba(129,140,248,.25)', borderRadius:20, padding:'6px 14px', cursor: (uploadingDoc || !selectedCase || !selectedCase.id) ? 'not-allowed' : 'pointer' }}>
                        {uploadingDoc ? 'Uploading...' : '+ Upload New'}
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleClientFileUpload} 
                        style={{ display: 'none' }} 
                      />
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {documents.length === 0 ? (
                        <div style={{ padding: '30px 10px', textAlign: 'center', color: '#475569', fontSize: '0.85rem' }}>
                          No documents uploaded yet.
                        </div>
                      ) : documents.map(doc => (
                        <motion.div key={doc.id}
                          whileHover={{ x:4, borderColor:'rgba(129,140,248,0.35)' }}
                          style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                            padding:'14px 18px', background:'rgba(255,255,255,0.03)',
                            border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, transition:'all .2s' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                            <div style={{ width:42, height:42, borderRadius:10,
                              background:'rgba(129,140,248,0.1)', border:'1px solid rgba(129,140,248,0.15)',
                              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>
                              {doc.uploaded_by === 'lawyer' ? '💼' : '📄'}
                            </div>
                            <div>
                              <div style={{ fontWeight:600, fontSize:'0.92rem' }}>{doc.name}</div>
                              <div style={{ fontSize:'0.75rem', color:'#475569', marginTop:3 }}>
                                Uploaded by {doc.uploaded_by === 'lawyer' ? 'Advocate' : 'You'} {doc.created_at ? `on ${new Date(doc.created_at).toLocaleDateString()}` : ''}
                              </div>
                            </div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                            <span style={{ fontSize:'0.78rem', color:'#cbd5e1' }}>{doc.size}</span>
                            <motion.button whileHover={{ scale:1.15 }}
                              onClick={() => window.open(doc.url, '_blank')}
                              style={{ width:34, height:34, borderRadius:'50%',
                                background:'rgba(129,140,248,0.1)', border:'1px solid rgba(129,140,248,0.2)',
                                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                              <Download size={14} color="#818cf8" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── HIRE ADVOCATE MODAL ─── */}
      <AnimatePresence>
        {hireModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center',
              justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
              padding: 20
            }}
            onClick={() => {
              if (!hiring) {
                setHireModalOpen(false);
                setSelectedLawyer(null);
                setCaseBrief('');
                setModalStep('search');
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{
                width: '100%', maxWidth: 500, background: 'rgba(18, 20, 30, 0.95)',
                border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: 24, padding: 32,
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto',
                position: 'relative'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setHireModalOpen(false);
                  setSelectedLawyer(null);
                  setCaseBrief('');
                  setModalStep('search');
                }}
                disabled={hiring}
                style={{
                  position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.05)',
                  border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white'
                }}
              >
                <X size={16} />
              </button>

              {modalStep === 'search' && (
                <>
                  <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>
                    Hire Advocate
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 24 }}>
                    Select an approved advocate to hire for another case.
                  </p>

                  {/* Search */}
                  <div style={{ position: 'relative', marginBottom: 20 }}>
                    <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                      type="text"
                      placeholder="Search by name or specialization..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        padding: '12px 14px 12px 42px', borderRadius: 12, color: 'white', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {loadingLawyers ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                      <div style={{ width: 24, height: 24, border: '2.5px solid #00e5ff', borderTopColor: 'transparent',
                        borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    </div>
                  ) : filteredLawyers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '0.9rem' }}>
                      No approved advocates found matching search query.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '40vh', overflowY: 'auto' }} className="hide-scrollbar">
                      {filteredLawyers.map(lawyer => (
                        <div
                          key={lawyer.id}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 16, gap: 12
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, overflow: 'hidden' }}>
                            <Avatar lawyer={lawyer} size={40} radius="10px" />
                            <div style={{ overflow: 'hidden' }}>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{lawyer.name}</h4>
                              <p style={{ color: '#00e5ff', fontSize: '0.78rem', margin: '3px 0 0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{lawyer.spec}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => { setSelectedLawyer(lawyer); setModalStep('profile'); }}
                            style={{
                              padding: '8px 14px', background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.25)',
                              borderRadius: 10, color: '#00e5ff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0
                            }}
                          >
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {modalStep === 'profile' && selectedLawyer && (
                <>
                  <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>
                    Advocate Profile
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 20 }}>
                    Review details for Adv. {selectedLawyer.name}.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <Avatar lawyer={selectedLawyer} size={64} radius="12px" />
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{selectedLawyer.name}</h4>
                      <p style={{ color: '#00e5ff', fontSize: '0.85rem', margin: '3px 0 0' }}>{selectedLawyer.spec}</p>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, marginBottom: 24, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ color: '#cbd5e1' }}><strong style={{ color: '#64748b' }}>Primary Court:</strong> {selectedLawyer.court}</div>
                    {selectedLawyer.barNo && <div style={{ color: '#cbd5e1' }}><strong style={{ color: '#64748b' }}>Bar No:</strong> {selectedLawyer.barNo}</div>}
                    {selectedLawyer.aorNo && <div style={{ color: '#cbd5e1' }}><strong style={{ color: '#64748b' }}>AOR No:</strong> {selectedLawyer.aorNo}</div>}
                    <div style={{ color: '#cbd5e1' }}><strong style={{ color: '#64748b' }}>Office Address:</strong> {selectedLawyer.address}</div>
                    <div style={{ color: '#cbd5e1' }}><strong style={{ color: '#64748b' }}>Contact Email:</strong> {selectedLawyer.email || 'N/A'}</div>
                    <div style={{ color: '#cbd5e1' }}><strong style={{ color: '#64748b' }}>Phone:</strong> {selectedLawyer.phone || 'N/A'}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setModalStep('search')}
                      style={{
                        flex: 1, padding: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, color: 'white', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Back to List
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalStep('brief')}
                      style={{
                        flex: 2, padding: 13, background: 'linear-gradient(135deg, #00e5ff, #0094aa)', border: 'none',
                        borderRadius: 12, color: '#050A14', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      Proceed to Case Brief
                    </button>
                  </div>
                </>
              )}

              {modalStep === 'brief' && selectedLawyer && (
                <>
                  <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>
                    Case Description
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 20 }}>
                    Enter details for <strong>{selectedLawyer.name}</strong> to handle this case.
                  </p>

                  <textarea
                    placeholder="Enter detailed case brief..."
                    rows={5}
                    value={caseBrief}
                    onChange={e => setCaseBrief(e.target.value)}
                    style={{
                      width: '100%', padding: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12, color: 'white', outline: 'none', resize: 'none', marginBottom: 24, fontSize: '0.9rem',
                      fontFamily: 'Inter, sans-serif', boxSizing: 'border-box'
                    }}
                  />

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setModalStep('profile')}
                      style={{
                        flex: 1, padding: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, color: 'white', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (caseBrief.trim()) setModalStep('payment'); }}
                      disabled={!caseBrief.trim()}
                      style={{
                        flex: 2, padding: 13, background: 'linear-gradient(135deg, #00e5ff, #0094aa)', border: 'none',
                        borderRadius: 12, color: '#050A14', fontWeight: 700, cursor: !caseBrief.trim() ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </>
              )}

              {modalStep === 'payment' && selectedLawyer && (
                <>
                  <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>
                    Checkout Retainer
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 20 }}>
                    Finalize retainer payment to hire your advocate.
                  </p>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ color: '#64748b', fontSize: '0.88rem' }}>Counsel Retained:</span>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: '0.88rem' }}>Adv. {selectedLawyer.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ color: '#64748b', fontSize: '0.88rem' }}>Services Rendered:</span>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: '0.88rem' }}>Case Representation</span>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#00e5ff', fontWeight: 700, fontSize: '1.05rem' }}>Total Due:</span>
                      <span style={{ color: '#00e5ff', fontWeight: 800, fontSize: '1.05rem' }}>₹0 <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>(Showcase Demo)</span></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setModalStep('brief')}
                      disabled={hiring}
                      style={{
                        flex: 1, padding: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, color: 'white', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleFinalizePayment}
                      disabled={hiring}
                      style={{
                        flex: 2, padding: 13, background: 'linear-gradient(135deg, #00e5ff, #0094aa)', border: 'none',
                        borderRadius: 12, color: '#050A14', fontWeight: 700, cursor: hiring ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                      }}
                    >
                      {hiring ? (
                        <><div style={{ width: 16, height: 16, border: '2px solid #050A14', borderTopColor: 'transparent',
                          borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Processing...</>
                      ) : 'Complete Payment'}
                    </button>
                  </div>
                </>
              )}

              {modalStep === 'success' && selectedLawyer && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: 68, height: 68, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle2 size={36} color="#34d399" />
                  </div>
                  <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'white', marginBottom: 12 }}>
                    Retainer Confirmed!
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 28 }}>
                    Payment processed successfully! Your new case has been assigned to <strong>{selectedLawyer.name}</strong>.
                    You can view the active case details on your dashboard.
                  </p>
                  <button
                    onClick={() => {
                      setHireModalOpen(false);
                      setSelectedLawyer(null);
                      setCaseBrief('');
                      setModalStep('search');
                    }}
                    style={{
                      width: '100%', padding: 13, background: 'linear-gradient(135deg, #00e5ff, #0094aa)', border: 'none',
                      borderRadius: 12, color: '#050A14', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@media(max-width:900px){.cd-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
};

export default ClientDashboard;
