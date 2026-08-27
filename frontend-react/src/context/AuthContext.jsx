import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: null,
    email: null,
    username: null,
    role: null,
  });
  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');

    setAuth({
      isAuthenticated: !!token,
      token,
      email,
      username,
      role,
    });
  }, []);

  useEffect(() => {
    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  const login = useCallback((token, email, username, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('username', username);
    localStorage.setItem('userRole', role);
    setAuth({
      isAuthenticated: true,
      token,
      email,
      username,
      role,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setAuth({
      isAuthenticated: false,
      token: null,
      email: null,
      username: null,
      role: null,
    });
    navigate('/login');
  }, [navigate]);

  const value = { ...auth, login, logout, checkAuth };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
