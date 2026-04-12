import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial } from '@react-three/drei';

function ScalesOfJustice() {
  const mesh = useRef();
  
  useFrame((state) => {
    // Make the object slightly react to mouse movement (Antigravity tilt)
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(t / 4) / 8 + (state.pointer.y * 0.1);
    mesh.current.rotation.y = Math.sin(t / 2) / 8 + (state.pointer.x * 0.2);
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={mesh} position={[0, 0, 0]} castShadow>
        {/* Placeholder abstract geometry combining a torus and a cylinder to look like Scales */}
        <torusGeometry args={[2, 0.4, 32, 64]} />
        <MeshTransmissionMaterial 
          backside 
          thickness={0.5} 
          roughness={0.05} 
          transmission={1} 
          ior={1.5} 
          chromaticAberration={0.05} 
          anisotropy={0.1}
          color="#00a2ff"
          attenuationDistance={2}
          attenuationColor="#ffffff"
        />
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 4, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>
      </mesh>
    </Float>
  );
}

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section id="home" style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* 3D Canvas Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00a2ff" />
          <Environment preset="city" />
          <ScalesOfJustice />
        </Canvas>
      </div>

      {/* Hero Content */}
      <motion.div 
        style={{ 
          position: 'relative', 
          zIndex: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '0 10vw',
          height: '100%',
          y: y1,
          opacity 
        }}
      >
        <motion.p 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ color: 'var(--accent-gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px', fontFamily: 'Outfit' }}
        >
          High Court of Judicature at Allahabad & Lucknow Bench
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ fontSize: '5rem', lineHeight: '1.1', marginBottom: '30px', maxWidth: '800px', fontWeight: '800' }}
        >
          Advocating with <span className="gold-text">Precision.</span><br/>
          Defending with <span style={{ color: 'var(--accent-blue)', textShadow: '0 0 20px var(--accent-blue-glow)' }}>Power.</span>
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{ display: 'flex', gap: '20px' }}
        >
          <button className="gold-glow-btn">Consultation</button>
          <button className="blue-glow-btn">Explore Cases</button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
