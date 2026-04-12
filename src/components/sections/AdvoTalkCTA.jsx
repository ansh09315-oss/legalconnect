import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { MessageCircle, Clock, Wallet, Handshake, ArrowRight, X, Mic, Send, CheckCircle2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ConsultBubble() {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });
  return (
    <Float speed={2} floatIntensity={1.5}>
      <group ref={groupRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.4, 32, 32]} />
          <meshStandardMaterial color="#00e5ff" emissive="#007080" emissiveIntensity={0.6} roughness={0.2} metalness={0.8} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[1.8, 0.05, 16, 100]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1} transparent opacity={0.4} />
        </mesh>
        <mesh position={[0, 0, 1.5]}>
          <cylinderGeometry args={[0.1, 0.13, 0.4, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </Float>
  );
}

const features = [
  { icon: Handshake, label: 'Expert Consultation', color: '#00e5ff' },
  { icon: Clock, label: 'Flexible Time Slots', color: '#818cf8' },
  { icon: Wallet, label: 'Transparent Pricing', color: '#34d399' },
];

const mockSlots = [
  { time: 'Today, 3:00 PM', name: 'Adarsh Trivedi', email: 'trivediadarsh13@gmail.com' },
  { time: 'Today, 5:30 PM', name: 'Pallavi Singh', email: 'thakurpallavi33@gmail.com' },
  { time: 'Tomorrow, 10:00 AM', name: 'Pinki Devi', email: 'support@legalconnect.com' },
  { time: 'Tomorrow, 2:00 PM', name: 'Anshika Singh', email: 't0289245@gmail.com' },
];

const ConsultModal = ({ onClose }) => {
  const navigate = useNavigate();
  // Step 1: Select slot, Step 2: Form, Step 3: Payment
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target);
    const clientName = formData.get('name');
    const clientPhone = formData.get('phone');

    formData.append("access_key", "60958c5b-9e33-4168-8cd8-4b276f2203f5");
    formData.append("subject", `New Consultation Request for ${selectedSlot.name}`);
    formData.append("to_email", selectedSlot.email || "support@legalconnect.com");
    // Explicitly add target contact since some free plans mask raw headers
    formData.append("Target Advocate Email", selectedSlot.email || "support@legalconnect.com");

    try {
      // Execute live submission
      await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
      
      const hiredLawyerData = {
         name: selectedSlot.name,
         spec: 'Target Consultant',
         email: selectedSlot.email,
         court: 'Consultation Services'
      };

      try {
        await axios.post('https://legalconnect-api-amkh.onrender.com/api/auth/register', {
          name: clientName,
          phone: clientPhone,
          hiredLawyer: hiredLawyerData
        });
      } catch (dbErr) {
        console.error("SQLite fallback error: ", dbErr);
      }

      // Save details simulating backend registration for Consultant users
      localStorage.setItem('clientAccount', JSON.stringify({
        name: clientName,
        phone: clientPhone,
        hiredLawyer: hiredLawyerData
      }));
      
      setStep(3); // Go to Payment phase
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = () => {
    setPaymentProcessing(true);
    // Simulate successful payment routing to client dashboard
    setTimeout(() => {
      onClose();
      // Ensure local active state engages immediately
      localStorage.setItem('isAuthenticated', 'true');
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
        className="glass-panel p-8 rounded-3xl max-w-lg w-full mx-4 border border-legal-cyan/20 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-legal-cyan/10 border border-legal-cyan/30 flex items-center justify-center">
              <Mic size={20} className="text-legal-cyan" />
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
                    onClick={() => { setSelectedSlot(slot); setStep(2); }}
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
                <p className="text-slate-400 text-xs mt-1">Priority Intake</p>
              </div>

              <div className="space-y-3">
                <input type="text" name="name" placeholder="Your Full Name" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-legal-cyan/50 outline-none transition-all" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="email" name="email" placeholder="Email Address" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-legal-cyan/50 outline-none transition-all" />
                  <input type="tel" name="phone" placeholder="Phone Number" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-legal-cyan/50 outline-none transition-all" />
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
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[3, 3, 3]} intensity={1.5} color="#00e5ff" />
                <pointLight position={[-3, -3, -3]} intensity={0.5} color="#818cf8" />
                <ConsultBubble />
              </Canvas>
              {/* Floating label */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-legal-cyan/10 border border-legal-cyan/30 px-4 py-2 rounded-full backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <img src="/advocate-live.png" alt="Advocate Profile" className="w-8 h-8 rounded-full border border-legal-cyan/50 object-cover" />
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
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mt-2 mb-4">
                AdvoTalk
              </h2>
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
                onClick={() => setShowModal(true)}
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
