import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      handleLogout();
      setLoading(false);
      return;
    }

    if (token.startsWith('mock_')) {
      try {
        const payloadStr = atob(token.slice(5));
        const userData = JSON.parse(payloadStr);
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === 'admin');
      } catch (err) {
        console.error('Failed to parse mock token', err);
        handleLogout();
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // Try main path, fallback to alternate if necessary (due to serverless-http)
      let res = await fetch('/.netlify/functions/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 404) {
        res = await fetch('/.netlify/functions/api/auth/verify'.replace('/api/auth', '/auth'), {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
        setIsAdmin(data.user.role === 'admin');
      } else {
        // Token is invalid or expired
        handleLogout();
      }
    } catch (err) {
      console.error('Auth verification failed', err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.role === 'admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated'); // Clear legacy flag just in case
    localStorage.removeItem('isAdmin'); // Clear legacy flag
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isAuthenticated, loading, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
