import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/client';
import { useAuth } from '../auth/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import QuotesSection from '../components/QuotesSection';
import FinalPaymentSection from '../components/FinalPaymentSection';

export default function LoadDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [load, setLoad] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchLoadDetails();
    }, [id]);

    const fetchLoadDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/loads/${id}`);
            setLoad(response.data.load);
            setPermissions(response.data.permissions);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        try {
            setActionLoading(true);
            await axios.put(`/api/loads/${id}/cancel`, { reason: cancelReason });
            setShowCancelModal(false);
            fetchLoadDetails();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel load');
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusChange = async () => {
        try {
            setActionLoading(true);
            await axios.put(`/api/loads/${id}/status`, {
                status: newStatus,
                note: statusNote
            });
            setShowStatusModal(false);
            setNewStatus('');
            setStatusNote('');
            fetchLoadDetails();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            open: 'bg-green-100 text-green-800 border-green-300',
            quoted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            assigned: 'bg-blue-100 text-blue-800 border-blue-300',
            picked_up: 'bg-indigo-100 text-indigo-800 border-indigo-300',
            in_transit: 'bg-purple-100 text-purple-800 border-purple-300',
            delivered: 'bg-teal-100 text-teal-800 border-teal-300',
            completed: 'bg-gray-100 text-gray-800 border-gray-300',
            cancelled: 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStatusIcon = (status) => {
        const icons = {
            open: '📋',
            quoted: '💬',
            assigned: '👤',
            picked_up: '📦',
            in_transit: '🚚',
            delivered: '📍',
            completed: '✅',
            cancelled: '❌'
        };
        return icons[status] || '📋';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <LoadingSpinner
                    message="Loading order details..."
                    size="lg"
                />
            </div>
        );
    }

    if (error && !load) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Order</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Order Details
                            </h1>
                            <p className="text-gray-600">Order ID: {load._id}</p>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(load.status)}`}>
                            <span>{getStatusIcon(load.status)}</span>
                            <span className="capitalize">{load.status.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Route Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Route Information
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Pickup</p>
                                            <p className="text-lg font-bold text-gray-800">{load.sourceCity}</p>
                                            {load.pickupAddress && <p className="text-sm text-gray-600">{load.pickupAddress}</p>}
                                        </div>
                                    </div>
                                    <div className="ml-2 border-l-2 border-dashed border-gray-300 h-8"></div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Delivery</p>
                                            <p className="text-lg font-bold text-gray-800">{load.destinationCity}</p>
                                            {load.deliveryAddress && <p className="text-sm text-gray-600">{load.deliveryAddress}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cargo Details */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                Cargo Details
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase mb-1">Material</p>
                                    <p className="font-bold text-gray-800">{load.material}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase mb-1">Type</p>
                                    <p className="font-bold text-gray-800 capitalize">{load.type} Load</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase mb-1">Weight</p>
                                    <p className="font-bold text-gray-800">{load.weightMT || 'N/A'} MT</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase mb-1">Truck Type</p>
                                    <p className="font-bold text-gray-800">{load.truckType || 'Any'}</p>
                                </div>
                            </div>
                            {load.notes && (
                                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <p className="text-sm font-medium text-yellow-800">📝 Notes:</p>
                                    <p className="text-sm text-yellow-700">{load.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Status History - Only for admins and drivers */}
                        {permissions.canChangeStatus && load.statusHistory?.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Status History
                                </h2>
                                <div className="space-y-3">
                                    {load.statusHistory.map((history, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className={`w-3 h-3 rounded-full mt-1.5 ${history.status === 'cancelled' ? 'bg-red-500' :
                                                history.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                                }`}></div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-gray-800 capitalize">
                                                        {history.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(history.changedAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                {history.note && <p className="text-sm text-gray-600">{history.note}</p>}
                                                {history.changedBy && (
                                                    <p className="text-xs text-gray-400">By: {history.changedBy.name || 'System'}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quotes Section */}
                        {['open', 'quoted', 'assigned'].includes(load?.status) && (
                            <QuotesSection load={load} onQuoteAccepted={fetchLoadDetails} />
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Payment Info */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Payment Details
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Booking Fee</span>
                                    <span className="font-bold text-gray-800">₹{load.bookingFee || 0}</span>
                                </div>

                                {/* Show accepted quote amount if available */}
                                {load.acceptedQuoteAmount && (
                                    <>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Accepted Quote</span>
                                            <span className="font-bold text-purple-600">₹{load.acceptedQuoteAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-green-50 -mx-2 px-2 rounded">
                                            <span className="text-gray-700 font-medium">Final Payment Due</span>
                                            <span className="font-bold text-green-600">
                                                ₹{Math.max(0, (load.acceptedQuoteAmount - (load.bookingFee || 0))).toLocaleString()}
                                            </span>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${load.paymentId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {load.paymentId ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Posted On</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(load.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Scheduled Date</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(load.scheduledDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Final Payment Section - Show when delivery is complete */}
                        {permissions.isOwner && load.status === 'delivered' && !load.finalPaymentId && (
                            <FinalPaymentSection load={load} onPaymentComplete={fetchLoadDetails} />
                        )}

                        {/* Contact Info - Hidden for customers viewing someone else's load */}
                        {(permissions.isOwner || permissions.canEdit) && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Contact Details
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase mb-1">Posted By</p>
                                        <p className="font-bold text-gray-800">{load.postedBy?.name || 'Unknown'}</p>
                                        <p className="text-sm text-gray-600">{load.postedBy?.email}</p>
                                    </div>
                                    {load.assignedTo && (
                                        <div className="pt-3 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase mb-1">Assigned Driver</p>
                                            <p className="font-bold text-gray-800">{load.assignedTo?.name}</p>
                                            <p className="text-sm text-gray-600">{load.assignedTo?.email}</p>
                                        </div>
                                    )}
                                    {load.contactPhone && (
                                        <div className="pt-3 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase mb-1">Phone</p>
                                            <a href={`tel:${load.contactPhone}`} className="font-bold text-blue-600 hover:text-blue-700">
                                                {load.contactPhone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
                            <div className="space-y-3">
                                {/* Change Status - Admin/Driver only */}
                                {permissions.canChangeStatus && !['cancelled', 'completed'].includes(load.status) && (
                                    <button
                                        onClick={() => {
                                            setNewStatus(load.status);
                                            setShowStatusModal(true);
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Update Status
                                    </button>
                                )}

                                {/* Cancel Button */}
                                {permissions.canCancel && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancel Order
                                    </button>
                                )}

                                {/* Info for customers who can't cancel */}
                                {permissions.isOwner && !permissions.canCancel && !['cancelled', 'completed'].includes(load.status) && (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                        <p className="text-sm text-yellow-800">
                                            ⚠️ This order cannot be cancelled as it has been {load.status.replace('_', ' ')}.
                                            Please contact support for assistance.
                                        </p>
                                    </div>
                                )}

                                {/* Cancelled Info */}
                                {load.status === 'cancelled' && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm text-red-800 font-medium">Order Cancelled</p>
                                        <p className="text-sm text-red-600 mt-1">
                                            Reason: {load.cancellationReason || 'No reason provided'}
                                        </p>
                                        <p className="text-xs text-red-500 mt-1">
                                            Cancelled on: {new Date(load.cancelledAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-modal-fade-in">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Cancel Order</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Reason for cancellation (optional)"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition mb-4"
                            rows={3}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition hover:bg-gray-50"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={actionLoading}
                                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                            >
                                {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Change Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-modal-fade-in">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Update Order Status</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                                <option value="open">Open</option>
                                <option value="quoted">Quoted</option>
                                <option value="assigned">Assigned</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="in_transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Note (optional)</label>
                            <textarea
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder="Add a note about this status change"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                rows={2}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusChange}
                                disabled={actionLoading}
                                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                            >
                                {actionLoading ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
