import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/client';
import { useAuth } from '../auth/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TruckBoardPage() {
  const { user } = useAuth();
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    truckType: '',
    minCapacity: '',
    location: ''
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    if (!user) {
      return; // Don't fetch if not logged in
    }
    fetchTrucks();
  }, [user]);

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-200/50 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-teal-200/50 rounded-full blur-3xl"></div>

          <div className="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-8">
              Please login to access the Truck Board and find available vehicles.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 px-6 rounded-xl font-semibold transition shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                Login Now
              </Link>
              <Link
                to="/register"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold transition"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/trucks');
      setTrucks(res.data);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ truckType: '', minCapacity: '', location: '' });
  };

  const filteredTrucks = trucks.filter(truck => {
    return (
      (!filters.truckType || truck.type?.toLowerCase().includes(filters.truckType.toLowerCase()) || truck.truckSize?.toLowerCase().includes(filters.truckType.toLowerCase())) &&
      (!filters.minCapacity || parseFloat(truck.capacityWeight) >= parseFloat(filters.minCapacity)) &&
      (!filters.location || truck.currentLocation?.toLowerCase().includes(filters.location.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <LoadingSpinner
          message="Loading available trucks..."
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-10 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Truck Board
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <span className="text-4xl">🚚</span>
                Available Trucks
              </h1>
              <p className="text-gray-600">Find the perfect truck for your transportation needs</p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-md border border-gray-100">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Grid View"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                title="List View"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
              </svg>
              <span className="font-semibold text-sm hidden sm:inline">Filters:</span>
            </div>
            <input
              type="text"
              name="truckType"
              placeholder="Truck Type"
              value={filters.truckType}
              onChange={handleFilterChange}
              className="flex-1 min-w-[120px] max-w-[180px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 focus:bg-white"
            />
            <input
              type="number"
              name="minCapacity"
              placeholder="Min Capacity (MT)"
              value={filters.minCapacity}
              onChange={handleFilterChange}
              className="flex-1 min-w-[120px] max-w-[150px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 focus:bg-white"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
              className="flex-1 min-w-[120px] max-w-[150px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 focus:bg-white"
            />
            {(filters.truckType || filters.minCapacity || filters.location) && (
              <button
                onClick={clearFilters}
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

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-700">
            Showing <span className="font-bold text-emerald-600 text-xl">{filteredTrucks.length}</span> available trucks
          </p>
        </div>

        {/* Truck Cards */}
        {filteredTrucks.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredTrucks.map((truck, index) => (
              <div
                key={truck._id}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200 hover:-translate-y-1 ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''}`}
              >
                {/* Truck Image */}
                <div className={`relative ${viewMode === 'list' ? 'sm:w-48 h-48 sm:h-auto' : 'h-48'} bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden`}>
                  {truck.truckPhoto ? (
                    <img
                      src={truck.truckPhoto}
                      alt={truck.plateNumber}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-6xl opacity-30">🚛</span>
                        <p className="text-gray-400 text-xs mt-2">No image</p>
                      </div>
                    </div>
                  )}
                  {/* Status badge overlay */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${truck.status === 'available'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                      }`}>
                      {truck.status === 'available' ? '✓ Available' : truck.status || 'Available'}
                    </span>
                  </div>
                  {/* GPS indicator */}
                  {truck.gpsAvailable && (
                    <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      GPS
                    </div>
                  )}
                </div>

                {/* Truck Details */}
                <div className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {truck.plateNumber || 'N/A'}
                      </h3>
                      <p className="text-gray-500 text-sm">{truck.model || truck.type || 'Standard Truck'}</p>
                    </div>
                  </div>

                  <div className={`grid gap-3 mb-5 ${viewMode === 'list' ? 'sm:grid-cols-3' : 'grid-cols-2'}`}>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <span>📦</span> Type
                      </div>
                      <p className="font-semibold text-gray-800">{truck.truckSize || truck.type || 'Standard'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <span>⚖️</span> Capacity
                      </div>
                      <p className="font-semibold text-gray-800">{truck.capacityWeight || 'N/A'} MT</p>
                    </div>
                    <div className={`bg-gray-50 rounded-xl p-3 ${viewMode === 'grid' ? 'col-span-2' : ''}`}>
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <span>📍</span> Location
                      </div>
                      <p className="font-semibold text-gray-800">{truck.currentLocation || 'India'}</p>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 group/btn">
                    Get Best Freight
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg p-12 sm:p-16 text-center border border-gray-100">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200">
              <span className="text-5xl opacity-40">🚚</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Trucks Available</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {filters.truckType || filters.minCapacity || filters.location
                ? 'No trucks match your current filters. Try adjusting your search criteria.'
                : 'No trucks are currently available. Please check back later.'}
            </p>
            {(filters.truckType || filters.minCapacity || filters.location) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
