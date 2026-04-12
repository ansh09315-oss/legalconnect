import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial } from '@react-three/drei';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

function ScalesOfJustice() {
  const mesh = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(t / 4) / 8 + (state.pointer.y * 0.1);
    mesh.current.rotation.y = Math.sin(t / 2) / 8 + (state.pointer.x * 0.2);
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={mesh} position={[0, 0, 0]} castShadow>
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

const FirmHome = () => {
  return (
    <>
      <Header />
      <main>
        
        {/* HERO SECTION */}
        <section style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00a2ff" />
              <Environment preset="city" />
              <ScalesOfJustice />
            </Canvas>
          </div>

          <motion.div 
            style={{ 
              position: 'relative', 
              zIndex: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              padding: '0 10vw',
              height: '100%'
            }}
          >
            <motion.p 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ color: 'var(--accent-gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px', fontFamily: 'Outfit' }}
            >
              Excellence in Legal Advocacy
            </motion.p>
            
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ fontSize: '5rem', lineHeight: '1.1', marginBottom: '30px', maxWidth: '800px', fontWeight: '800' }}
            >
              prexis<span className="gold-text">Legal</span> Firm.<br/>
              Your <span style={{ color: 'var(--accent-blue)', textShadow: '0 0 20px var(--accent-blue-glow)' }}>Advantage.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', marginBottom: '40px' }}
            >
              A premier consortium of advocate portfolios, delivering high-stakes litigation, arbitration, and comprehensive legal strategy across India.
            </motion.p>
          </motion.div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" style={{ padding: '100px 10vw', minHeight: '60vh', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
             <h2 style={{ fontSize: '3rem', marginBottom: '40px', textAlign: 'center' }}>
                About <span className="gold-text">prexisLegal</span>
             </h2>
             <div className="bento-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', lineHeight: '1.8' }}>
                  At <strong>prexisLegal</strong>, we believe that the foundation of justice is built upon uncompromising precision and powerful advocacy. We are a distinguished legal firm representing individuals, corporations, and institutions before the High Court of Judicature and higher appellate authorities.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
                   <div style={{ paddingLeft: '20px', borderLeft: '2px solid var(--accent-blue)' }}>
                     <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-blue)', marginBottom: '10px' }}>Our Mission</h3>
                     <p className="text-muted">To provide strategic, outcome-oriented legal solutions that safeguard our clients' interests in highly complex multi-jurisdictional matters.</p>
                   </div>
                   <div style={{ paddingLeft: '20px', borderLeft: '2px solid var(--accent-gold)' }}>
                     <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>Our Approach</h3>
                     <p className="text-muted">An integration of rigorous academic research, aggressive courtroom strategy, and deep empathy for the nuances of every individual case.</p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* CONNECT SECTION */}
        <section id="connect" style={{ padding: '100px 10vw' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '60px', textAlign: 'center' }}>
            Connect With <span style={{ color: 'var(--accent-blue)' }}>Us</span>
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            
            <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <h3 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>Firm Headquarters</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '500' }}>Office Location</h4>
                  <p className="text-muted text-sm">2nd Floor, Shri Ram Paras Tower Semra,<br/>Matiyari, Lucknow 226028</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(0, 162, 255, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                  <Phone size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '500' }}>Direct Phone</h4>
                  <a href="tel:7052099743" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>+91 7052099743</a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Mail size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '500' }}>Email Address</h4>
                  <a href="mailto:trivediadarsh13@gmail.com" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>trivediadarsh13@gmail.com</a>
                </div>
              </div>
            </div>

            <div className="bento-card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Send a Message</h3>
              <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '10px', color: 'white', fontFamily: 'Inter' }}
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '10px', color: 'white', fontFamily: 'Inter' }}
                />
                <textarea 
                  placeholder="Case Description..." 
                  rows={4}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '10px', color: 'white', fontFamily: 'Inter', resize: 'vertical' }}
                />
                <button className="blue-glow-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px' }}>
                  Submit Inquiry <Send size={18} />
                </button>
              </form>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default FirmHome;
