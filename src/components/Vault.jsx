import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls, ContactShadows } from '@react-three/drei';

function BusinessCard() {
  const mesh = useRef();

  return (
    <Float rotationIntensity={0.5} floatIntensity={1} speed={2}>
      <mesh ref={mesh} castShadow receiveShadow>
        <boxGeometry args={[3.5, 2, 0.05]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.4} />
        {/* Placeholder for actual texture map (logo, name) */}
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[3, 1.5]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.1} />
      </mesh>
    </Float>
  );
}

const Vault = () => {
  return (
    <section id="profile" style={{ padding: '100px 10vw', position: 'relative' }}>
      
      {/* Collaboration Portals (Dual CTA) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginBottom: '120px' }}>
        <motion.div 
          className="glass-panel"
          style={{ flex: '1 1 400px', padding: '60px 40px', textAlign: 'center', borderTop: '2px solid var(--accent-gold)' }}
          whileHover={{ y: -10 }}
        >
          <h3 style={{ fontSize: '2rem', marginBottom: '20px' }}>Client Consultation</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Engage directly with our intake team for an initial case assessment.</p>
          <button className="gold-glow-btn">Initiate Intake</button>
        </motion.div>

        <motion.div 
          className="glass-panel"
          style={{ flex: '1 1 400px', padding: '60px 40px', textAlign: 'center', borderTop: '2px solid var(--accent-blue)' }}
          whileHover={{ y: -10 }}
        >
          <h3 style={{ fontSize: '2rem', marginBottom: '20px' }}>Legal Network Portal</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Secure channel for inter-lawyer and inter-firm connectivity and document sharing.</p>
          <button className="blue-glow-btn">Access Network</button>
        </motion.div>
      </div>


      {/* Interactive Case Vault */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 style={{ fontSize: '3rem', marginBottom: '20px', textAlign: 'center' }}>
          The <span className="gold-text">Vault</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 60px', textAlign: 'center' }}>
          Explore the prexisLegal interactive gallery. Drag to rotate the elements.
        </p>

        <div className="glass-panel" style={{ height: '60vh', width: '100%', position: 'relative', overflow: 'hidden' }}>
          <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <Environment preset="city" />
            
            <PresentationControls 
              global 
              config={{ mass: 2, tension: 500 }} 
              snap={{ mass: 4, tension: 1500 }} 
              rotation={[0, 0.3, 0]} 
              polar={[-Math.PI / 3, Math.PI / 3]} 
              azimuth={[-Math.PI / 1.4, Math.PI / 2]}
            >
              <BusinessCard />
            </PresentationControls>

            <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2} far={4} />
          </Canvas>
          
          <div style={{ position: 'absolute', bottom: '20px', left: '0', width: '100%', textAlign: 'center', color: 'var(--text-secondary)', pointerEvents: 'none', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem' }}>
            Interactive 3D Render
          </div>
        </div>

      </motion.div>
    </section>
  );
};

export default Vault;
