import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/client';
import { useAuth } from '../auth/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LoadBoardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loads, setLoads] = useState([]);
  const [assignedLoads, setAssignedLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [quoteData, setQuoteData] = useState({ amount: '', message: '', estimatedDeliveryDays: '' });
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [filters, setFilters] = useState({
    sourceCity: '',
    destinationCity: '',
    material: '',
    truckType: ''
  });

  const isCustomer = user?.role === 'customer';
  const isDriver = user?.role === 'driver';
  const isAdmin = ['admin', 'superadmin'].includes(user?.role);

  useEffect(() => {
    if (!user) return;
    fetchLoads();
    if (isDriver) {
      fetchAssignedLoads();
    }
  }, [user]);

  const fetchLoads = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/loads');
      let fetchedLoads = res.data;

      if (isCustomer) {
        const userId = user.id || user._id;
        fetchedLoads = fetchedLoads.filter(load => {
          const loadOwnerId = load.postedBy?._id || load.postedBy;
          return loadOwnerId === userId;
        });
      }

      setLoads(fetchedLoads);
    } catch (error) {
      console.error('Error fetching loads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedLoads = async () => {
    try {
      const res = await axios.get('/api/loads');
      const userId = user.id || user._id;
      const assigned = res.data.filter(load => {
        const assignedId = load.assignedTo?._id || load.assignedTo;
        return assignedId === userId && ['assigned', 'picked_up', 'in_transit'].includes(load.status);
      });
      setAssignedLoads(assigned);
    } catch (error) {
      console.error('Error fetching assigned loads:', error);
    }
  };

  const handleQuoteClick = (load) => {
    setSelectedLoad(load);
    setQuoteData({ amount: '', message: '', estimatedDeliveryDays: '' });
    setShowQuoteModal(true);
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!selectedLoad || !quoteData.amount) return;

    setSubmittingQuote(true);
    try {
      await axios.post('/api/quotes', {
        loadId: selectedLoad._id,
        amount: Number(quoteData.amount),
        message: quoteData.message,
        estimatedDeliveryDays: quoteData.estimatedDeliveryDays ? Number(quoteData.estimatedDeliveryDays) : null
      });
      setShowQuoteModal(false);
      fetchLoads();
      alert('Quote submitted successfully!');
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert(error.response?.data?.message || 'Failed to submit quote');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleStatusChange = async (loadId, newStatus) => {
    setUpdatingStatus(loadId);
    try {
      await axios.put(`/api/loads/${loadId}/status`, {
        status: newStatus,
        note: `Status updated to ${newStatus} by driver`
      });
      fetchAssignedLoads();
      fetchLoads();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800',
      quoted: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-indigo-100 text-indigo-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-teal-100 text-teal-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredLoads = loads.filter(load => {
    return (
      (!filters.sourceCity || load.sourceCity.toLowerCase().includes(filters.sourceCity.toLowerCase())) &&
      (!filters.destinationCity || load.destinationCity.toLowerCase().includes(filters.destinationCity.toLowerCase())) &&
      (!filters.material || load.material?.toLowerCase().includes(filters.material.toLowerCase())) &&
      (!filters.truckType || load.truckType?.toLowerCase().includes(filters.truckType.toLowerCase()))
    );
  });

  // Filter available loads for drivers (open or quoted status only)
  const availableLoads = isDriver
    ? filteredLoads.filter(load => ['open', 'quoted'].includes(load.status))
    : filteredLoads;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-8">Please login to access the load board.</p>
          <div className="space-y-3">
            <Link to="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition">
              Login Now
            </Link>
            <Link to="/register" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold transition">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isCustomer ? 'My Posted Loads' : isDriver ? 'Load Board' : 'All Loads'}
          </h1>
          <p className="text-gray-600">
            {isCustomer ? 'View and manage your posted loads' : 'Browse available loads and manage assignments'}
          </p>
        </div>

        {/* Driver's Assigned Loads Section */}
        {isDriver && assignedLoads.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 mb-8 text-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Assigned Orders ({assignedLoads.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedLoads.map((load) => (
                <div key={load._id} className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">
                      {load.sourceCity} → {load.destinationCity}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(load.status)}`}>
                      {load.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-100 mb-4">
                    <div>📦 {load.material}</div>
                    <div>⚖️ {load.weightMT || 'N/A'} MT</div>
                    <div>📅 {new Date(load.scheduledDate).toLocaleDateString()}</div>
                    <div>🚛 {load.truckType || 'Any'}</div>
                  </div>

                  {/* Driver Status Update */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-blue-100">Update Status:</label>
                    <div className="flex gap-2 flex-wrap">
                      {load.status === 'assigned' && (
                        <button
                          onClick={() => handleStatusChange(load._id, 'picked_up')}
                          disabled={updatingStatus === load._id}
                          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs rounded-lg font-semibold transition disabled:opacity-50"
                        >
                          {updatingStatus === load._id ? 'Updating...' : 'Mark Picked Up'}
                        </button>
                      )}
                      {load.status === 'picked_up' && (
                        <button
                          onClick={() => handleStatusChange(load._id, 'in_transit')}
                          disabled={updatingStatus === load._id}
                          className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg font-semibold transition disabled:opacity-50"
                        >
                          {updatingStatus === load._id ? 'Updating...' : 'Mark In Transit'}
                        </button>
                      )}
                      {load.status === 'in_transit' && (
                        <button
                          onClick={() => handleStatusChange(load._id, 'delivered')}
                          disabled={updatingStatus === load._id}
                          className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded-lg font-semibold transition disabled:opacity-50"
                        >
                          {updatingStatus === load._id ? 'Updating...' : 'Mark Delivered'}
                        </button>
                      )}
                      <Link
                        to={`/load/${load._id}`}
                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg font-semibold transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Filters */}
        <div className="bg-white rounded-xl shadow-md p-3 mb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-blue-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
              </svg>
              <span className="font-semibold text-sm hidden sm:inline">Filters:</span>
            </div>
            <input
              type="text"
              placeholder="Source City"
              value={filters.sourceCity}
              onChange={(e) => setFilters({ ...filters, sourceCity: e.target.value })}
              className="flex-1 min-w-[100px] max-w-[140px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Destination"
              value={filters.destinationCity}
              onChange={(e) => setFilters({ ...filters, destinationCity: e.target.value })}
              className="flex-1 min-w-[100px] max-w-[140px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Material"
              value={filters.material}
              onChange={(e) => setFilters({ ...filters, material: e.target.value })}
              className="flex-1 min-w-[100px] max-w-[130px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Truck Type"
              value={filters.truckType}
              onChange={(e) => setFilters({ ...filters, truckType: e.target.value })}
              className="flex-1 min-w-[100px] max-w-[130px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {(filters.sourceCity || filters.destinationCity || filters.material || filters.truckType) && (
              <button
                onClick={() => setFilters({ sourceCity: '', destinationCity: '', material: '', truckType: '' })}
                className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-700 font-semibold">
            {isDriver ? 'Available Loads: ' : 'Showing: '}
            <span className="text-blue-600 text-xl">{availableLoads.length}</span>
          </p>
          {!isDriver && (
            <Link
              to="/post-load"
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-6 py-2 rounded-lg font-bold transition shadow-lg"
            >
              + Post Load
            </Link>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <LoadingSpinner
            message={isCustomer ? 'Loading your posted loads...' : 'Finding available loads...'}
            size="lg"
          />
        )}

        {/* Load Cards */}
        {!loading && (
          <div className="grid grid-cols-1 gap-4">
            {availableLoads.length > 0 ? (
              availableLoads.map((load) => (
                <div key={load._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-5 border border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Route Info */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">From</span>
                      </div>
                      <div className="text-lg font-bold text-gray-800 mb-2">{load.sourceCity}</div>
                      <div className="border-l-2 border-dashed border-gray-300 h-4 ml-1"></div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">To</span>
                      </div>
                      <div className="text-lg font-bold text-gray-800">{load.destinationCity}</div>
                    </div>

                    {/* Load Details */}
                    <div className="lg:col-span-6 grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Material</div>
                        <div className="font-semibold text-gray-800">{load.material || 'Others'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Weight</div>
                        <div className="font-semibold text-gray-800">{load.weightMT ? `${load.weightMT} MT` : 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Truck Type</div>
                        <div className="font-semibold text-gray-800">{load.truckType || 'Any'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Date</div>
                        <div className="font-semibold text-gray-800">
                          {new Date(load.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Load Type</div>
                        <div className="font-semibold text-gray-800">{load.type === 'full' ? 'Full' : 'Part'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Status</div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusColor(load.status)}`}>
                          {load.status?.replace('_', ' ') || 'Open'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-3 flex flex-col justify-center gap-2">
                      <Link
                        to={`/load/${load._id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition text-center text-sm"
                      >
                        View Details
                      </Link>
                      {(isDriver || isAdmin) && ['open', 'quoted'].includes(load.status) && (
                        <button
                          onClick={() => handleQuoteClick(load)}
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-bold transition text-sm"
                        >
                          Quote Now
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Booking Fee */}
                  {isCustomer && load.bookingFee && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-500">Booking Fee Paid</span>
                      <span className="text-sm font-semibold text-green-600">₹{load.bookingFee}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  {isCustomer ? 'No Posted Loads' : 'No Available Loads'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isCustomer
                    ? "You haven't posted any loads yet."
                    : isDriver
                      ? 'No loads available for quoting right now.'
                      : 'Try adjusting your filters.'}
                </p>
                {!isDriver && (
                  <Link
                    to="/post-load"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Post a Load
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {showQuoteModal && selectedLoad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Submit Quote</h2>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-2">
                {selectedLoad.sourceCity} → {selectedLoad.destinationCity}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>📦 {selectedLoad.material}</div>
                <div>⚖️ {selectedLoad.weightMT || 'N/A'} MT</div>
                <div>🚛 {selectedLoad.truckType || 'Any'}</div>
                <div>📅 {new Date(selectedLoad.scheduledDate).toLocaleDateString()}</div>
              </div>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Quote Amount (₹) *
                </label>
                <input
                  type="number"
                  value={quoteData.amount}
                  onChange={(e) => setQuoteData({ ...quoteData, amount: e.target.value })}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount in INR"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Delivery (Days)
                </label>
                <input
                  type="number"
                  value={quoteData.estimatedDeliveryDays}
                  onChange={(e) => setQuoteData({ ...quoteData, estimatedDeliveryDays: e.target.value })}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={quoteData.message}
                  onChange={(e) => setQuoteData({ ...quoteData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Any additional details..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuote || !quoteData.amount}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-lg font-bold transition disabled:opacity-50"
                >
                  {submittingQuote ? 'Submitting...' : 'Submit Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
