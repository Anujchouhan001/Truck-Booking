import React, { useState } from 'react';
import axios from '../api/client';

export default function FinalPaymentSection({ load, onPaymentComplete }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const quoteAmount = load?.acceptedQuoteAmount || 0;
    const bookingFee = load?.bookingFee || 0;
    const finalAmount = Math.max(0, quoteAmount - bookingFee);

    // Only show for delivered loads that haven't completed final payment
    if (load?.status !== 'delivered' || load?.finalPaymentId) {
        return null;
    }

    // Only show for load owner
    const isOwner = true; // This component should only be rendered if user is owner

    const handlePayment = async () => {
        try {
            setLoading(true);
            setError(null);

            // Create final payment order
            const orderResponse = await axios.post('/api/payments/create-final-order', {
                loadId: load._id
            });

            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.message || 'Failed to create payment order');
            }

            // If no payment needed
            if (orderResponse.data.finalAmount === 0) {
                if (onPaymentComplete) onPaymentComplete();
                return;
            }

            const { order, key } = orderResponse.data;

            // Load Razorpay script if not loaded
            if (!window.Razorpay) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                document.body.appendChild(script);
                await new Promise(resolve => script.onload = resolve);
            }

            // Open Razorpay checkout
            const options = {
                key: key,
                amount: order.amount,
                currency: order.currency,
                name: 'TruckSuvidha',
                description: `Final Payment for Order`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // Verify payment
                        const verifyResponse = await axios.post('/api/payments/verify-final', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyResponse.data.success) {
                            if (onPaymentComplete) onPaymentComplete();
                        } else {
                            setError('Payment verification failed');
                        }
                    } catch (err) {
                        setError(err.response?.data?.message || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: load.postedBy?.name || '',
                    email: load.postedBy?.email || ''
                },
                theme: {
                    color: '#7C3AED'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.response?.data?.message || err.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Complete Payment
            </h2>

            <div className="mb-4">
                <p className="text-gray-600 mb-3">
                    Your delivery has been confirmed! Complete the final payment to finish the order.
                </p>

                <div className="bg-white rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Driver's Quote</span>
                        <span className="font-semibold">₹{quoteAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Booking Fee (Paid)</span>
                        <span className="font-semibold text-green-600">- ₹{bookingFee.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                        <span className="font-bold text-gray-800">Amount Due</span>
                        <span className="text-2xl font-bold text-purple-600">₹{finalAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </>
                ) : (
                    <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Pay ₹{finalAmount.toLocaleString()} Now
                    </>
                )}
            </button>

            <p className="mt-3 text-xs text-center text-gray-500">
                Secure payment powered by Razorpay
            </p>
        </div>
    );
}
