import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const Dashboard = () => {
  return (
    <>
      <Header />
      <div className="dashboard-wrapper" style={{ marginTop: '80px' }}>
        <Sidebar />
        <MainContent />
      </div>
    </>
  );
};

export default Dashboard;
