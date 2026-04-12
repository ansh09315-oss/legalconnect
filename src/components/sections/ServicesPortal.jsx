import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { Scale, Building2, Briefcase, User, Star, ArrowRight, ChevronLeft } from 'lucide-react';

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

const lawyers = [
  { id: 0, name: 'Adarsh Trivedi', spec: 'Criminal Law', rating: 4.9, exp: '12 yrs' },
  { id: 1, name: 'Priya Mehra', spec: 'Civil Disputes', rating: 4.8, exp: '9 yrs' },
  { id: 2, name: 'Rahul Singh', spec: 'Corporate Law', rating: 4.7, exp: '15 yrs' },
  { id: 3, name: 'Sneha Patel', spec: 'Labour Law', rating: 4.9, exp: '11 yrs' },
  { id: 4, name: 'Vikram Nair', spec: 'Criminal Law', rating: 4.6, exp: '8 yrs' },
  { id: 5, name: 'Ananya Rao', spec: 'Corporate Law', rating: 4.8, exp: '13 yrs' },
];

function LawyerOrb({ lawyer, index }) {
  const angle = (index / lawyers.length) * Math.PI * 2;
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
    <Float speed={1.5 + index * 0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[x, 0, z]}>
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

function LawyerGalaxy() {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  return (
    <group ref={groupRef}>
      {lawyers.map((lawyer, i) => (
        <LawyerOrb key={lawyer.id} lawyer={lawyer} index={i} />
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
      className="interactive flex-shrink-0 w-72 md:w-80 glass-card p-6 rounded-2xl cursor-pointer group"
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const xOffset = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

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
          <span className="text-legal-cyan text-sm font-semibold tracking-[0.3em] uppercase">Find an Advocate</span>
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
              style={{ x: xOffset }}
              className="flex gap-6 px-6 md:px-12 pb-4 hide-scrollbar overflow-x-auto"
            >
              {caseTypes.map((ct) => (
                <ServiceCard key={ct.id} caseType={ct} onClick={setSelectedCategory} />
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
                <div className="h-80 rounded-2xl overflow-hidden">
                  <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
                    <ambientLight intensity={0.4} />
                    <pointLight position={[0, 0, 0]} intensity={1} color="#00e5ff" />
                    <LawyerGalaxy />
                  </Canvas>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {lawyers.slice(0, 6).map((lawyer, i) => (
                    <motion.div
                      key={lawyer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="glass-card p-4 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-legal-cyan/30 to-indigo-500/30 border border-legal-cyan/20 flex items-center justify-center mb-2 text-sm font-bold text-legal-cyan">
                        {lawyer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p className="text-white text-sm font-semibold truncate">{lawyer.name}</p>
                      <p className="text-slate-400 text-xs">{lawyer.spec}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs text-slate-300">{lawyer.rating}</span>
                        <span className="text-xs text-slate-500 ml-1">{lawyer.exp}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesPortal;
