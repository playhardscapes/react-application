// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';

const AuthContext = createContext(null);

// Default admin user for first login - change this for production
const DEFAULT_ADMIN = {
  email: 'patrick@playhardscapes.com',
  password: 'admin123'  // You'll change this on first login
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        try {
          await api.get('/auth/verify');
        } catch (error) {
          // If token is invalid, clear auth
          handleLogout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      let response;
      
      // Check if this is first login with default admin
      if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        // Special handling for first login
        response = await api.post('/auth/first-login', { 
          email: DEFAULT_ADMIN.email,
          password: DEFAULT_ADMIN.password
        });
      } else {
        // Normal login
        response = await api.post('/auth/login', { email, password });
      }

      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);

      // If it was default login, redirect to password change
      if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        navigate('/change-password');
      } else {
        navigate('/');
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const handlePasswordReset = async (email) => {
    try {
      await api.post('/auth/reset-password-request', { email });
      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    try {
      const userData = await api.get('/auth/me');
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login: handleLogin,
    logout: handleLogout,
    requestPasswordReset: handlePasswordReset,
    changePassword: handlePasswordChange,
    refreshUser: refreshUserData,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;