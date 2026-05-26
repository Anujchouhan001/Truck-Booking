import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/client';
import { useAuth } from '../auth/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CustomerDashboard() {
  const [loads, setLoads] = useState([]);
  const [myLoads, setMyLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user should see all available loads (drivers, admins, superadmins)
  const canSeeAllLoads = user?.role === 'driver' || user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const loadsRes = await axios.get('/api/loads');
      // For non-customers, show all loads
      if (canSeeAllLoads) {
        setLoads(loadsRes.data.slice(0, 10));
      }
      // Filter user's own loads
      const userId = user?.id || user?._id;
      setMyLoads(loadsRes.data.filter(load => {
        const loadOwnerId = load.postedBy?._id || load.postedBy;
        return loadOwnerId === userId;
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner
          message="Loading your dashboard..."
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-orange-100/30 to-yellow-100/30 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-10 relative z-10">
        {/* Welcome Header - Gradient Banner */}
        <div className="relative mb-8 sm:mb-10 overflow-hidden rounded-3xl shadow-xl">
          {/* Main gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500"></div>
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>
          {/* Floating elements */}
          <div className="absolute top-4 right-8 w-20 h-20 bg-white/10 rounded-2xl rotate-12 hidden sm:block"></div>
          <div className="absolute bottom-4 right-32 w-12 h-12 bg-white/10 rounded-xl -rotate-12 hidden sm:block"></div>

          <div className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  <span className="text-white/90 text-xs font-medium">Dashboard Active</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                  Welcome back, {user?.name || 'Customer'}! 👋
                </h1>
                <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                  {canSeeAllLoads
                    ? 'Manage shipments and find freight opportunities'
                    : 'Manage your shipments and find the best transport solutions'
                  }
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-white/60 text-xs">Today's Date</div>
                  <div className="text-white font-semibold">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Modern Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mb-8 sm:mb-10">

          {/* Post New Load - Featured Card */}
          <Link
            to="/post-load"
            className="lg:col-span-5 group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-100"
          >
            {/* Colored accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500"></div>

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div>
                <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                  Popular
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                Post New Load
              </h3>
              <p className="text-gray-600 mb-6">
                Get instant quotes from 50,000+ verified transporters across India
              </p>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">T</div>
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">R</div>
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">+</div>
                </div>
                <span className="inline-flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                  Start Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* My Posted Loads Card */}
          <Link
            to="/load-board"
            className="lg:col-span-4 group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-100"
          >
            {/* Colored accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-all">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <div className="bg-blue-50 px-3 py-2 rounded-xl">
                  <span className="text-2xl font-bold text-blue-600">{myLoads.length}</span>
                  <span className="text-blue-400 text-xs block">Active</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                {canSeeAllLoads ? 'Browse Loads' : 'My Posted Loads'}
              </h3>
              <p className="text-gray-600 text-sm">
                {canSeeAllLoads ? 'View available freight opportunities' : 'View and manage your loads'}
              </p>
            </div>
          </Link>

          {/* Find Trucks Card */}
          <Link
            to="/truck-board"
            className="lg:col-span-3 group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-100"
          >
            {/* Colored accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

            <div className="p-6 sm:p-8">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 group-hover:scale-110 transition-all">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                Find Trucks
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Search available vehicles
              </p>

              {/* Live indicator */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <span className="text-emerald-600 text-xs font-medium">Live</span>
              </div>
            </div>
          </Link>
        </div>

        {/* My Loads Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Posted Loads</h2>
                <p className="text-gray-500 text-sm">Manage your shipment requests</p>
              </div>
            </div>
            <Link
              to="/post-load"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Post Load
            </Link>
          </div>

          {myLoads.length > 0 ? (
            <div className="space-y-4">
              {myLoads.map((load, index) => (
                <div
                  key={load._id}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-purple-50 rounded-2xl border border-gray-200 hover:border-indigo-200 p-4 sm:p-5 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      {/* Route visualization */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full"></div>
                            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-50"></div>
                          </div>
                          <span className="text-gray-900 font-bold">{load.sourceCity}</span>
                        </div>
                        <div className="flex-1 max-w-[80px] h-0.5 bg-gradient-to-r from-green-300 via-gray-300 to-purple-300"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full"></div>
                          <span className="text-gray-900 font-bold">{load.destinationCity}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg text-gray-700 text-sm border border-gray-200">
                          📦 {load.material}
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg text-gray-700 text-sm border border-gray-200">
                          ⚖️ {load.weightMT || 'N/A'} MT
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg text-gray-700 text-sm border border-gray-200">
                          📅 {new Date(load.scheduledDate).toLocaleDateString()}
                        </span>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${load.status === 'open' ? 'bg-green-100 text-green-700 border border-green-200' :
                            load.status === 'quoted' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              load.status === 'delivered' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                          {load.status}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/load/${load._id}`}
                      className="inline-flex items-center gap-2 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white px-5 py-2.5 rounded-xl font-semibold transition-all border-2 border-indigo-200 hover:border-indigo-600 group/btn"
                    >
                      View Details
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200">
                <span className="text-5xl opacity-50">📋</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No Loads Yet</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Start posting your transport requirements and get instant quotes</p>
              <Link
                to="/post-load"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Post Your First Load
              </Link>
            </div>
          )}
        </div>

        {/* Available Loads Section - Only for drivers, admins, superadmins */}
        {canSeeAllLoads && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Available Loads</h2>
                  <p className="text-gray-500 text-sm">Hot opportunities for you</p>
                </div>
              </div>
              <Link
                to="/load-board"
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 group"
              >
                View All
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="space-y-4">
              {loads.slice(0, 5).map((load, index) => (
                <div
                  key={load._id}
                  className="group bg-gradient-to-r from-gray-50 to-white hover:from-amber-50 hover:to-orange-50 rounded-2xl border border-gray-200 hover:border-amber-200 p-4 sm:p-5 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                        {load.sourceCity} → {load.destinationCity}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">📦 {load.material}</span>
                        <span className="inline-flex items-center gap-1">⚖️ {load.weightMT || 'N/A'} MT</span>
                        <span className="inline-flex items-center gap-1">📅 {new Date(load.scheduledDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to={`/load/${load._id}`}
                        className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all text-sm border border-gray-200 hover:border-gray-300"
                      >
                        View Details
                      </Link>
                      <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl font-semibold transition-all text-sm shadow-md shadow-amber-500/25 hover:shadow-amber-500/40">
                        Quote Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
