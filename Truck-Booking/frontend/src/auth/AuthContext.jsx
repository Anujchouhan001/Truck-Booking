import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Function to fetch and update user data
  const fetchUserData = useCallback(async (currentToken) => {
    if (currentToken) {
      try {
        // Decode token for basic info/validation
        const decoded = jwtDecode(currentToken);

        // Fetch full user profile to ensure we have avatar and latest data
        // This is crucial because avatar is no longer in the JWT to keep it small
        const response = await api.get('/api/users/me');
        const fullUser = { ...decoded, ...response.data };

        setUser(fullUser);
        localStorage.setItem('user', JSON.stringify(fullUser));
        return fullUser;
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // If 401, the interceptor might have already handled it, but good to be safe
        // Only logout if it's a token error
        if (error.response?.status === 401 || error.name === 'InvalidTokenError') {
          logout();
        }
      }
    }
    return null;
  }, []);

  useEffect(() => {
    fetchUserData(token);
  }, [token, fetchUserData]);

  function login(t) {
    setToken(t);
    localStorage.setItem('token', t);
    // Immediately fetch user data with new token
    fetchUserData(t);
  }

  // Function to refresh user data (can be called from components)
  async function refreshUser() {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      return await fetchUserData(currentToken);
    }
    return null;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return <AuthContext.Provider value={{ token, user, login, logout, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

