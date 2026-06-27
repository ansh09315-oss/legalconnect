import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Clock, Wallet, Handshake, ArrowRight, X, Mic, Send, CheckCircle2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


const features = [
  { icon: Handshake, label: 'Expert Consultation', color: '#00e5ff' },
  { icon: Clock, label: 'Flexible Time Slots', color: '#818cf8' },
  { icon: Wallet, label: 'Transparent Pricing', color: '#34d399' },
];

const SECTORS = [
  "Corporate Law", "Criminal Defense", "Family & Divorce", 
  "Property & Real Estate", "Cyber Law", "General Consultation"
];

const mockSlots = [
  { time: 'Today, 3:00 PM', name: 'Adarsh Trivedi', email: 'trivediadarsh13@gmail.com' },
  { time: 'Today, 5:30 PM', name: 'Pallavi Singh', email: 'thakurpallavi33@gmail.com' },
  { time: 'Tomorrow, 10:00 AM', name: 'Pinki Devi', email: 'support@legalconnect.com' },
  { time: 'Tomorrow, 2:00 PM', name: 'Anshika Singh', email: 't0289245@gmail.com' },
];

const ConsultModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSector, setSelectedSector] = useState(SECTORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const handleSlotSelect = (slot) => {
    if (isAuthenticated && user) {
      setSelectedSlot(slot);
      setStep(2);
    } else {
      sessionStorage.setItem('authIntent', 'advotalk');
      navigate('/login?redirect=advotalk');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Retrieve authenticated client data
    const clientDataStr = localStorage.getItem('clientAccount');
    let clientData = null;
    if (clientDataStr) {
      clientData = JSON.parse(clientDataStr);
    }
    
    const clientName = clientData?.name || 'Anonymous Client';
    const clientPhone = clientData?.phone || '0000000000';
    
    const formData = new FormData(e.target);
    const clientMessage = formData.get('message');

    // Email to lawyer via Web3Forms
    const emailFormData = new FormData();
    emailFormData.append("access_key", "60958c5b-9e33-4168-8cd8-4b276f2203f5");
    emailFormData.append("subject", `New ${selectedSector} Consultation for ${selectedSlot.name}`);
    emailFormData.append("to_email", selectedSlot.email || "support@legalconnect.com");
    emailFormData.append("Target Advocate Email", selectedSlot.email || "support@legalconnect.com");
    emailFormData.append("Client Name", clientName);
    emailFormData.append("Client Phone", clientPhone);
    emailFormData.append("Sector", selectedSector);
    emailFormData.append("Message", clientMessage);

    try {
      await fetch("https://api.web3forms.com/submit", { method: "POST", body: emailFormData });
      
      const newCaseId = `LC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newCase = {
         case_id: newCaseId,
         sector: selectedSector,
         status: 'active',
         name: selectedSlot.name,
         spec: selectedSector,
         email: selectedSlot.email,
         court: 'Consultation Services',
         phone: 'Contact via Secure Chat'
      };

      if (clientData) {
        if (!clientData.cases) clientData.cases = [];
        clientData.cases.push(newCase);
        localStorage.setItem('clientAccount', JSON.stringify(clientData));
        
        try {
          // Sync new case to MongoDB via sync-cases endpoint
          await axios.post('/.netlify/functions/api/auth/sync-cases', {
            phone: clientData.phone,
            newCase
          });
        } catch (dbErr) {
          console.warn("MongoDB sync fallback (dev mode): ", dbErr.message);
        }
      }
      
      setStep(3); // Go to Payment phase
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      onClose();
      navigate('/client-dashboard');
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md overflow-y-auto pt-10 pb-10"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-panel p-5 md:p-8 rounded-3xl max-w-lg w-full mx-4 border border-legal-cyan/20 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-legal-cyan/30 flex items-center justify-center overflow-hidden">
              <img src="/advotalk-logo.webp" alt="AdvoTalk Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-white font-display font-bold text-lg">AdvoTalk</h3>
              <p className="text-slate-400 text-xs">
                {step === 1 && 'Choose a Slot'}
                {step === 2 && 'Query Details'}
                {step === 3 && 'Finalize Hire'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="interactive w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Choose a convenient slot with a verified advocate.
              </p>
              <div className="space-y-3 mb-6">
                {mockSlots.map((slot, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 4 }}
                    onClick={() => handleSlotSelect(slot)}
                    className="interactive w-full flex items-center justify-between text-left px-5 py-4 rounded-xl bg-white/5 border border-white/10 group hover:border-legal-cyan/40 hover:bg-legal-cyan/5 transition-all"
                  >
                    <div>
                      <p className="text-white font-semibold text-sm mb-1">{slot.time}</p>
                      <p className="text-slate-400 text-xs text-legal-cyan">Advocate: {slot.name}</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-500 group-hover:text-legal-cyan transition-colors" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.form key="step2" onSubmit={handleSubmit} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="bg-legal-cyan/5 p-4 rounded-xl border border-legal-cyan/20 mb-6">
                <p className="text-[10px] text-legal-cyan uppercase tracking-widest mb-1">Hiring Consultation For</p>
                <p className="text-white text-sm font-bold">{selectedSlot?.name || 'Selected Advocate'}</p>
                <p className="text-slate-400 text-xs mt-1">Client data will be pulled securely from your account.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Case Sector</label>
                  <select 
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-legal-cyan/50 outline-none transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300e5ff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                  >
                    {SECTORS.map(sec => <option key={sec} value={sec} style={{background: '#050A14'}}>{sec}</option>)}
                  </select>
                </div>

                <textarea name="message" placeholder="Brief Case Description & Query..." rows="4" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-legal-cyan/50 outline-none transition-all resize-none"></textarea>
              </div>

              <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="interactive w-full py-4 rounded-xl font-bold text-legal-navy flex items-center justify-center gap-2 mt-4" style={{ background: 'linear-gradient(135deg, #00e5ff 0%, #0094aa 100%)' }}>
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-legal-navy border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} /> Send Query to Advocate
                  </>
                )}
              </motion.button>
              
              {!selectedSlot?.time?.includes('Priority') && (
                <button type="button" onClick={() => setStep(1)} className="interactive w-full text-slate-500 text-xs hover:text-white transition-colors py-2">
                  Back to slots
                </button>
              )}
            </motion.form>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={30} className="text-emerald-400" />
              </div>
              <h4 className="text-2xl font-display font-bold text-white mb-2">Query Received!</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Your details have been securely sent to <strong>{selectedSlot?.name}</strong>. To complete the hiring process and access your Client Dashboard, please proceed with the consultation payment.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8 text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-300 text-sm">Consultation Fee</span>
                  <span className="text-white font-bold">₹0</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 border-t border-white/5 pt-3">
                  <span>Showcase Mode</span>
                  <span>Free</span>
                </div>
              </div>

              <motion.button
                onClick={handlePayment}
                disabled={paymentProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="interactive w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                style={{ background: paymentProcessing ? '#2dd4bf' : 'linear-gradient(135deg, #818cf8, #4f46e5)', color: 'white' }}
              >
                {paymentProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Secure Payment...
                  </>
                ) : (
                  <>
                    <Lock size={18} /> Book Session (₹0)
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

const AdvoTalkCTA = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleConsultClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <section id="advotalk" className="py-24 bg-legal-navy">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* 3D Side */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="h-80 md:h-96 rounded-3xl overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-radial from-legal-cyan/5 to-transparent rounded-3xl" />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <img src="/advotalk-logo.webp" alt="AdvoTalk Illustration" className="w-full h-full object-contain drop-shadow-2xl opacity-90 hover:scale-105 transition-transform duration-500" />
              </div>
              {/* Floating label */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-legal-cyan/10 border border-legal-cyan/30 px-4 py-2 rounded-full backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <img src="/advotalk-logo.webp" alt="Advocate Profile" className="w-8 h-8 rounded-full border border-legal-cyan/50 object-cover" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-legal-cyan animate-pulse border-2 border-legal-navy" />
                  </div>
                  <span className="text-legal-cyan text-sm font-semibold">Live Now</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-legal-cyan text-sm font-semibold tracking-[0.3em] uppercase">Service 2</span>
              <div className="flex items-center gap-4 mt-2 mb-4">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-legal-cyan/50">
                  <img src="/advotalk-logo.webp" alt="AdvoTalk Logo" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
                  AdvoTalk
                </h2>
              </div>
              <p className="text-slate-400 leading-relaxed mb-8">
                Connect one-on-one with expert legal advocates through live video, voice, or secure text consultations. Transparent pricing, zero bureaucracy.
              </p>

              <div className="space-y-4 mb-10">
                {features.map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="flex items-center gap-4"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${feature.color}1A`, border: `1px solid ${feature.color}33` }}
                      >
                        <Icon size={18} style={{ color: feature.color }} />
                      </div>
                      <span className="text-slate-300 font-medium">{feature.label}</span>
                    </motion.div>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConsultClick}
                className="interactive flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-legal-navy"
                style={{ background: 'linear-gradient(135deg, #00e5ff 0%, #0094aa 100%)' }}
              >
                <MessageCircle size={20} />
                Consult Now
                <ArrowRight size={18} className="ml-1" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showModal && <ConsultModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
};

export default AdvoTalkCTA;
