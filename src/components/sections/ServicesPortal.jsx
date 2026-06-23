import React, { useRef, useState } from 'react';
import axios from 'axios';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { Scale, Building2, Briefcase, User, Star, ArrowRight, ChevronLeft, X, Mail, Phone, MapPin, Award, CheckCircle2, Lock, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const caseTypes = [
  {
    id: 0,
    icon: Scale,
    title: 'Criminal Law',
    description: 'Bail, trials, FIRs, and criminal defense handled by top advocates.',
    count: '1.2k+ cases',
    color: '#00e5ff',
  },
  {
    id: 1,
    icon: User,
    title: 'Civil Disputes',
    description: 'Property, family, and civil suits resolved by specialized attorneys.',
    count: '890+ cases',
    color: '#818cf8',
  },
  {
    id: 2,
    icon: Building2,
    title: 'Corporate Law',
    description: 'Business formations, mergers, compliance, and IP protection.',
    count: '2.1k+ cases',
    color: '#34d399',
  },
  {
    id: 3,
    icon: Briefcase,
    title: 'Labour Law',
    description: 'Employment disputes, wrongful termination, and HR compliance.',
    count: '560+ cases',
    color: '#f59e0b',
  },
];

// Lawyers are now fetched dynamically from the mockDatabase.

const LawyerProfileModal = ({ lawyer, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  if (!lawyer) return null;

  const handleHireClick = () => {
    if (isAuthenticated && user) {
      setStep('form');
    } else {
      sessionStorage.setItem('authIntent', 'services');
      navigate('/login?redirect=services');
    }
  };

  const handleSubmitCase = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const clientDataStr = localStorage.getItem('clientAccount');
    let clientData = null;
    if (clientDataStr) {
      clientData = JSON.parse(clientDataStr);
    }
    
    const clientName = clientData?.name || 'Anonymous Client';
    const clientPhone = clientData?.phone || '0000000000';
    const clientEmail = clientData?.email || 'test@example.com';
    
    const formData = new FormData(e.target);
    const caseDetails = formData.get('caseDetails');

    try {
      // 1. Send direct-to-lawyer email via Netlify Edge Function
      await fetch('/api/contact-lawyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
          caseDetails: caseDetails,
          lawyerEmail: lawyer.email || 'support@legalconnect.com',
          lawyerName: lawyer.name
        })
      });
      
      // 2. Save case details to Supabase (Mocking lawyer_id and client_id since we don't have full auth yet)
      const { supabase } = await import('../../lib/supabaseClient');
      try {
        await supabase.from('cases').insert([{
          lawyer_id: lawyer.id,
          client_name: clientName,
          client_phone: clientPhone,
          status: 'pending'
        }]);
      } catch (dbErr) {
        console.error("Supabase write failed:", dbErr);
      }

      const newCaseId = `LC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newCase = {
         case_id: newCaseId,
         sector: lawyer.spec || 'General Consultation',
         status: 'active',
         name: lawyer.name,
         spec: lawyer.spec,
         email: lawyer.email,
         court: lawyer.court,
         phone: lawyer.phone
      };

      if (clientData) {
        if (!clientData.cases) clientData.cases = [];
        clientData.cases.push(newCase);
        localStorage.setItem('clientAccount', JSON.stringify(clientData));
        
        // Sync new case to MongoDB backend
        try {
          await axios.post('/.netlify/functions/api/auth/sync-cases', {
            phone: clientData.phone,
            newCase
          });
        } catch (syncErr) {
          console.warn('Could not sync case to DB (dev mode):', syncErr.message);
        }
      }
      setStep('payment');
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto pt-10 pb-10"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-legal-cyan/20 my-auto custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-32 bg-gradient-to-r from-legal-navy to-legal-cyan/20">
          <button onClick={onClose} className="absolute top-4 right-4 interactive w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40">
            <X size={18} className="text-white" />
          </button>
        </div>
        
        <div className="px-8 pb-8 -mt-12">
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-legal-cyan to-indigo-500 border-4 border-legal-navy flex items-center justify-center text-3xl font-bold text-legal-navy shadow-2xl shadow-legal-cyan/20">
              {lawyer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-display font-bold text-white mb-1">{lawyer.name}</h3>
              <p className="text-legal-cyan font-medium">{lawyer.spec}</p>
            </div>
            <div className="flex items-center gap-2 bg-legal-cyan/10 px-4 py-2 rounded-xl border border-legal-cyan/30">
              <Star className="text-amber-400 fill-amber-400" size={18} />
              <span className="text-white font-bold">{lawyer.rating}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Professional Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-slate-300">
                          <Award size={18} className="text-legal-cyan shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">{lawyer.court}</p>
                            {lawyer.barNo && <p className="text-xs text-slate-500">Bar No: {lawyer.barNo}</p>}
                            {lawyer.aorNo && <p className="text-xs text-slate-500">AOR No: {lawyer.aorNo}</p>}
                            {lawyer.chamber && <p className="text-xs text-slate-500">Chamber: {lawyer.chamber}</p>}
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-slate-300 text-sm">
                          <MapPin size={18} className="text-legal-cyan shrink-0" />
                          <span>{lawyer.address}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Practice Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {(lawyer.areas || []).map(area => (
                          <span key={area} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact Information</h4>
                      <div className="space-y-3">
                        {lawyer.email && (
                          <div className="flex items-center gap-3 text-slate-300 text-sm">
                            <Mail size={18} className="text-legal-cyan" />
                            <span>{lawyer.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-slate-300 text-sm">
                          <Phone size={18} className="text-legal-cyan" />
                          <span>{lawyer.phone}</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="interactive w-full py-4 rounded-2xl font-bold text-legal-navy shadow-lg shadow-legal-cyan/20"
                      style={{ background: 'linear-gradient(135deg, #00e5ff 0%, #0094aa 100%)' }}
                      onClick={handleHireClick}
                    >
                      Hire Advocate Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'form' && (
              <motion.form key="form" onSubmit={handleSubmitCase} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h4 className="text-lg font-bold text-white mb-4">Case Submission</h4>
                <p className="text-slate-400 text-sm mb-6">Provide details for {lawyer.name} to officially take up your case.</p>
                
                <div className="space-y-4">
                  <textarea name="caseDetails" placeholder="Detailed Case Brief..." rows="4" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-legal-cyan/50 outline-none transition-all resize-none"></textarea>
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setStep('profile')} className="interactive flex-1 py-4 rounded-xl font-bold text-slate-400 bg-white/5 hover:bg-white/10 transition-colors">
                    Back
                  </button>
                  <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="interactive flex-[2] py-4 rounded-xl font-bold text-legal-navy flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #00e5ff 0%, #0094aa 100%)' }}>
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-legal-navy border-t-transparent rounded-full animate-spin" /> : <><Send size={18} /> Submit Case Files</>}
                  </motion.button>
                </div>
              </motion.form>
            )}

            {step === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={30} className="text-emerald-400" />
                </div>
                <h4 className="text-2xl font-display font-bold text-white mb-2">Case Accepted!</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Your case details have been securely sent. To officially retainer {lawyer.name} and unlock your Case Dashboard, complete the hiring action below.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-300 text-sm">Hiring Retainer / Token</span>
                    <span className="text-white font-bold">₹0</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 border-t border-white/5 pt-3">
                    <span>Showcase Idea Only</span>
                    <span>Free Demo</span>
                  </div>
                </div>

                <motion.button
                  onClick={handlePayment}
                  disabled={paymentProcessing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="interactive w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{ background: paymentProcessing ? '#2dd4bf' : 'linear-gradient(135deg, #00e5ff, #0094aa)', color: 'white' }}
                >
                  {paymentProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Finalizing Hire...
                    </>
                  ) : (
                    <>
                      <Lock size={18} /> Complete Hire (₹0)
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

function LawyerOrb({ lawyer, index, total, onClick }) {
  const angle = (index / (total || 1)) * Math.PI * 2;
  const radius = 3;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime + index) * 0.2;
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[x, 0, z]} onClick={onClick}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00a0b0"
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function LawyerGalaxy({ onSelect, lawyersList }) {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  return (
    <group ref={groupRef}>
      {lawyersList.map((lawyer, i) => (
        <LawyerOrb key={lawyer.id} lawyer={lawyer} index={i} total={lawyersList.length} onClick={() => onSelect(lawyer)} />
      ))}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#050A14" emissive="#00e5ff" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

const ServiceCard = ({ caseType, onClick }) => {
  const Icon = caseType.icon;
  return (
    <motion.div
      onClick={() => onClick(caseType)}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="interactive flex-shrink-0 w-full glass-card p-6 rounded-2xl cursor-pointer group"
      style={{
        boxShadow: `0 0 0 0 ${caseType.color}33`,
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 0 25px 5px ${caseType.color}33`,
        borderColor: caseType.color,
      }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${caseType.color}1A`, border: `1px solid ${caseType.color}33` }}
      >
        <Icon size={28} style={{ color: caseType.color }} />
      </div>
      <h3 className="text-xl font-display font-semibold text-white mb-2">{caseType.title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-4">{caseType.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: `${caseType.color}1A`, color: caseType.color }}>
          {caseType.count}
        </span>
        <ArrowRight size={18} style={{ color: caseType.color }} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
};

const ServicesPortal = () => {
  const sectionRef = useRef();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [lawyersList, setLawyersList] = useState([]);
  
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const xOffset = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

  // Allow browsing categories without login
  const handleCategoryClick = (caseType) => {
    setSelectedCategory(caseType);
  };

  React.useEffect(() => {
    const fetchLawyers = async () => {
      const { data } = await supabase
        .from('lawyers')
        .select('*')
        .eq('status', 'approved');
      if (data) setLawyersList(data);
    };
    fetchLawyers();
  }, [selectedCategory]); // Refetch when a user opens a category to see latest approved lawyers

  return (
    <section ref={sectionRef} id="services" className="py-24 bg-legal-navy overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-legal-cyan text-sm font-semibold tracking-[0.3em] uppercase"><strong>Hire an Advocate</strong></span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mt-2">
            Legal Portal
          </h2>
          <p className="text-slate-400 mt-3 max-w-lg">
            Select your case type and connect with top-rated advocates in seconds.
          </p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 md:px-12 pb-4 w-full"
            >
              {caseTypes.map((ct) => (
                <ServiceCard key={ct.id} caseType={ct} onClick={handleCategoryClick} />
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="galaxy"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="px-6"
          >
            <div className="max-w-7xl mx-auto">
              <button
                onClick={() => setSelectedCategory(null)}
                className="interactive flex items-center gap-2 text-legal-cyan text-sm mb-8 hover:opacity-80 transition-opacity"
              >
                <ChevronLeft size={16} /> Back to Categories
              </button>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="h-80 md:h-[400px] rounded-2xl overflow-hidden relative group">
                  <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
                    <ambientLight intensity={0.4} />
                    <pointLight position={[0, 0, 0]} intensity={1} color="#00e5ff" />
                    <LawyerGalaxy onSelect={setSelectedLawyer} lawyersList={lawyersList} />
                  </Canvas>
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-slate-400 uppercase tracking-widest pointer-events-none">
                    Select an orb to view profile
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lawyersList.map((lawyer, i) => (
                    <motion.div
                      key={lawyer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="interactive glass-card p-4 rounded-xl cursor-pointer group hover:border-legal-cyan/40"
                      onClick={() => setSelectedLawyer(lawyer)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-legal-cyan/30 to-indigo-500/30 border border-legal-cyan/20 flex items-center justify-center mb-2 text-sm font-bold text-legal-cyan group-hover:scale-110 transition-transform">
                        {lawyer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p className="text-white text-sm font-semibold truncate uppercase">{lawyer.name}</p>
                      <p className="text-legal-cyan text-[10px] font-medium truncate mb-2">{lawyer.spec}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs text-slate-300">{lawyer.rating}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedLawyer && (
          <LawyerProfileModal 
            lawyer={selectedLawyer} 
            onClose={() => setSelectedLawyer(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesPortal;
