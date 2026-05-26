import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  // Use relative path for production (Vercel handles proxy), localhost for dev
  baseURL: import.meta.env.PROD ? '' : 'http://localhost:4000'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    // Only check for role changes on the current user's own data
    // This is triggered when the user fetches their own profile (e.g., /api/auth/me)
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);
        const currentUser = JSON.parse(storedUser);

        // Only force logout if:
        // 1. Response has user data with role AND
        // 2. Response data has an _id or id that matches current user's id AND
        // 3. The role is different
        if (response.data && response.data.role !== undefined) {
          const responseUserId = response.data._id || response.data.id;
          const currentUserId = currentUser._id || currentUser.id || decoded.id;

          // Only logout if THIS USER's role was changed (not when admin changes other users)
          if (responseUserId === currentUserId && response.data.role !== currentUser.role) {
            console.warn('Your role has been changed. Logging out...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(new Error('Role changed - please login again'));
          }
        }
      } catch (error) {
        console.error('Token verification error:', error);
      }
    }

    return response;
  },
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';

      // Don't redirect if the request is for login, register, or other auth endpoints
      // These endpoints are expected to return 401 for invalid credentials
      const isAuthRequest = requestUrl.includes('/api/auth/login') ||
        requestUrl.includes('/api/auth/register') ||
        requestUrl.includes('/auth/');

      // Don't redirect if we're already on login or register page
      const isOnAuthPage = window.location.pathname === '/login' ||
        window.location.pathname === '/register';

      // Only redirect if it's a protected resource request (user is logged in but token expired)
      if (!isAuthRequest && !isOnAuthPage && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
