import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PresentationControls, Float } from '@react-three/drei';
import { ChevronRight, ChevronLeft } from 'lucide-react';

function Header3DScene() {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[5, 5, 5]} angle={0.2} penumbra={1} intensity={1} castShadow />
      <Environment preset="city" />
      
      <PresentationControls global rotation={[0, -0.2, 0]} polar={[-0.1, 0.2]} azimuth={[-0.5, 0.5]}>
        <Float rotationIntensity={0.5} floatIntensity={1} speed={2}>
          <group position={[0, -0.5, 0]}>
            {/* Pedestal */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[3, 0.2, 3]} />
              <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <boxGeometry args={[3.2, 0.1, 3.2]} />
              <meshStandardMaterial color="#444" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Abstract Scales of Justice Crystal */}
            <mesh position={[0, 1.2, 0]}>
              <octahedronGeometry args={[1, 0]} />
              <meshPhysicalMaterial 
                color="#ffffff" 
                transmission={1} 
                opacity={1} 
                roughness={0.1} 
                ior={1.5} 
                thickness={0.5} 
              />
            </mesh>
            
            {/* Small floating gems */}
            <mesh position={[-2, 1, 1]}>
              <icosahedronGeometry args={[0.3, 0]} />
              <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.1} ior={1.5} />
            </mesh>
            <mesh position={[2, 1.5, -1]}>
              <icosahedronGeometry args={[0.2, 0]} />
              <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.1} ior={1.5} />
            </mesh>
          </group>
        </Float>
      </PresentationControls>
    </Canvas>
  );
}

const MainContent = () => {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Top Section: 3D Header & Profile Card */}
      <div style={{ position: 'relative', height: '400px', borderRadius: '20px', overflow: 'hidden', background: 'radial-gradient(circle at center, #1a1c24 0%, #0a0a0c 100%)', border: '1px solid var(--glass-border)' }}>
        
        {/* 3D Scene */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%' }}>
           <Header3DScene />
        </div>

        {/* Profile Card Overlay */}
        <div className="bento-card" style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          padding: '20px', 
          width: 'calc(100% - 40px)', 
          maxWidth: '450px',
          background: 'rgba(30, 32, 40, 0.8)'
        }}>
           <div style={{ flex: 1 }}>
             <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Adarsh Trivedi</h3>
             <div className="text-muted text-xs" style={{ marginBottom: '10px' }}>Large Text</div>
             
             <h4 style={{ fontSize: '1rem', fontWeight: '500' }}>Advocate</h4>
             <div className="text-muted text-xs" style={{ marginBottom: '10px' }}>Subtitle</div>
             
             <div className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
               High Court of Judicature at<br/>Allahabad & Lucknow Bench
             </div>
           </div>
           
           <div style={{ width: '100px', height: '120px', borderRadius: '10px', overflow: 'hidden', background: '#333' }}>
             {/* Placeholder profile image from Unsplash */}
             <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=240" alt="Adarsh Trivedi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           </div>

           <button style={{ 
             position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)',
             width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0, 162, 255, 0.2)', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)',
             display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', cursor: 'pointer'
           }}>
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

      {/* Insights & Knowledge */}
      <div>
        <h3 className="bento-card-header" style={{ marginBottom: '15px' }}>Insights & Knowledge</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Card 1: Published Case Reports */}
          <div className="bento-card" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-10px', left: '10px', right: '10px', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px 10px 0 0' }}></div>
            <div style={{ position: 'absolute', top: '-20px', left: '20px', right: '20px', height: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px 10px 0 0' }}></div>
            
            <h4 style={{ fontSize: '1.1rem' }}>Published Case Reports</h4>
            <div className="text-muted text-xs" style={{ marginBottom: '20px' }}>View recent firm reports</div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
              <h5 style={{ fontWeight: '500', marginBottom: '5px' }}>Corporate Restructuring Analysis</h5>
              <div className="text-muted text-xs">Corporate Restructuring Analysis</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <span>Read more...</span>
              <ChevronRight size={16} />
            </div>
          </div>

          {/* Card 2: Legal Articles */}
          <div className="bento-card" style={{ position: 'relative' }}>
             <div style={{ position: 'absolute', top: '-10px', left: '10px', right: '10px', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px 10px 0 0' }}></div>
            
            <h4 style={{ fontSize: '1.1rem' }}>Legal Articles</h4>
            <div className="text-muted text-xs" style={{ marginBottom: '20px' }}>Interactive news cards</div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
              <h5 style={{ fontWeight: '500', marginBottom: '5px' }}>Recent RERA Precedents in Lucknow</h5>
              <div className="text-muted text-xs" style={{ marginBottom: '15px' }}>Recent RERA Precedents in Lucknow</div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                 <div style={{ width: '40%', height: '100%', background: 'var(--accent-blue)', borderRadius: '2px' }}></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Case Histories */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h3 className="bento-card-header" style={{ margin: 0 }}>Case Histories</h3>
            <div className="text-muted text-xs">Gallery</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={16}/></button>
            <button style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={16}/></button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
           {/* Artifact 1: Business Card Mockup (Using CSS styling for realism) */}
           <div className="bento-card" style={{ padding: 0, overflow: 'hidden', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d5d7d8' }}>
              <div style={{ 
                width: '60%', height: '40%', background: '#111', 
                boxShadow: '10px 10px 20px rgba(0,0,0,0.3)', 
                transform: 'rotate(-5deg) perspective(500px) rotateX(10deg) rotateY(-10deg)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '1px solid #333'
              }}>
                <div style={{ color: '#d4af37', fontSize: '0.8rem', fontWeight: 'bold' }}>Adarsh Trivedi</div>
                <div style={{ color: '#aaa', fontSize: '0.4rem', marginTop: '2px' }}>High Court of Judicature</div>
              </div>
           </div>

           {/* Artifact 2: Folder Mockup (Using CSS styling) */}
           <div className="bento-card" style={{ padding: 0, overflow: 'hidden', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeaea' }}>
              <div style={{ 
                width: '50%', height: '60%', background: '#c8b087', 
                boxShadow: '-10px 10px 20px rgba(0,0,0,0.2)', 
                transform: 'rotate(5deg) perspective(500px) rotateX(15deg) rotateY(10deg)',
                borderLeft: '4px solid #a38c62',
                borderBottom: '2px solid #a38c62',
                position: 'relative'
              }}>
                 {/* Folder Tab */}
                 <div style={{ position: 'absolute', top: '-10px', right: '0', width: '40%', height: '10px', background: '#c8b087', borderRadius: '4px 4px 0 0' }}></div>
                 <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#333', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', border: '1px solid #333', borderRadius: '50%', marginRight: '5px', verticalAlign: 'middle' }}></span>
                    prexisLegal
                 </div>
              </div>
           </div>
        </div>
      </div>

    </main>
  );
};

export default MainContent;
