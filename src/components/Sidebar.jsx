import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Practice Areas */}
      <div className="bento-card">
        <h3 className="bento-card-header">Connect & Collaborate</h3>
        <div style={{ marginBottom: '15px', color: 'var(--text-primary)', fontWeight: '500' }}>Our Practice Areas</div>
        <ul className="list-unstyled">
          <li>Litigation & Dispute Resolution</li>
          <li>Arbitration Matters</li>
          <li>Criminal Matters</li>
          <li>Civil Matters</li>
          <li>Service Matters</li>
          <li>DRT Matters</li>
          <li>RERA Matters</li>
          <li>Medical Negligence Matters</li>
        </ul>
      </div>

      {/* Contact Details */}
      <div className="bento-card">
        <h3 className="bento-card-header">Contact Details line</h3>
        
        <div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
          <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Adarsh Trivedi</h4>
          <span className="text-muted text-sm">Advocat: details</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Phone size={20} className="text-muted" />
            <div>
              <div className="text-sm">Phone</div>
              <div style={{ color: 'var(--text-primary)' }}>7052099743</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Mail size={20} className="text-muted" />
            <div>
              <div className="text-sm">Email</div>
              <div style={{ color: 'var(--text-primary)' }}>trivediadarsh13@gmail.com</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <MapPin size={20} className="text-muted" style={{ marginTop: '5px' }} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="text-sm" style={{ fontWeight: '500', color: 'white' }}>Office</div>
                <div className="text-muted text-xs" style={{ lineHeight: '1.4' }}>
                  2nd Floor, Shri Ram Paras<br/>
                  Tower Semra,<br/>
                  Matiyari - Lucknow 226028<br/>
                  Landmark - Opp. BMW<br/>
                  Showroom
                </div>
              </div>
              {/* Map Placeholder */}
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '8px', 
                background: 'linear-gradient(45deg, #1A1C25, #222530)', 
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--glass-border)'
              }}>
                 {/* Abstract map lines */}
                 <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ opacity: 0.3 }}>
                   <path d="M0 20 L40 40 L60 10 L100 50 M20 100 L40 40 M60 10 L80 100" stroke="#00a2ff" strokeWidth="2" fill="none" />
                 </svg>
                 {/* Dot marker */}
                 <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '8px', background: '#e74c3c', borderRadius: '50%', boxShadow: '0 0 10px #e74c3c' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <button className="flat-btn">Client Consultation</button>
          <button className="flat-btn">Inter-Lawyer Network Portal</button>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
