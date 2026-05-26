import React, { useState, useEffect } from 'react';
import axios from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ManageLoads() {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin or superadmin
    if (!['admin', 'superadmin'].includes(user?.role)) {
      navigate('/');
      return;
    }
    fetchLoads();
  }, [user, navigate]);

  const fetchLoads = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/loads');
      setLoads(response.data);
    } catch (error) {
      console.error('Error fetching loads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (loadId, newStatus) => {
    try {
      // Use the new status update endpoint
      await axios.put(`/api/loads/${loadId}/status`, {
        status: newStatus,
        note: `Status changed to ${newStatus} by ${user.name || 'Admin'}`
      });
      fetchLoads();
    } catch (error) {
      console.error('Error updating load status:', error);
      alert(error.response?.data?.message || 'Failed to update load status');
    }
  };

  const handleDelete = async (loadId) => {
    if (!window.confirm('Are you sure you want to delete this load? This action cannot be undone.')) return;

    try {
      await axios.delete(`/api/loads/${loadId}`);
      fetchLoads();
    } catch (error) {
      console.error('Error deleting load:', error);
      alert(error.response?.data?.message || 'Failed to delete load');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800 border-green-300',
      quoted: 'bg-blue-100 text-blue-800 border-blue-300',
      assigned: 'bg-purple-100 text-purple-800 border-purple-300',
      picked_up: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      in_transit: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      delivered: 'bg-teal-100 text-teal-800 border-teal-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredLoads = filter === 'all'
    ? loads
    : loads.filter(load => load.status === filter);

  const statusCounts = loads.reduce((acc, load) => {
    acc[load.status] = (acc[load.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Manage Loads</h1>
            <p className="text-gray-600 mt-1">View and manage all load orders</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Total: <span className="font-bold text-blue-600">{loads.length}</span>
            </span>
            <button
              onClick={fetchLoads}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All ({loads.length})
            </button>
            {['open', 'quoted', 'assigned', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 rounded-lg font-semibold text-sm transition capitalize whitespace-nowrap ${filter === status
                  ? getStatusColor(status) + ' border-2'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status.replace('_', ' ')} ({statusCounts[status] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner
            message="Loading all loads..."
            size="lg"
          />
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {filteredLoads.map((load) => (
                <div key={load._id} className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">#{load._id.slice(-6)}</span>
                    <select
                      value={load.status}
                      onChange={(e) => handleStatusChange(load._id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer ${getStatusColor(load.status)}`}
                    >
                      <option value="open">Open</option>
                      <option value="quoted">Quoted</option>
                      <option value="assigned">Assigned</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {load.sourceCity} → {load.destinationCity}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div>📦 {load.material}</div>
                    <div>⚖️ {load.weightMT || 'N/A'} MT</div>
                    <div>📅 {new Date(load.scheduledDate).toLocaleDateString()}</div>
                    <div>🚛 {load.truckType || 'Any'}</div>
                  </div>
                  {load.bookingFee && (
                    <div className="text-sm text-green-600 font-semibold mb-3">
                      💰 Booking Fee: ₹{load.bookingFee}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link
                      to={`/load/${load._id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition text-center"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(load._id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold text-sm transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Route</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Material</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Weight</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Truck</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Fee</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                      <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLoads.map((load, idx) => (
                      <tr key={load._id} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition`}>
                        <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                          {load._id.slice(-6)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {load.sourceCity}
                          </div>
                          <div className="text-xs text-gray-500">
                            → {load.destinationCity}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {load.material}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {load.weightMT || 'N/A'} MT
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {load.truckType || 'Any'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(load.scheduledDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {load.bookingFee ? `₹${load.bookingFee}` : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <select
                            value={load.status}
                            onChange={(e) => handleStatusChange(load._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${getStatusColor(load.status)}`}
                          >
                            <option value="open">Open</option>
                            <option value="quoted">Quoted</option>
                            <option value="assigned">Assigned</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/load/${load._id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDelete(load._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredLoads.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {filter === 'all' ? 'No loads found in the system.' : `No ${filter.replace('_', ' ')} loads found.`}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
