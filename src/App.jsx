import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LegalConnectHome from './components/LegalConnectHome';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CustomCursor from './components/CustomCursor';

import { ReactLenis } from '@studio-freight/react-lenis';

function App() {
  return (
    <ReactLenis root>
      <Router>
        <CustomCursor />
        <Routes>
          <Route path="/" element={<LegalConnectHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/portfolio" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ReactLenis>
  );
}

export default App;
