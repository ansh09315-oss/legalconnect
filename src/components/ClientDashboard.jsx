import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, Calendar, FileText, Scale, Download, MessageSquare, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const hiredLawyer = {
  name: 'Pallavi Singh',
  spec: 'High Court Advocate',
  email: 'thakurpallavi33@gmail.com',
  phone: '7007590774',
  court: 'High Court Lucknow'
};

const uploadedDocuments = [
  { id: 1, name: 'Initial Case Briefing', date: 'Oct 12, 2026', size: '2.4 MB' },
  { id: 2, name: 'Evidence Photography.zip', date: 'Oct 14, 2026', size: '14.1 MB' },
  { id: 3, name: 'Signed Vakalatnama', date: 'Oct 15, 2026', size: '1.1 MB' }
];

const timelineDates = [
  { date: 'Oct 20, 2026', event: 'First Hearing at High Court', status: 'upcoming' },
  { date: 'Nov 05, 2026', event: 'Submission of Counter-Affidavit', status: 'pending' }
];

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('clientAccount');
    if (data) setClientData(JSON.parse(data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const activeLawyer = clientData?.hiredLawyer || hiredLawyer;

  return (
    <div className="min-h-screen bg-legal-navy text-white font-sans p-6 md:p-12 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-legal-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={handleLogout}
              className="interactive flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm"
            >
              <LogOut size={16} /> Secure Logout
            </button>
            <h1 className="text-3xl md:text-5xl font-display font-bold">
              {clientData ? `Welcome, ${clientData.name}` : 'Client Portal'}
            </h1>
            <p className="text-slate-400 mt-2">Manage your active cases and communicate with your advocate.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-2xl pr-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Status</p>
              <p className="font-bold text-emerald-400 text-sm">Advocate Hired Active</p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Lawyer Info & Communication */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-3xl"
            >
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Your Advocate</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-legal-cyan to-indigo-500 border border-legal-cyan/30 flex items-center justify-center text-xl font-bold">
                  {activeLawyer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-lg font-bold">{activeLawyer.name}</h4>
                  <p className="text-legal-cyan text-sm">{activeLawyer.spec}</p>
                </div>
              </div>
              <div className="space-y-4 mb-8 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <Scale size={16} className="text-slate-500" />
                  <span>{activeLawyer.court || 'Assigned Jurisdiction'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-slate-500" />
                  <span>{activeLawyer.email || 'Contact Support'}</span>
                </div>
              </div>
              
              <button className="interactive w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-legal-cyan/30 transition-all text-sm font-semibold flex items-center justify-center gap-2 text-white">
                <MessageSquare size={16} /> Open Secure Chat
              </button>
            </motion.div>
          </div>

          {/* Right Column: Case Details & Timeline */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Timeline Map */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 md:p-8 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-display font-bold flex items-center gap-2">
                  <Calendar className="text-legal-cyan" /> Upcoming Court Dates
                </h3>
                <span className="text-xs px-3 py-1 bg-legal-cyan/10 text-legal-cyan rounded-full border border-legal-cyan/20">Sync to Calendar</span>
              </div>
              
              <div className="space-y-6">
                {timelineDates.map((item, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${item.status === 'upcoming' ? 'bg-legal-cyan border-legal-cyan shadow-[0_0_10px_rgba(0,229,255,0.5)]' : 'bg-transparent border-slate-600'}`} />
                      {i !== timelineDates.length - 1 && <div className="w-[1px] h-full bg-white/10 my-2" />}
                    </div>
                    <div className="pb-6">
                      <p className={`text-xs font-semibold mb-1 ${item.status === 'upcoming' ? 'text-legal-cyan' : 'text-slate-500'}`}>{item.date}</p>
                      <p className={`text-base ${item.status === 'upcoming' ? 'text-white font-medium' : 'text-slate-400'}`}>{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Uploaded Case Documents */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 md:p-8 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-bold flex items-center gap-2">
                  <FileText className="text-indigo-400" /> Case Documents
                </h3>
                <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Upload New</button>
              </div>

              <div className="space-y-3">
                {uploadedDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <FileText size={18} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white mb-0.5">{doc.name}</p>
                        <p className="text-xs text-slate-500">Uploaded {doc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-600 hidden md:inline-block">{doc.size}</span>
                      <button className="interactive w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
