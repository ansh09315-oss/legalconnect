import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Environment } from '@react-three/drei';

function AbstractNode() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 1]} />
        <meshStandardMaterial 
          color="#00e5ff" 
          wireframe={true} 
          emissive="#00e5ff"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Inner solid core */}
      <mesh>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#050A14" roughness={0.1} metalness={0.8} />
      </mesh>
    </Float>
  );
}

const HeroSection = () => {
  const text = "LegalConnect";
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 50,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-legal-navy pt-20">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <AbstractNode />
          <Environment preset="city" />
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.1} minPolarAngle={Math.PI / 2 - 0.1} />
        </Canvas>
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-legal-navy/90 pointer-events-none" />
      </div>

      <div className="relative z-10 text-center flex flex-col items-center pointer-events-none">
        <motion.div
          className="flex overflow-hidden mb-4"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              variants={child}
              className="text-6xl md:text-8xl font-display font-bold text-white glow-text"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-legal-silver font-sans tracking-wide"
        >
          The New Dimension of Digital Law.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="mt-12 px-8 py-4 bg-legal-cyan/10 border border-legal-cyan/50 rounded-full text-legal-cyan font-semibold tracking-widest uppercase hover:bg-legal-cyan/20 transition-all pointer-events-auto backdrop-blur-md"
        >
          Explore Portal
        </motion.button>
      </div>
    </section>
  );
};

export default HeroSection;
