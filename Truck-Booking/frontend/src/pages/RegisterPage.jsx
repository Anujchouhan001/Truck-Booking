import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // OTP verification state
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpInputRefs = useRef([]);

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  // Email validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // OTP expiry countdown
  useEffect(() => {
    if (otpExpiresIn > 0) {
      const timer = setInterval(() => {
        setOtpExpiresIn(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpExpiresIn]);

  // Resend countdown
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendCountdown]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      // Focus last filled input or last input
      const focusIndex = Math.min(index + pastedOtp.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Send OTP
  async function handleSendOTP(e) {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/otp/send', { email, password, name });
      setOtpExpiresIn(res.data.expiresIn || 600);
      setStep('otp');
      setResendDisabled(true);
      setResendCountdown(30); // 30 seconds before can resend
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  // Verify OTP
  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError(null);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/otp/verify', {
        email,
        otp: otpString,
        password,
        name
      });

      // Auto-login with returned token
      login(res.data.token);
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOTP() {
    if (resendDisabled) return;

    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/api/otp/resend', { email, password, name, purpose: 'registration' });
      setOtpExpiresIn(res.data.expiresIn || 600);
      setOtp(['', '', '', '', '', '']);
      setResendDisabled(true);
      setResendCountdown(30);
      otpInputRefs.current[0]?.focus();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  // Go back to form
  function handleBackToForm() {
    setStep('form');
    setOtp(['', '', '', '', '', '']);
    setError(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-4 sm:py-6 relative overflow-hidden">
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-100 to-indigo-100 animate-gradient-slow" />

      {/* Floating Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-float-orb" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 rounded-full blur-3xl animate-float-orb-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pink-300/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Dot Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #9333EA 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* 3D Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        {/* Moving Delivery Trucks */}
        <div className="absolute top-10 right-0 animate-truck-enter-right">
          <svg width="150" height="80" viewBox="0 0 150 80" className="opacity-20">
            <rect x="40" y="30" width="70" height="35" fill="#9333EA" rx="5" />
            <rect x="30" y="35" width="18" height="30" fill="#A855F7" rx="3" />
            <circle cx="45" cy="67" r="9" fill="#1F2937" />
            <circle cx="95" cy="67" r="9" fill="#1F2937" />
          </svg>
        </div>
        <div className="absolute top-1/3 right-0 animate-truck-enter-right-delayed">
          <svg width="130" height="70" viewBox="0 0 130 70" className="opacity-15">
            <rect x="35" y="25" width="60" height="30" fill="#C084FC" rx="4" />
            <rect x="25" y="30" width="15" height="25" fill="#E9D5FF" rx="2" />
            <circle cx="40" cy="57" r="8" fill="#1F2937" />
            <circle cx="82" cy="57" r="8" fill="#1F2937" />
          </svg>
        </div>

        {/* Warehouse/Building Silhouettes */}
        <div className="absolute bottom-0 left-10 animate-fade-scale">
          <svg width="100" height="120" viewBox="0 0 100 120" className="opacity-10">
            <rect x="10" y="40" width="80" height="80" fill="#7C3AED" rx="4" />
            <rect x="25" y="50" width="15" height="20" fill="#A78BFA" rx="2" />
            <rect x="60" y="50" width="15" height="20" fill="#A78BFA" rx="2" />
            <rect x="25" y="80" width="15" height="20" fill="#A78BFA" rx="2" />
            <rect x="60" y="80" width="15" height="20" fill="#A78BFA" rx="2" />
            <polygon points="50,20 10,40 90,40" fill="#6D28D9" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-20 animate-fade-scale-delayed">
          <svg width="120" height="140" viewBox="0 0 120 140" className="opacity-15">
            <rect x="15" y="50" width="90" height="90" fill="#A855F7" rx="5" />
            <rect x="30" y="65" width="18" height="25" fill="#DDD6FE" rx="2" />
            <rect x="72" y="65" width="18" height="25" fill="#DDD6FE" rx="2" />
            <rect x="30" y="100" width="18" height="25" fill="#DDD6FE" rx="2" />
            <rect x="72" y="100" width="18" height="25" fill="#DDD6FE" rx="2" />
            <polygon points="60,30 15,50 105,50" fill="#9333EA" />
          </svg>
        </div>

        {/* Flying Drones with Packages */}
        <div className="absolute top-20 left-1/4 animate-drone-fly-1">
          <svg width="80" height="60" viewBox="0 0 80 60" className="opacity-25">
            <circle cx="20" cy="15" r="8" fill="#EC4899" />
            <circle cx="60" cy="15" r="8" fill="#EC4899" />
            <rect x="25" y="10" width="30" height="8" fill="#DB2777" rx="2" />
            <rect x="32" y="20" width="16" height="16" fill="#F59E0B" rx="2" />
            <line x1="40" y1="20" x2="40" y2="36" stroke="#92400E" strokeWidth="1.5" />
            <line x1="32" y1="28" x2="48" y2="28" stroke="#92400E" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="absolute top-1/2 right-1/4 animate-drone-fly-2">
          <svg width="70" height="50" viewBox="0 0 70 50" className="opacity-20">
            <circle cx="17" cy="12" r="7" fill="#F472B6" />
            <circle cx="53" cy="12" r="7" fill="#F472B6" />
            <rect x="22" y="8" width="26" height="7" fill="#EC4899" rx="2" />
            <rect x="28" y="17" width="14" height="14" fill="#10B981" rx="2" />
            <line x1="35" y1="17" x2="35" y2="31" stroke="#065F46" strokeWidth="1.5" />
            <line x1="28" y1="24" x2="42" y2="24" stroke="#065F46" strokeWidth="1.5" />
          </svg>
        </div>

        {/* GPS/Signal Waves */}
        <div className="absolute top-1/4 right-1/3 animate-signal-pulse">
          <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-20">
            <circle cx="50" cy="50" r="5" fill="#8B5CF6" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="#8B5CF6" strokeWidth="2" opacity="0.6" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="#8B5CF6" strokeWidth="2" opacity="0.4" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="#8B5CF6" strokeWidth="2" opacity="0.2" />
          </svg>
        </div>

        {/* Connecting Network Lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path
            className="animate-network-pulse"
            d="M 50 150 L 200 100 L 400 180 L 600 120 L 800 200"
            stroke="url(#networkGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="10 5"
          />
          <path
            className="animate-network-pulse-reverse"
            d="M 100 400 L 300 350 L 500 420 L 700 380"
            stroke="url(#networkGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8 4"
          />
        </svg>

        {/* Rotating Logistics Hub */}
        <div className="absolute bottom-20 left-20 animate-hub-rotate">
          <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-15">
            <circle cx="60" cy="60" r="40" fill="none" stroke="#A855F7" strokeWidth="2" />
            <circle cx="60" cy="60" r="10" fill="#A855F7" />
            <line x1="60" y1="20" x2="60" y2="100" stroke="#A855F7" strokeWidth="1.5" />
            <line x1="20" y1="60" x2="100" y2="60" stroke="#A855F7" strokeWidth="1.5" />
            <line x1="30" y1="30" x2="90" y2="90" stroke="#A855F7" strokeWidth="1.5" />
            <line x1="90" y1="30" x2="30" y2="90" stroke="#A855F7" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-4 sm:gap-8 items-center">
        {/* Animated Delivery Truck Section */}
        <div className="hidden lg:flex flex-col items-center justify-center order-2 lg:order-1">
          <div className="relative">
            {/* Animated Delivery Scene */}
            <div className="relative">
              <svg className="w-96 h-96" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background elements */}
                <circle cx="400" cy="100" r="40" fill="#FCD34D" opacity="0.3" className="animate-pulse" />
                <circle cx="420" cy="120" r="20" fill="#FCD34D" opacity="0.2" className="animate-pulse" style={{ animationDelay: '0.5s' }} />

                {/* Modern Truck */}
                <g className="animate-slide">
                  {/* Cabin */}
                  <path d="M 100 250 L 100 280 L 90 290 L 90 320 L 160 320 L 160 250 Z" fill="#9333EA" />
                  <rect x="105" y="260" width="40" height="30" fill="#E9D5FF" rx="3" />

                  {/* Container */}
                  <rect x="160" y="240" width="160" height="80" fill="#A855F7" rx="8" />
                  <rect x="170" y="250" width="140" height="60" fill="#C084FC" rx="5" />

                  {/* Container details */}
                  <line x1="210" y1="250" x2="210" y2="310" stroke="#9333EA" strokeWidth="2" />
                  <line x1="250" y1="250" x2="250" y2="310" stroke="#9333EA" strokeWidth="2" />
                  <line x1="290" y1="250" x2="290" y2="310" stroke="#9333EA" strokeWidth="2" />

                  {/* Wheels */}
                  <circle cx="120" cy="330" r="28" fill="#1F2937" />
                  <circle cx="120" cy="330" r="18" fill="#6B7280" />
                  <circle cx="120" cy="330" r="10" fill="#9CA3AF" />

                  <circle cx="280" cy="330" r="28" fill="#1F2937" />
                  <circle cx="280" cy="330" r="18" fill="#6B7280" />
                  <circle cx="280" cy="330" r="10" fill="#9CA3AF" />

                  {/* Headlights */}
                  <circle cx="85" cy="300" r="6" fill="#FEF3C7" />
                  <circle cx="85" cy="310" r="5" fill="#FCA5A5" />
                </g>

                {/* Road */}
                <rect x="0" y="360" width="500" height="4" fill="#6B7280" />
                <line x1="0" y1="362" x2="500" y2="362" stroke="#FCD34D" strokeWidth="2" strokeDasharray="30,20" className="animate-road" style={{ animationDirection: 'reverse' }} />

                {/* Packages floating */}
                <g className="animate-float">
                  <rect x="380" y="180" width="40" height="40" fill="#FCD34D" rx="5" />
                  <line x1="390" y1="180" x2="390" y2="220" stroke="#92400E" strokeWidth="2" />
                  <line x1="370" y1="200" x2="410" y2="200" stroke="#92400E" strokeWidth="2" />
                </g>

                {/* Location pin */}
                <g className="animate-bounce" style={{ animationDelay: '0.3s' }}>
                  <path d="M 450 250 C 450 235 440 225 425 225 C 410 225 400 235 400 250 C 400 270 425 290 425 290 C 425 290 450 270 450 250 Z" fill="#EC4899" />
                  <circle cx="425" cy="245" r="8" fill="white" />
                </g>
              </svg>
            </div>

            {/* Feature Cards */}
            <div className="absolute top-5 -left-5 animate-float">
              <div className="bg-white rounded-xl shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Active Trucks</p>
                    <p className="text-lg font-bold text-gray-800">2,500+</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 -right-5 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="bg-white rounded-xl shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Verified</p>
                    <p className="text-lg font-bold text-gray-800">Secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Start Your Journey Today</h3>
            <p className="text-gray-600">Join thousands of transporters and shippers</p>
          </div>
        </div>

        {/* Register Form Section */}
        <div className="max-w-md w-full mx-auto order-1 lg:order-2">
          {/* Logo/Brand */}
          <div className="text-center mb-2 sm:mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-full mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Join Truck Booking</h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm">Create your account to get started</p>
          </div>

          {/* Register Card with Glassmorphism */}
          <div className="glass-card rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 animate-glow-purple">

            {step === 'form' ? (
              <>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Sign Up</h2>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSendOTP} className="space-y-3">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-150 ease-in-out text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

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
                        className={`block w-full pl-10 pr-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-150 ease-in-out text-sm ${email && !isEmailValid ? 'border-red-300 bg-red-50' : email && isEmailValid ? 'border-green-300 bg-green-50' : 'border-gray-300'
                          }`}
                        placeholder="you@example.com"
                      />
                      {email && !isEmailValid && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {email && isEmailValid && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {email && !isEmailValid && (
                      <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
                    )}
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
                        className={`block w-full pl-10 pr-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-150 ease-in-out text-sm ${password && !isPasswordValid ? 'border-amber-300 bg-amber-50' : password && isPasswordValid ? 'border-green-300 bg-green-50' : 'border-gray-300'
                          }`}
                        placeholder="••••••••"
                      />
                      {password && isPasswordValid && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Password Requirements */}
                    {password && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs font-medium text-gray-600 mb-1.5">Password must have:</p>
                        <div className="grid grid-cols-2 gap-1">
                          <div className={`flex items-center gap-1.5 text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordValidation.minLength ? (
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                              </svg>
                            )}
                            8+ characters
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordValidation.hasUppercase ? (
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                              </svg>
                            )}
                            Uppercase letter
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordValidation.hasLowercase ? (
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                              </svg>
                            )}
                            Lowercase letter
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordValidation.hasSpecialChar ? (
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                              </svg>
                            )}
                            Special character
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="#" className="text-purple-600 hover:text-purple-500 font-medium">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-purple-600 hover:text-purple-500 font-medium">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Continue with Email Verification'
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* OTP Verification Step */
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Verify Your Email</h2>
                  <p className="text-gray-600 text-sm mt-2">
                    We've sent a 6-digit code to<br />
                    <span className="font-medium text-purple-600">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start text-sm">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOTP}>
                  {/* OTP Input Boxes */}
                  <div className="flex justify-center gap-2 sm:gap-3 mb-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => otpInputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={e => handleOtpChange(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  {/* Timer */}
                  <div className="text-center mb-4">
                    {otpExpiresIn > 0 ? (
                      <p className="text-sm text-gray-500">
                        Code expires in <span className="font-medium text-purple-600">{formatTime(otpExpiresIn)}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-red-500 font-medium">Code expired. Please request a new one.</p>
                    )}
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6 || otpExpiresIn === 0}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Verify & Create Account'
                    )}
                  </button>
                </form>

                {/* Resend and Back buttons */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                  <button
                    onClick={handleResendOTP}
                    disabled={resendDisabled || loading}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resendDisabled ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                  </button>
                  <span className="hidden sm:block text-gray-300">|</span>
                  <button
                    onClick={handleBackToForm}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Change Email
                  </button>
                </div>
              </>
            )}

            {/* Divider - only show on form step */}
            {step === 'form' && (
              <>
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

                {/* Google Sign-Up Button */}
                <div className="mt-4">
                  <a
                    href="/auth/google"
                    className="w-full flex items-center justify-center gap-3 py-1.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out active:scale-[0.98]"
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
                    Sign up with Google
                  </a>
                </div>

                <div className="mt-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link
                      to="/login"
                      className="w-full flex justify-center py-1.5 px-4 border border-purple-600 rounded-lg shadow-sm text-sm font-medium text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
                    >
                      Sign in instead
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="mt-3 text-center text-xs text-gray-500">
            © 2025 Truck Booking. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
