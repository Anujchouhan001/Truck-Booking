import React, { useState, useEffect } from 'react';
import axios from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function QuotesSection({ load, onQuoteAccepted }) {
    const { user } = useAuth();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Quote form state
    const [showQuoteForm, setShowQuoteForm] = useState(false);
    const [quoteAmount, setQuoteAmount] = useState('');
    const [quoteMessage, setQuoteMessage] = useState('');
    const [estimatedDays, setEstimatedDays] = useState('');

    // Modal state
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showAcceptModal, setShowAcceptModal] = useState(false);

    const isDriver = user?.role === 'driver' || user?.role === 'admin' || user?.role === 'superadmin';
    const isOwner = load?.postedBy?._id === user?.id || load?.postedBy === user?.id;
    const canSubmitQuote = isDriver && !isOwner && ['open', 'quoted'].includes(load?.status);
    const canViewQuotes = isOwner || ['admin', 'superadmin'].includes(user?.role);

    useEffect(() => {
        if (load?._id) {
            fetchQuotes();
        }
    }, [load?._id]);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/quotes/load/${load._id}`);
            setQuotes(response.data);
        } catch (err) {
            console.error('Error fetching quotes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitQuote = async (e) => {
        e.preventDefault();
        if (!quoteAmount || parseFloat(quoteAmount) <= 0) {
            setError('Please enter a valid quote amount');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await axios.post('/api/quotes', {
                loadId: load._id,
                amount: parseFloat(quoteAmount),
                message: quoteMessage,
                estimatedDeliveryDays: estimatedDays ? parseInt(estimatedDays) : null
            });
            setSuccess('Quote submitted successfully!');
            setShowQuoteForm(false);
            setQuoteAmount('');
            setQuoteMessage('');
            setEstimatedDays('');
            fetchQuotes();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit quote');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAcceptQuote = async () => {
        if (!selectedQuote) return;

        try {
            setSubmitting(true);
            setError(null);
            await axios.put(`/api/quotes/${selectedQuote._id}/accept`);
            setSuccess('Quote accepted! Driver has been assigned.');
            setShowAcceptModal(false);
            setSelectedQuote(null);
            fetchQuotes();
            if (onQuoteAccepted) onQuoteAccepted();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to accept quote');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectQuote = async (quoteId) => {
        try {
            await axios.put(`/api/quotes/${quoteId}/reject`);
            setSuccess('Quote rejected');
            fetchQuotes();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject quote');
        }
    };

    const handleWithdrawQuote = async (quoteId) => {
        try {
            await axios.delete(`/api/quotes/${quoteId}`);
            setSuccess('Quote withdrawn successfully');
            fetchQuotes();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to withdraw quote');
        }
    };

    const myQuote = quotes.find(q => q.transporter?._id === user?.id || q.transporter === user?.id);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-20 bg-gray-100 rounded"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Quotes ({quotes.length})
            </h2>

            {/* Alerts */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">✕</button>
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center justify-between">
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">✕</button>
                </div>
            )}

            {/* Driver's own quote */}
            {isDriver && myQuote && (
                <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-blue-800">Your Quote</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${myQuote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                myQuote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                            }`}>
                            {myQuote.status}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">₹{myQuote.amount.toLocaleString()}</p>
                    {myQuote.message && <p className="text-sm text-gray-600 mt-1">{myQuote.message}</p>}
                    {myQuote.estimatedDeliveryDays && (
                        <p className="text-sm text-gray-500 mt-1">Est. delivery: {myQuote.estimatedDeliveryDays} days</p>
                    )}
                    {myQuote.status === 'pending' && (
                        <button
                            onClick={() => handleWithdrawQuote(myQuote._id)}
                            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                        >
                            Withdraw Quote
                        </button>
                    )}
                    {myQuote.status === 'accepted' && (
                        <p className="mt-2 text-sm text-green-700 font-medium">
                            🎉 Congratulations! Your quote was accepted. Please proceed with the delivery.
                        </p>
                    )}
                </div>
            )}

            {/* Submit Quote Form - For drivers */}
            {canSubmitQuote && !myQuote && (
                <div className="mb-6">
                    {!showQuoteForm ? (
                        <button
                            onClick={() => setShowQuoteForm(true)}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Submit Your Quote
                        </button>
                    ) : (
                        <form onSubmit={handleSubmitQuote} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-4">Submit Your Quote</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quote Amount (₹) *
                                </label>
                                <input
                                    type="number"
                                    value={quoteAmount}
                                    onChange={(e) => setQuoteAmount(e.target.value)}
                                    placeholder="Enter your quote amount"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estimated Delivery (Days)
                                </label>
                                <input
                                    type="number"
                                    value={estimatedDays}
                                    onChange={(e) => setEstimatedDays(e.target.value)}
                                    placeholder="e.g., 2"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    min="1"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message (Optional)
                                </label>
                                <textarea
                                    value={quoteMessage}
                                    onChange={(e) => setQuoteMessage(e.target.value)}
                                    placeholder="Add any notes or special terms..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    rows={2}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowQuoteForm(false)}
                                    className="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Quote'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Quotes List - For load owner */}
            {canViewQuotes && quotes.length > 0 && (
                <div className="space-y-4">
                    {quotes.map((quote) => (
                        <div
                            key={quote._id}
                            className={`p-4 rounded-xl border-2 transition ${quote.status === 'accepted' ? 'border-green-300 bg-green-50' :
                                    quote.status === 'rejected' ? 'border-red-200 bg-red-50 opacity-60' :
                                        'border-gray-200 hover:border-purple-300 bg-white'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {quote.transporter?.name?.charAt(0) || 'D'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{quote.transporter?.name || 'Driver'}</p>
                                        <p className="text-sm text-gray-500">{quote.transporter?.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-purple-600">₹{quote.amount.toLocaleString()}</p>
                                    {quote.estimatedDeliveryDays && (
                                        <p className="text-sm text-gray-500">{quote.estimatedDeliveryDays} days delivery</p>
                                    )}
                                </div>
                            </div>

                            {quote.message && (
                                <p className="mt-3 text-gray-600 text-sm bg-gray-50 p-2 rounded">{quote.message}</p>
                            )}

                            <div className="mt-3 flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${quote.status === 'accepted' ? 'bg-green-200 text-green-800' :
                                        quote.status === 'rejected' ? 'bg-red-200 text-red-800' :
                                            'bg-yellow-200 text-yellow-800'
                                    }`}>
                                    {quote.status === 'accepted' ? '✓ Accepted' :
                                        quote.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                                </span>

                                {quote.status === 'pending' && isOwner && ['open', 'quoted'].includes(load?.status) && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRejectQuote(quote._id)}
                                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedQuote(quote);
                                                setShowAcceptModal(true);
                                            }}
                                            className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                )}

                                {quote.status === 'accepted' && (
                                    <span className="text-green-600 font-medium text-sm">
                                        ✓ Driver Assigned
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No quotes message */}
            {canViewQuotes && quotes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No quotes received yet</p>
                    <p className="text-sm">Drivers will submit their quotes here</p>
                </div>
            )}

            {/* Accept Quote Modal */}
            {showAcceptModal && selectedQuote && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Accept This Quote?</h3>

                        <div className="p-4 bg-purple-50 rounded-xl mb-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {selectedQuote.transporter?.name?.charAt(0) || 'D'}
                                </div>
                                <div>
                                    <p className="font-semibold">{selectedQuote.transporter?.name}</p>
                                    <p className="text-sm text-gray-500">{selectedQuote.transporter?.email}</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-purple-600">₹{selectedQuote.amount.toLocaleString()}</p>
                        </div>

                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
                            <p className="text-sm text-yellow-800">
                                <strong>💡 Note:</strong> By accepting this quote, the driver will be assigned to your load.
                                You'll pay ₹{(selectedQuote.amount - (load?.bookingFee || 0)).toLocaleString()} after delivery
                                (Quote amount minus your ₹{load?.bookingFee || 0} booking fee).
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAcceptModal(false)}
                                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAcceptQuote}
                                disabled={submitting}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                {submitting ? 'Processing...' : 'Accept Quote'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
