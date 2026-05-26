import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { jwtDecode } from 'jwt-decode';

export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');
        const isNewUser = searchParams.get('new') === 'true';

        if (errorParam) {
            setStatus('error');
            setError(getErrorMessage(errorParam));
            setTimeout(() => navigate('/login'), 3000);
            return;
        }

        if (token) {
            try {
                // Decode token to check if it's a new user
                const decoded = jwtDecode(token);
                login(token);
                setStatus('success');

                // Check if user needs to complete profile (new Google user without password)
                if (isNewUser || (decoded.authProvider === 'google' && !decoded.passwordHash)) {
                    setTimeout(() => navigate('/complete-profile'), 1500);
                } else {
                    setTimeout(() => navigate('/'), 1500);
                }
            } catch (err) {
                setStatus('error');
                setError('Failed to process login');
                setTimeout(() => navigate('/login'), 3000);
            }
        } else {
            setStatus('error');
            setError('No authentication token received');
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [searchParams, login, navigate]);

    function getErrorMessage(errorCode) {
        switch (errorCode) {
            case 'google_auth_failed':
                return 'Google authentication failed. Please try again.';
            case 'token_generation_failed':
                return 'Failed to generate authentication token. Please try again.';
            default:
                return 'Authentication failed. Please try again.';
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
                {status === 'processing' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Signing you in...</h2>
                        <p className="text-gray-600">Please wait while we complete your authentication</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Successful!</h2>
                        <p className="text-gray-600">Setting up your account...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Failed</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <p className="text-sm text-gray-500">Redirecting to login page...</p>
                    </>
                )}
            </div>
        </div>
    );
}
