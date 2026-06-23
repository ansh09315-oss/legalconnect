import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PresentationControls, Float } from '@react-three/drei';
import {
  CheckCircle, XCircle, Send, Briefcase, Clock, Activity,
  MessageSquare, Paperclip, MoreVertical, Circle, RefreshCw, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { LawyerAvatar } from './Sidebar';

/* ──────────────────────────────────────────
   3-D background scene
────────────────────────────────────────── */
function Header3DScene() {
  return (
    <Canvas camera={{ position: [0, 2, 7], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00e5ff" />
      <Environment preset="city" />
      <PresentationControls global rotation={[0, -0.2, 0]} polar={[-0.1, 0.2]} azimuth={[-0.5, 0.5]}>
        <Float rotationIntensity={0.5} floatIntensity={1} speed={1.5}>
          <group position={[0, -0.5, 0]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[3.5, 3.8, 0.2, 64]} />
              <meshStandardMaterial color="#0a0a0c" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[3.3, 3.5, 0.1, 64]} />
              <meshStandardMaterial color="#1a1c24" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2.5, 0.02, 16, 100]} />
              <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 2, 0]}>
              <octahedronGeometry args={[1.2, 0]} />
              <meshPhysicalMaterial color="#ffffff" transmission={0.95} roughness={0}
                ior={1.5} thickness={1} clearcoat={1} clearcoatRoughness={0.1} />
            </mesh>
            <mesh position={[-2.5, 1.5, 1.5]}>
              <icosahedronGeometry args={[0.3, 0]} />
              <meshPhysicalMaterial color="#00e5ff" transmission={0.8} roughness={0.2} ior={1.4} />
            </mesh>
            <mesh position={[2.5, 2.5, -1.5]}>
              <icosahedronGeometry args={[0.4, 0]} />
              <meshPhysicalMaterial color="#818cf8" transmission={0.8} roughness={0.2} ior={1.4} />
            </mesh>
          </group>
        </Float>
      </PresentationControls>
    </Canvas>
  );
}

/* ──────────────────────────────────────────
   MainContent
────────────────────────────────────────── */
const MainContent = () => {
  const { user } = useAuth();
  const [lawyer,     setLawyer]     = useState(null);
  const [cases,      setCases]      = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [sending,    setSending]    = useState(false);
  const messagesEndRef = useRef(null);

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
      console.warn("Could not fetch case documents:", err.message);
    }
  };

  const handleLawyerFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat || !activeChat.id) return;

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
        case_id: activeChat.id,
        name: file.name,
        url: publicUrl,
        size: sizeStr,
        uploaded_by: 'lawyer'
      };

      const { error: dbErr } = await supabase
        .from('documents')
        .insert([newDoc]);

      if (dbErr) throw dbErr;

      fetchDocuments(activeChat.id);
    } catch (err) {
      console.error("Document upload error:", err);
      alert("Failed to upload document: " + err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  /* ── 1. Load lawyer — ALWAYS re-fetch from Supabase to get fresh photo_url ── */
  useEffect(() => {
    const init = async () => {
      if (!user || user.role !== 'lawyer') { setLoading(false); return; }

      setLawyer(user);       // show cached data immediately (fast UI)
      fetchCases(user.id);
      // Re-fetch from Supabase to get latest data incl. photo_url
      try {
        const { data } = await supabase
          .from('lawyers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setLawyer(data);
          localStorage.setItem('lawyerAccount', JSON.stringify(data)); // refresh cache
        }
      } catch (err) {
        console.error('Error refreshing lawyer profile:', err);
      }
      
      setLoading(false);
    };
    init();
  }, []);

  /* ── 2. Cases ── */
  const fetchCases = async (lawyerId) => {
    const { data } = await supabase
      .from('cases')
      .select('*')
      .eq('lawyer_id', lawyerId)
      .order('created_at', { ascending: false });
    if (data) setCases(data);
  };

  const handleCaseStatus = async (caseId, newStatus) => {
    const { error } = await supabase.from('cases').update({ status: newStatus }).eq('id', caseId);
    if (!error && lawyer) fetchCases(lawyer.id);
  };

  /* ── 3. Messages — filtered by case_id if available ── */
  useEffect(() => {
    if (!activeChat) return;

    const load = async () => {
      let query = supabase.from('messages').select('*').order('timestamp', { ascending: true });
      if (activeChat.id) query = query.eq('case_id', activeChat.id);

      const { data, error } = await query;
      if (data) setMessages(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    load();
    fetchDocuments(activeChat.id);

    const channel = supabase
      .channel(`messages-case-${activeChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, p => {
        if (p.new.case_id === activeChat.id) {
          setMessages(prev => [...prev, p.new]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeChat]);

  /* ── 4. Send message ── */
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat || sending) return;
    setSending(true);
    const msg = { 
      sender: 'lawyer', 
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      case_id: activeChat.id 
    };
    setNewMessage('');
    await supabase.from('messages').insert([msg]);
    setSending(false);
  };

  const pendingCases = cases.filter(c => c.status === 'pending');
  const activeCases  = cases.filter(c => c.status === 'active');

  /* ────────── render ────────── */
  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── HERO + PROFILE CARD ── */}
      <div style={{ position: 'relative', height: 420, borderRadius: 24, overflow: 'hidden',
        background: 'radial-gradient(circle at center, #1a1c24 0%, #050A14 100%)',
        border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>

        {/* 3-D canvas fills right side */}
        <div style={{ position: 'absolute', inset: 0 }}><Header3DScene /></div>

        {/* Gradient overlay for readability */}
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(5,10,20,0.92) 0%, rgba(5,10,20,0.5) 55%, transparent 100%)',
          pointerEvents: 'none' }} />

        {/* Profile card */}
        <div className="bento-card animate-float" style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 40,
          display: 'flex', flexDirection: 'column', gap: 20, padding: 30,
          maxWidth: 480, width: 'calc(100% - 80px)',
          background: 'rgba(18,20,30,0.70)', border: '1px solid rgba(0,229,255,0.18)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {/* ── REAL PHOTO via LawyerAvatar ── */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {loading ? (
                <div style={{ width: 135, height: 135, borderRadius: 28,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={28} color="#334155" style={{ animation: 'spin .8s linear infinite' }} />
                </div>
              ) : (
                <div style={{ width: 135, height: 135, borderRadius: 28, overflow: 'hidden',
                  boxShadow: '0 14px 40px rgba(0,229,255,0.28)' }}>
                  <LawyerAvatar lawyer={lawyer} size={135} radius="28px" fontSize="3.2rem" />
                </div>
              )}
              <div style={{ position: 'absolute', bottom: -5, right: -5, width: 24, height: 24,
                background: '#10b981', borderRadius: '50%', border: '3.5px solid #050A14' }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 className="glow-text" style={{ fontSize: '1.55rem', fontWeight: 800,
                fontFamily: 'Outfit,sans-serif', marginBottom: 4, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {lawyer?.name || (loading ? 'Loading…' : 'Advocate')}
              </h3>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={13} /> Advocate Profile
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#e2e8f0' }}>
                {lawyer?.spec || ''}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                {lawyer?.court || ''}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { label: 'Active Cases',  value: activeCases.length,  color: '#00e5ff', Icon: Activity },
              { label: 'Pending',       value: pendingCases.length, color: '#818cf8', Icon: Clock   },
              { label: 'Total',         value: cases.length,        color: '#10b981', Icon: Briefcase },
            ].map(({ label, value, color, Icon }) => (
              <div key={label} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 12 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color, fontFamily: 'Outfit,sans-serif' }}>{value}</div>
                <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: 2,
                  display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon size={11} /> {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEW CASE REQUESTS ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 className="bento-card-header" style={{ margin: 0 }}>New Case Requests</h3>
          {pendingCases.length > 0 && (
            <span style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20,
              padding: '3px 12px', fontSize: '0.75rem', fontWeight: 700 }}>
              {pendingCases.length} pending
            </span>
          )}
        </div>

        {pendingCases.length === 0 ? (
          <div className="bento-card" style={{ padding: 28, textAlign: 'center',
            color: '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={32} style={{ opacity: 0.25 }} />
            <span style={{ fontSize: '0.9rem' }}>No pending case requests at the moment.</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
            {pendingCases.map(c => (
              <div key={c.id} className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12,
                    background: 'linear-gradient(135deg,#818cf8,#00e5ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '1rem', color: 'white', flexShrink: 0 }}>
                    {c.client_name?.split(' ').map(n => n[0]).join('').slice(0,2) || '?'}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>{c.client_name}</h4>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{c.client_phone}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Requesting legal consultation and case representation.
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                  <button onClick={() => handleCaseStatus(c.id, 'active')}
                    style={{ flex: 1, padding: '10px', background: 'rgba(16,185,129,0.1)',
                      color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'all .2s' }}
                    onMouseOver={e => e.currentTarget.style.background='rgba(16,185,129,0.2)'}
                    onMouseOut={e => e.currentTarget.style.background='rgba(16,185,129,0.1)'}>
                    <CheckCircle size={15} /> Accept
                  </button>
                  <button onClick={() => handleCaseStatus(c.id, 'rejected')}
                    style={{ flex: 1, padding: '10px', background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'all .2s' }}
                    onMouseOver={e => e.currentTarget.style.background='rgba(239,68,68,0.2)'}
                    onMouseOut={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}>
                    <XCircle size={15} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ACTIVE CLIENT WORKSPACE ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 className="bento-card-header" style={{ margin: 0 }}>Active Client Workspace</h3>
            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Circle size={8} color="#10b981" fill="#10b981" /> Real-time Encrypted Messages
            </div>
          </div>
          <button onClick={() => lawyer && fetchCases(lawyer.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 14px',
              color: '#64748b', fontSize: '0.8rem', cursor: 'pointer' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        <div className="bento-card" style={{ height: 460, display: 'flex', overflow: 'hidden', padding: 0 }}>

          {/* ── Client list ── */}
          <div style={{ width: 260, borderRight: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <input type="text" placeholder="Search clients…"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, padding: '8px 12px', color: 'white', fontSize: '0.8rem', outline: 'none',
                  boxSizing: 'border-box' }} />
            </div>
            <div className="hide-scrollbar" style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
              {activeCases.length === 0 ? (
                <div style={{ padding: '30px 12px', textAlign: 'center', color: '#334155', fontSize: '0.82rem' }}>
                  <MessageSquare size={24} style={{ opacity: .3, margin: '0 auto 8px', display: 'block' }} />
                  No active clients yet
                </div>
              ) : activeCases.map(c => (
                <div key={c.id} onClick={() => setActiveChat(c)}
                  style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', marginBottom: 4,
                    background: activeChat?.id === c.id ? 'rgba(0,229,255,0.1)' : 'transparent',
                    borderLeft: `3px solid ${activeChat?.id === c.id ? '#00e5ff' : 'transparent'}`,
                    transition: 'all .2s' }}
                  onMouseOver={e => { if(activeChat?.id !== c.id) e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
                  onMouseOut={e => { if(activeChat?.id !== c.id) e.currentTarget.style.background='transparent'; }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>{c.client_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 3,
                    display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Circle size={7} fill="#10b981" color="#10b981" /> Active Case
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Chat area ── */}
          {activeChat ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'row', background: 'rgba(12,14,22,0.4)', minWidth: 0 }}>
              
              {/* Chat Window Column */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Chat header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#00e5ff,#818cf8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '1rem', color: 'white', position: 'relative' }}>
                      {activeChat.client_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12,
                        background: '#10b981', borderRadius: '50%', border: '2px solid #050A14' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{activeChat.client_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Circle size={8} fill="#10b981" color="#10b981" /> Online · {activeChat.client_phone}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingDoc}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      padding: '7px 12px', borderRadius: 8, color: 'rgba(255,255,255,0.7)', cursor: uploadingDoc ? 'not-allowed' : 'pointer' }}
                      onMouseOver={e=>{if(!uploadingDoc) e.currentTarget.style.background='rgba(255,255,255,0.1)'}}
                      onMouseOut={e=>{if(!uploadingDoc) e.currentTarget.style.background='rgba(255,255,255,0.05)'}}>
                      <Paperclip size={13} /> {uploadingDoc ? 'Uploading...' : 'Upload Doc'}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLawyerFileUpload} 
                      style={{ display: 'none' }} 
                    />
                    <button style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', padding: 6 }}>
                      <MoreVertical size={17} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="hide-scrollbar" style={{ flex: 1, padding: '20px', overflowY: 'auto',
                  display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {messages.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', color: '#334155' }}>
                      <MessageSquare size={32} style={{ opacity: .25, marginBottom: 10 }} />
                      <div style={{ fontSize: '0.85rem' }}>No messages yet. Start the conversation.</div>
                    </div>
                  ) : messages.map(msg => (
                    <div key={msg.id} className={msg.sender === 'lawyer' ? 'chat-bubble-lawyer' : 'chat-bubble-client'}
                      style={{ alignSelf: msg.sender === 'lawyer' ? 'flex-end' : 'flex-start',
                        padding: '11px 16px', maxWidth: '75%', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {msg.text}
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)',
                        marginTop: 5, textAlign: msg.sender === 'lawyer' ? 'right' : 'left' }}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                  <form onSubmit={e => { e.preventDefault(); sendMessage(); }}
                    style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a secure message to your client…"
                      style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 30, padding: '10px 18px', color: 'white', fontSize: '0.88rem',
                        outline: 'none', transition: 'border-color .2s' }}
                      onFocus={e => e.target.style.borderColor='rgba(0,229,255,0.4)'}
                      onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
                    <button type="submit" disabled={sending || !newMessage.trim()}
                      style={{ width: 42, height: 42, borderRadius: '50%', border: 'none',
                        background: newMessage.trim() ? 'linear-gradient(135deg,#00e5ff,#0094aa)' : 'rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: newMessage.trim() ? 'pointer' : 'default', transition: 'all .2s', flexShrink: 0 }}>
                      <Send size={16} color={newMessage.trim() ? '#050A14' : '#334155'} />
                    </button>
                  </form>
                </div>
              </div>

              {/* ── Shared documents panel ── */}
              <div style={{ width: 240, background: 'rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Case Documents
                  </span>
                  {uploadingDoc && (
                    <div style={{ width: 12, height: 12, border: '2px solid #00e5ff', borderTopColor: 'transparent',
                      borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  )}
                </div>
                
                <div className="hide-scrollbar" style={{ overflowY: 'auto', flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {documents.length === 0 ? (
                    <div style={{ padding: '30px 10px', textAlign: 'center', color: '#334155', fontSize: '0.78rem' }}>
                      No files shared yet
                    </div>
                  ) : documents.map(doc => (
                    <div key={doc.id} style={{
                      padding: 10,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ fontSize: '1.1rem' }}>{doc.uploaded_by === 'lawyer' ? '💼' : '📄'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.name}>
                            {doc.name}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 2 }}>
                            {doc.uploaded_by === 'lawyer' ? 'By you' : 'By client'} · {doc.size}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => window.open(doc.url, '_blank')}
                        style={{
                          padding: '5px',
                          background: 'rgba(0, 229, 255, 0.08)',
                          border: '1px solid rgba(0, 229, 255, 0.2)',
                          borderRadius: 6,
                          color: '#00e5ff',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4
                        }}
                      >
                        <Download size={10} /> View / Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12, color: '#334155' }}>
              <MessageSquare size={44} style={{ opacity: .2 }} />
              <span style={{ fontSize: '0.9rem' }}>Select an active client to open their workspace</span>
              {activeCases.length === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#475569',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '8px 14px', marginTop: 8 }}>
                  <AlertCircle size={14} /> Accept a case request above to start chatting
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
};

export default MainContent;
