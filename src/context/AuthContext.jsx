import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_info');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('auth_token') || null;
  });

  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Set default axios header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    setAuthReady(true);
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const userData = res.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('user_info', JSON.stringify(userData));
      localStorage.setItem('auth_token', userData.token);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password, role = 'customer') => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role });
      const userData = res.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('user_info', JSON.stringify(userData));
      localStorage.setItem('auth_token', userData.token);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user_info');
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('You have been signed out successfully.');
  };

  const updateUserProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/auth/profile', profileData);
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('user_info', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password update failed'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authReady,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUserProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
