import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ShieldAlert, Gavel, Scale, FileText, Landmark, Home, Stethoscope } from 'lucide-react';

const practiceAreas = [
  { id: 1, title: 'Litigation & Dispute', icon: <Scale size={32} /> },
  { id: 2, title: 'Arbitration', icon: <Gavel size={32} /> },
  { id: 3, title: 'Criminal Matters', icon: <ShieldAlert size={32} /> },
  { id: 4, title: 'Civil Matters', icon: <Briefcase size={32} /> },
  { id: 5, title: 'Service Matters', icon: <FileText size={32} /> },
  { id: 6, title: 'DRT', icon: <Landmark size={32} /> },
  { id: 7, title: 'RERA', icon: <Home size={32} /> },
  { id: 8, title: 'Medical Negligence', icon: <Stethoscope size={32} /> },
];

const PracticeAreas = () => {
  return (
    <section id="interaction" style={{ padding: '100px 10vw', position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>
          Practice <span className="gold-text">Areas</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '60px' }}>
          Advocate Adarsh Trivedi provides comprehensive legal representation across multiple jurisdictions, specializing in high-stakes litigation and arbitration.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {practiceAreas.map((area, index) => (
            <motion.div
              key={area.id}
              className="glass-panel"
              style={{
                padding: '40px 30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                cursor: 'pointer',
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                rotateX: 10,
                rotateY: -10,
                y: -10,
                boxShadow: '0 20px 40px rgba(0, 162, 255, 0.2)',
                borderColor: 'rgba(0, 162, 255, 0.4)'
              }}
            >
              <div style={{ color: 'var(--accent-gold)' }}>
                {area.icon}
              </div>
              <h3 style={{ fontSize: '1.4rem' }}>{area.title}</h3>
              <div style={{ width: '40px', height: '2px', background: 'var(--accent-blue)', marginTop: 'auto' }}></div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default PracticeAreas;
