import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { MessageCircle, Clock, Wallet, Handshake, ArrowRight, X, Mic } from 'lucide-react';

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
        {/* Main chat bubble */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.4, 32, 32]} />
          <meshStandardMaterial color="#00e5ff" emissive="#007080" emissiveIntensity={0.6} roughness={0.2} metalness={0.8} transparent opacity={0.9} />
        </mesh>
        {/* Pulsing ring */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[1.8, 0.05, 16, 100]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1} transparent opacity={0.4} />
        </mesh>
        {/* Mic icon proxy (small cylinder) */}
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

const ConsultModal = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.8, y: 40 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="glass-panel p-8 rounded-3xl max-w-md w-full mx-4 border border-legal-cyan/20"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-legal-cyan/10 border border-legal-cyan/30 flex items-center justify-center">
            <Mic size={20} className="text-legal-cyan" />
          </div>
          <div>
            <h3 className="text-white font-display font-bold text-lg">AdvoTalk</h3>
            <p className="text-slate-400 text-xs">Start Consultation</p>
          </div>
        </div>
        <button onClick={onClose} className="interactive w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
          <X size={16} className="text-slate-400" />
        </button>
      </div>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        Choose a convenient slot with a verified advocate. Video, voice, or text consultations available.
      </p>
      <div className="space-y-3 mb-6">
        {['Today, 3:00 PM — Advocate: Priya Mehra', 'Today, 5:30 PM — Advocate: Rahul Singh', 'Tomorrow, 10:00 AM — Advocate: Adarsh Trivedi'].map((slot, i) => (
          <motion.button
            key={i}
            whileHover={{ x: 4 }}
            className="interactive w-full text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:border-legal-cyan/40 hover:bg-legal-cyan/5 transition-all"
          >
            {slot}
          </motion.button>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="interactive w-full py-3 rounded-xl font-semibold text-legal-navy text-sm"
        style={{ background: 'linear-gradient(135deg, #00e5ff, #0094aa)' }}
      >
        Confirm Slot
      </motion.button>
    </motion.div>
  </motion.div>
);

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
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-legal-cyan animate-pulse" />
                  <span className="text-legal-cyan text-xs font-semibold">Live Now</span>
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
