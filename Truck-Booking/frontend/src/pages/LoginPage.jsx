import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token);
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-4 sm:py-6 relative overflow-hidden">
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 animate-gradient-slow" />

      {/* Floating Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full blur-3xl animate-float-orb" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-float-orb-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-300/20 to-blue-400/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Dot Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #4F46E5 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* 3D Animated Background Elements - Hidden on very small screens for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        {/* Moving Trucks */}
        <div className="absolute top-20 left-0 animate-truck-move-1">
          <svg width="120" height="60" viewBox="0 0 120 60" className="opacity-20">
            <rect x="30" y="20" width="60" height="30" fill="#4F46E5" rx="5" />
            <rect x="20" y="25" width="15" height="25" fill="#6366F1" rx="3" />
            <circle cx="35" cy="52" r="8" fill="#1F2937" />
            <circle cx="75" cy="52" r="8" fill="#1F2937" />
          </svg>
        </div>
        <div className="absolute top-40 left-0 animate-truck-move-2 hidden md:block">
          <svg width="100" height="50" viewBox="0 0 100 50" className="opacity-15">
            <rect x="25" y="15" width="50" height="25" fill="#818CF8" rx="4" />
            <rect x="15" y="20" width="12" height="20" fill="#A5B4FC" rx="2" />
            <circle cx="30" cy="42" r="6" fill="#1F2937" />
            <circle cx="62" cy="42" r="6" fill="#1F2937" />
          </svg>
        </div>

        {/* Floating Packages */}
        <div className="absolute top-1/4 right-10 sm:right-20 animate-package-float-1">
          <svg width="40" height="40" viewBox="0 0 60 60" className="opacity-20 sm:w-[60px] sm:h-[60px]">
            <rect x="10" y="10" width="40" height="40" fill="#F59E0B" rx="4" transform="rotate(15 30 30)" />
            <line x1="30" y1="10" x2="30" y2="50" stroke="#92400E" strokeWidth="2" />
            <line x1="10" y1="30" x2="50" y2="30" stroke="#92400E" strokeWidth="2" />
          </svg>
        </div>

        {/* Location Pins */}
        <div className="absolute top-1/3 left-1/4 animate-pin-bounce-1 hidden md:block">
          <svg width="40" height="50" viewBox="0 0 40 50" className="opacity-25">
            <path d="M20 5C13 5 8 10 8 17C8 27 20 40 20 40C20 40 32 27 32 17C32 10 27 5 20 5Z" fill="#EC4899" />
            <circle cx="20" cy="17" r="6" fill="white" />
          </svg>
        </div>

        {/* Circular Orbit Elements - Only on larger screens */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
          <div className="relative w-96 h-96">
            <div className="absolute inset-0 border-2 border-indigo-200 rounded-full opacity-20 animate-orbit-ring-1"></div>
            <div className="absolute inset-8 border-2 border-purple-200 rounded-full opacity-15 animate-orbit-ring-2"></div>
            <div className="absolute inset-16 border-2 border-pink-200 rounded-full opacity-10 animate-orbit-ring-3"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-6 lg:gap-8 items-center relative z-10">
        {/* Truck Illustration Section - Hidden on mobile and tablet */}
        <div className="hidden lg:flex flex-col items-center justify-center">
          <div className="relative">
            {/* Animated Truck */}
            <div className="animate-bounce-slow">
              <svg className="w-72 xl:w-96 h-72 xl:h-96" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Truck Body */}
                <rect x="150" y="200" width="200" height="120" fill="#4F46E5" rx="10" />
                <rect x="100" y="240" width="50" height="80" fill="#6366F1" rx="5" />
                {/* Cargo Container */}
                <rect x="160" y="140" width="180" height="60" fill="#818CF8" rx="8" />
                <line x1="200" y1="140" x2="200" y2="200" stroke="#4F46E5" strokeWidth="3" />
                <line x1="240" y1="140" x2="240" y2="200" stroke="#4F46E5" strokeWidth="3" />
                <line x1="280" y1="140" x2="280" y2="200" stroke="#4F46E5" strokeWidth="3" />
                {/* Windows */}
                <rect x="110" y="250" width="30" height="25" fill="#DBEAFE" rx="3" />
                {/* Wheels */}
                <circle cx="180" cy="330" r="25" fill="#1F2937" />
                <circle cx="180" cy="330" r="15" fill="#6B7280" />
                <circle cx="310" cy="330" r="25" fill="#1F2937" />
                <circle cx="310" cy="330" r="15" fill="#6B7280" />
                {/* Headlight */}
                <circle cx="95" cy="280" r="5" fill="#FCD34D" />
                {/* Road */}
                <line x1="50" y1="360" x2="450" y2="360" stroke="#9CA3AF" strokeWidth="4" strokeDasharray="20,10" />
              </svg>
            </div>
            {/* Floating Elements */}
            <div className="absolute top-10 left-10 animate-float hidden xl:block">
              <div className="bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Fast Delivery</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-20 right-10 animate-float hidden xl:block" style={{ animationDelay: '1s' }}>
              <div className="bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-xl xl:text-2xl font-bold text-gray-800 mb-2">Your Trusted Logistics Partner</h3>
            <p className="text-gray-600">Connecting transporters and shippers seamlessly</p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="w-full max-w-md mx-auto">
          {/* Logo/Brand */}
          <div className="text-center mb-2 sm:mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-full mb-2 shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">TruckSuvidha</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Welcome back! Please login to your account</p>
          </div>

          {/* Login Card with Glassmorphism */}
          <div className="glass-card rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 animate-glow">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Login</h2>

            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start text-sm">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-1.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out active:scale-[0.98]"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <div className="mt-4">
              <a
                href="/auth/google"
                className="w-full flex items-center justify-center gap-3 py-1.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </a>
            </div>

            {/* Sign Up Link */}
            <div className="mt-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>
              <div className="mt-3">
                <Link
                  to="/register"
                  className="w-full flex justify-center py-1.5 px-4 border border-indigo-600 rounded-lg shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out active:scale-[0.98]"
                >
                  Create new account
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-4 text-center text-xs text-gray-500">
            © 2025 TruckSuvidha. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
