import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    // Step management: 'email' | 'otp' | 'newPassword' | 'success'
    const [step, setStep] = useState('email');

    // OTP state
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpExpiresIn, setOtpExpiresIn] = useState(0);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const otpInputRefs = useRef([]);

    // New password state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Email validation
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Password validation
    const passwordValidation = {
        minLength: newPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(newPassword),
        hasLowercase: /[a-z]/.test(newPassword),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

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
            const pastedOtp = value.slice(0, 6).split('');
            const newOtp = [...otp];
            pastedOtp.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = digit;
                }
            });
            setOtp(newOtp);
            const focusIndex = Math.min(index + pastedOtp.length, 5);
            otpInputRefs.current[focusIndex]?.focus();
            return;
        }

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

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

    // Step 1: Send OTP to email
    async function handleSendOTP(e) {
        e.preventDefault();
        setError(null);

        if (!isEmailValid) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/api/otp/password-reset/send', { email });
            setOtpExpiresIn(res.data.expiresIn || 600);
            setStep('otp');
            setResendDisabled(true);
            setResendCountdown(30);
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    }

    // Step 2: Verify OTP - move to password step
    async function handleVerifyOTP(e) {
        e.preventDefault();
        setError(null);

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        // Just move to password step - we'll verify OTP with password reset
        setStep('newPassword');
    }

    // Step 3: Reset password with OTP verification
    async function handleResetPassword(e) {
        e.preventDefault();
        setError(null);

        if (!isPasswordValid) {
            setError('Please meet all password requirements');
            return;
        }

        if (!passwordsMatch) {
            setError('Passwords do not match');
            return;
        }

        const otpString = otp.join('');

        setLoading(true);
        try {
            await api.post('/api/otp/password-reset/verify', {
                email,
                otp: otpString,
                newPassword
            });
            setStep('success');
        } catch (e) {
            setError(e.response?.data?.message || e.message);
            // If OTP is invalid, go back to OTP step
            if (e.response?.data?.message?.includes('Invalid code') ||
                e.response?.data?.message?.includes('expired') ||
                e.response?.data?.message?.includes('No reset code')) {
                setStep('otp');
                setOtp(['', '', '', '', '', '']);
            }
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
            const res = await api.post('/api/otp/password-reset/send', { email });
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

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-6 relative overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 animate-gradient-slow" />

            {/* Floating Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full blur-3xl animate-float-orb" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-float-orb-reverse" />
            </div>

            {/* Dot Pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle, #4F46E5 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="w-full max-w-md mx-auto relative z-10">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-full mb-3 shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                    <p className="text-gray-600 text-sm mt-1">
                        {step === 'email' && "Enter your email to receive a reset code"}
                        {step === 'otp' && "Enter the 6-digit code sent to your email"}
                        {step === 'newPassword' && "Create your new password"}
                        {step === 'success' && "Password reset successful!"}
                    </p>
                </div>

                {/* Card */}
                <div className="glass-card rounded-2xl shadow-xl p-6 animate-glow">

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start text-sm">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Step 1: Email Input */}
                    {step === 'email' && (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm ${email && !isEmailValid ? 'border-red-300 bg-red-50' :
                                                email && isEmailValid ? 'border-green-300 bg-green-50' : 'border-gray-300'
                                            }`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isEmailValid}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Send Reset Code'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 'otp' && (
                        <>
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Code sent to <span className="font-medium text-indigo-600">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOTP}>
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
                                            className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>

                                <div className="text-center mb-4">
                                    {otpExpiresIn > 0 ? (
                                        <p className="text-sm text-gray-500">
                                            Code expires in <span className="font-medium text-indigo-600">{formatTime(otpExpiresIn)}</span>
                                        </p>
                                    ) : (
                                        <p className="text-sm text-red-500 font-medium">Code expired. Please request a new one.</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.join('').length !== 6 || otpExpiresIn === 0}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        'Verify Code'
                                    )}
                                </button>
                            </form>

                            <div className="mt-4 flex justify-center gap-4">
                                <button
                                    onClick={handleResendOTP}
                                    disabled={resendDisabled || loading}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    {resendDisabled ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError(null); }}
                                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                                >
                                    Change Email
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step 3: New Password */}
                    {step === 'newPassword' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm ${newPassword && !isPasswordValid ? 'border-amber-300 bg-amber-50' :
                                                newPassword && isPasswordValid ? 'border-green-300 bg-green-50' : 'border-gray-300'
                                            }`}
                                        placeholder="••••••••"
                                    />
                                </div>

                                {/* Password Requirements */}
                                {newPassword && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="grid grid-cols-2 gap-1">
                                            <div className={`flex items-center gap-1.5 text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                                                {passwordValidation.minLength ? '✓' : '○'} 8+ characters
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-xs ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                                                {passwordValidation.hasUppercase ? '✓' : '○'} Uppercase
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-xs ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-400'}`}>
                                                {passwordValidation.hasLowercase ? '✓' : '○'} Lowercase
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-xs ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                                                {passwordValidation.hasSpecialChar ? '✓' : '○'} Special char
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm ${confirmPassword && !passwordsMatch ? 'border-red-300 bg-red-50' :
                                                confirmPassword && passwordsMatch ? 'border-green-300 bg-green-50' : 'border-gray-300'
                                            }`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {confirmPassword && !passwordsMatch && (
                                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isPasswordValid || !passwordsMatch}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <div className="text-center py-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Password Reset Successful!</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Your password has been reset. You can now login with your new password.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                            >
                                Go to Login
                            </Link>
                        </div>
                    )}

                    {/* Back to Login Link - only show on email step */}
                    {step === 'email' && (
                        <div className="mt-6 text-center">
                            <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                ← Back to Login
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="mt-4 text-center text-xs text-gray-500">
                    © 2025 TruckSuvidha. All rights reserved.
                </p>
            </div>
        </div>
    );
}
