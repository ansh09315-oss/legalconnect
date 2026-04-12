import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

const articles = [
  { id: 1, type: 'Report', title: 'Landmark ruling on Real Estate Regulatory Authority (RERA)' },
  { id: 2, type: 'Article', title: 'Navigating Medical Negligence in Modern Healthcare' },
  { id: 3, type: 'Report', title: 'High Court Arbitration Decisions 2025' },
  { id: 4, type: 'Article', title: 'The Future of Debt Recovery Tribunals (DRT)' },
];

const KnowledgeHub = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const neonHeight = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section ref={containerRef} id="about" style={{ padding: '100px 10vw', position: 'relative', minHeight: '150vh' }}>
      
      {/* Scroll Spy Neon Bar */}
      <div style={{ position: 'absolute', left: '5vw', top: '20vh', bottom: '20vh', width: '2px', background: 'rgba(255,255,255,0.1)' }}>
        <motion.div 
          style={{ 
            width: '100%', 
            height: useTransform(neonHeight, value => `${value * 100}%`),
            background: 'var(--accent-blue)',
            boxShadow: '0 0 15px var(--accent-blue), 0 0 30px var(--accent-blue)'
          }} 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>
          Knowledge <span className="gold-text">Hub</span>
        </h2>
        
        {/* 3D Stack Carousel Simulation */}
        <div style={{ marginTop: '80px', position: 'relative', height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {articles.map((item, index) => {
            const yOffset = index * 40;
            const scaleOffset = 1 - (index * 0.05);
            const opacityOffset = 1 - (index * 0.2);

            return (
              <motion.div
                key={item.id}
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: yOffset,
                  width: '100%',
                  maxWidth: '800px',
                  padding: '40px',
                  scale: scaleOffset,
                  opacity: opacityOffset,
                  zIndex: 10 - index,
                  transformOrigin: 'top center'
                }}
                whileHover={{
                  y: yOffset - 20,
                  scale: scaleOffset * 1.02,
                  zIndex: 20,
                  backgroundColor: 'var(--bg-surface)' // ensure it's solid over others on hover
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <span style={{ 
                    padding: '5px 12px', 
                    borderRadius: '20px', 
                    border: '1px solid',
                    borderColor: item.type === 'Report' ? 'var(--accent-gold)' : 'var(--accent-blue)',
                    color: item.type === 'Report' ? 'var(--accent-gold)' : 'var(--accent-blue)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}>
                    {item.type}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>2025</span>
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '500' }}>{item.title}</h3>
                
                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid var(--accent-blue)', paddingBottom: '3px' }}>
                    Access Document
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  );
};

export default KnowledgeHub;
