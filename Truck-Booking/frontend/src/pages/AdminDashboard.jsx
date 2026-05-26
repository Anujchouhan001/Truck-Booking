import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/client';
import { useAuth } from '../auth/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLoads: 0,
    totalTrucks: 0,
    totalUsers: 0,
    recentLoads: []
  });

  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [loadsRes, trucksRes, usersRes] = await Promise.all([
        axios.get('/api/loads'),
        axios.get('/api/trucks'),
        axios.get('/api/users').catch(() => ({ data: [] })) // Users endpoint might fail for non-admin
      ]);

      setStats({
        totalLoads: loadsRes.data.length,
        totalTrucks: trucksRes.data.length,
        totalUsers: usersRes.data.length || 0,
        recentLoads: loadsRes.data.slice(0, 10)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner
          message="Loading admin dashboard..."
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        {/* Welcome Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-3 mb-1 sm:mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
              {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
            </h1>
            {isSuperAdmin && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                SUPER ADMIN
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome back, {user?.name || 'Admin'}!
            {isSuperAdmin && ' You have full access to all administrative features.'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Loads</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">{stats.totalLoads}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg hidden sm:block">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm font-medium">Total Trucks</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">{stats.totalTrucks}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg hidden sm:block">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm font-medium">Total Users</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">{stats.totalUsers || 'N/A'}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg hidden sm:block">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs sm:text-sm font-medium">Your Role</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 capitalize">
                  {isSuperAdmin ? 'Super' : 'Admin'}
                </p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg hidden sm:block">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - All admin pages shown to both Admin and SuperAdmin */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Link to="/admin/manage-loads" className="bg-white rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-xl transition transform hover:scale-[1.02] active:scale-[0.98]">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 sm:p-4 rounded-lg">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">Manage Loads</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">View & manage all loads</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/manage-trucks" className="bg-white rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-xl transition transform hover:scale-[1.02] active:scale-[0.98]">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 sm:p-4 rounded-lg">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">Manage Trucks</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">View & manage all trucks</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/manage-users" className="bg-white rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-xl transition transform hover:scale-[1.02] active:scale-[0.98]">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 sm:p-4 rounded-lg">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">Manage Users</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">View & manage all users</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/manage-social-media" className="bg-white rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-xl transition transform hover:scale-[1.02] active:scale-[0.98] relative">
              <div className="flex items-center">
                <div className="bg-pink-100 p-3 sm:p-4 rounded-lg">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">Social Media</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">Manage footer links</p>
                </div>
              </div>
              {isSuperAdmin && (
                <span className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  SUPER
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Recent Loads Table */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 lg:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Recent Loads</h2>

          {/* Mobile Card View */}
          <div className="block lg:hidden">
            <div className="space-y-3">
              {stats.recentLoads.map((load, idx) => (
                <div key={load._id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">#{idx + 1}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${load.status === 'open' ? 'bg-green-100 text-green-800' :
                      load.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {load.status}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
                    {load.sourceCity} → {load.destinationCity}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span>📦 {load.material}</span>
                    <span>📅 {new Date(load.scheduledDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentLoads.map((load, idx) => (
                  <tr key={load._id} className="hover:bg-gray-50">
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{idx + 1}</td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{load.sourceCity}</td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{load.destinationCity}</td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{load.material}</td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${load.status === 'open' ? 'bg-green-100 text-green-800' :
                        load.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {load.status}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(load.scheduledDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
