import React, { useState, useEffect } from 'react';
import axios from '../api/client';

// Fee breakdown display component
function FeeBreakdown({ breakdown }) {
    if (!breakdown) return null;

    return (
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h4 className="font-semibold text-gray-700 text-sm mb-3">Fee Breakdown</h4>
            <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Base Booking Fee</span>
                    <span className="text-gray-800">₹{breakdown.baseFee}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Weight Fee</span>
                    <span className="text-gray-800">₹{breakdown.weightFee}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Material Handling Fee</span>
                    <span className="text-gray-800">₹{breakdown.materialFee}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Truck Type Fee</span>
                    <span className="text-gray-800">₹{breakdown.truckTypeFee}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                        <span className="text-gray-800">Total</span>
                        <span className="text-green-600">₹{breakdown.totalFee}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentModal({
    isOpen,
    onClose,
    loadDetails,
    onPaymentSuccess,
    onPaymentFailure
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const [calculatingFee, setCalculatingFee] = useState(false);
    const [feeBreakdown, setFeeBreakdown] = useState(null);

    // Calculate fee when modal opens
    useEffect(() => {
        if (isOpen && loadDetails) {
            calculateFee();
        }
    }, [isOpen, loadDetails]);

    // Load Razorpay script dynamically
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const calculateFee = async () => {
        setCalculatingFee(true);
        setError(null);
        try {
            const response = await axios.post('/api/payments/calculate-fee', loadDetails);
            setFeeBreakdown(response.data.feeBreakdown);
        } catch (err) {
            console.error('Error calculating fee:', err);
            setError('Failed to calculate booking fee');
        } finally {
            setCalculatingFee(false);
        }
    };

    const createOrder = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/payments/create-order', loadDetails);
            setOrderData(response.data);
            return response.data;
        } catch (err) {
            console.error('Error creating order:', err);
            setError(err.response?.data?.message || 'Failed to create payment order');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (paymentData) => {
        try {
            const response = await axios.post('/api/payments/verify', paymentData);
            return response.data;
        } catch (err) {
            console.error('Error verifying payment:', err);
            throw err;
        }
    };

    const handlePayment = async () => {
        try {
            const order = await createOrder();

            if (!order || !order.order) {
                throw new Error('Failed to create order');
            }

            const options = {
                key: order.key,
                amount: order.order.amount,
                currency: order.order.currency,
                name: 'TruckSuvidha',
                description: `Booking Fee: ${loadDetails.sourceCity} → ${loadDetails.destinationCity}`,
                order_id: order.order.id,
                handler: async function (response) {
                    try {
                        setLoading(true);
                        const verificationResult = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verificationResult.success) {
                            onPaymentSuccess(verificationResult);
                        } else {
                            onPaymentFailure('Payment verification failed');
                        }
                    } catch (err) {
                        onPaymentFailure(err.response?.data?.message || 'Payment verification failed');
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: loadDetails.contactName || '',
                    email: loadDetails.contactEmail || '',
                    contact: loadDetails.contactPhone || ''
                },
                notes: {
                    source: loadDetails.sourceCity,
                    destination: loadDetails.destinationCity,
                    material: loadDetails.material
                },
                theme: {
                    color: '#3B82F6'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response) {
                onPaymentFailure(response.error.description || 'Payment failed');
            });
            razorpay.open();

        } catch (err) {
            setError(err.message || 'Failed to initiate payment');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Confirm Booking</h3>
                                <p className="text-blue-100 text-sm">Pay booking fee to post your load</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Load Summary */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <span>📦</span> Load Details
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500">Route</span>
                                <p className="font-medium text-gray-800">{loadDetails.sourceCity} → {loadDetails.destinationCity}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Material</span>
                                <p className="font-medium text-gray-800">{loadDetails.material}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Truck Type</span>
                                <p className="font-medium text-gray-800">{loadDetails.truckType || 'Any'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Date</span>
                                <p className="font-medium text-gray-800">
                                    {loadDetails.scheduledDate ? new Date(loadDetails.scheduledDate).toLocaleDateString('en-IN') : '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Fee Breakdown */}
                    {calculatingFee ? (
                        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-gray-600">Calculating fee...</span>
                        </div>
                    ) : (
                        <FeeBreakdown breakdown={feeBreakdown} />
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Security Note */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Secure payment powered by Razorpay</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handlePayment}
                        disabled={loading || calculatingFee || !feeBreakdown}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </>
                        ) : (
                            <>
                                Pay ₹{feeBreakdown?.totalFee || '—'}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
