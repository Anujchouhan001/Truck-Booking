import React, { useState, useEffect } from 'react';
import axios from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userToEdit) => {
    // SuperAdmin accounts can only be edited by SuperAdmin
    if (userToEdit.role === 'superadmin' && user.role !== 'superadmin') {
      alert('Only SuperAdmin can edit SuperAdmin accounts!');
      return;
    }
    // Admins cannot edit other admins
    if (user.role === 'admin' && userToEdit.role === 'admin' && userToEdit._id !== user.id) {
      alert('Admins cannot edit other admin accounts!');
      return;
    }
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name || '',
      email: userToEdit.email,
      role: userToEdit.role
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${editingUser._id}`, formData);
      alert('User updated successfully!');
      setShowModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (userId, targetRole) => {
    if (userId === user.id) {
      alert('You cannot delete your own account!');
      return;
    }

    if (targetRole === 'superadmin') {
      alert('SuperAdmin accounts cannot be deleted!');
      return;
    }

    // Admins cannot delete other admins
    if (user.role === 'admin' && targetRole === 'admin') {
      alert('Admins cannot delete other admin accounts!');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`/api/users/${userId}`);
      alert('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRoleChange = async (userId, newRole, currentRole) => {
    if (userId === user.id) {
      alert('You cannot change your own role!');
      fetchUsers();
      return;
    }

    if (currentRole === 'superadmin' || newRole === 'superadmin') {
      alert('SuperAdmin role cannot be changed!');
      fetchUsers();
      return;
    }

    // Admins cannot promote to admin or change admin roles
    if (user.role === 'admin') {
      if (newRole === 'admin' || currentRole === 'admin') {
        alert('Only SuperAdmin can change Admin roles!');
        fetchUsers();
        return;
      }
    }

    try {
      await axios.put(`/api/users/${userId}`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const getUserStats = () => {
    const stats = {
      total: users.length,
      superadmins: users.filter(u => u.role === 'superadmin').length,
      admins: users.filter(u => u.role === 'admin').length,
      customers: users.filter(u => u.role === 'customer').length,
      drivers: users.filter(u => u.role === 'driver').length
    };
    return stats;
  };

  const stats = getUserStats();

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Manage Users</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Total Users: <span className="font-bold text-blue-600">{stats.total}</span></p>
        </div>

        {loading ? (
          <LoadingSpinner
            message="Loading users..."
            size="lg"
          />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">Total</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mt-0.5 sm:mt-1">{stats.total}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center hidden sm:flex">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">SuperAdmin</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mt-0.5 sm:mt-1">{stats.superadmins}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-100 rounded-full flex items-center justify-center hidden sm:flex">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">Admins</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mt-0.5 sm:mt-1">{stats.admins}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center hidden sm:flex">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">Customers</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mt-0.5 sm:mt-1">{stats.customers}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center hidden sm:flex">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">Drivers</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mt-0.5 sm:mt-1">{stats.drivers}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-full flex items-center justify-center hidden sm:flex">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3 sm:space-y-4">
              {users.map((usr) => (
                <div key={usr._id} className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base">
                      {usr.name ? usr.name[0].toUpperCase() : usr.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{usr.name || 'No Name'}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{usr.email}</p>
                        </div>
                        {usr.role === 'superadmin' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-600 text-white flex-shrink-0">
                            ⭐ SuperAdmin
                          </span>
                        ) : usr.role === 'admin' && user.role !== 'superadmin' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 flex-shrink-0">
                            Admin
                          </span>
                        ) : (
                          <select
                            value={usr.role}
                            onChange={(e) => handleRoleChange(usr._id, e.target.value, usr.role)}
                            disabled={usr._id === user.id}
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold border-0 cursor-pointer flex-shrink-0 ${usr.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              usr.role === 'driver' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              } ${usr._id === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <option value="customer">Customer</option>
                            <option value="driver">Driver</option>
                            {user.role === 'superadmin' && <option value="admin">Admin</option>}
                          </select>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Joined: {new Date(usr.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(usr)}
                      disabled={(usr.role === 'superadmin' && user.role !== 'superadmin') || (user.role === 'admin' && usr.role === 'admin' && usr._id !== user.id)}
                      className={`flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold text-xs sm:text-sm transition ${(usr.role === 'superadmin' && user.role !== 'superadmin') || (user.role === 'admin' && usr.role === 'admin' && usr._id !== user.id) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(usr._id, usr.role)}
                      disabled={usr._id === user.id || usr.role === 'superadmin' || (user.role === 'admin' && usr.role === 'admin')}
                      className={`flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold text-xs sm:text-sm transition ${usr._id === user.id || usr.role === 'superadmin' || (user.role === 'admin' && usr.role === 'admin') ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
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
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Name</th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Created</th>
                      <th className="px-4 xl:px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((usr, idx) => (
                      <tr key={usr._id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {usr.name ? usr.name[0].toUpperCase() : usr.email[0].toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-semibold text-gray-900">{usr.name || 'No Name'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {usr.email}
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          {usr.role === 'superadmin' ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-600 text-white">
                              ⭐ SuperAdmin
                            </span>
                          ) : usr.role === 'admin' && user.role !== 'superadmin' ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          ) : (
                            <select
                              value={usr.role}
                              onChange={(e) => handleRoleChange(usr._id, e.target.value, usr.role)}
                              disabled={usr._id === user.id}
                              className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${usr.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                usr.role === 'driver' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                } ${usr._id === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <option value="customer">Customer</option>
                              <option value="driver">Driver</option>
                              {user.role === 'superadmin' && <option value="admin">Admin</option>}
                            </select>
                          )}
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(usr.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-center text-sm space-x-1 xl:space-x-2">
                          <button
                            onClick={() => handleEdit(usr)}
                            disabled={(usr.role === 'superadmin' && user.role !== 'superadmin') || (user.role === 'admin' && usr.role === 'admin' && usr._id !== user.id)}
                            className={`bg-yellow-500 hover:bg-yellow-600 text-white px-3 xl:px-4 py-2 rounded-lg font-semibold text-xs transition ${(usr.role === 'superadmin' && user.role !== 'superadmin') || (user.role === 'admin' && usr.role === 'admin' && usr._id !== user.id) ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(usr._id, usr.role)}
                            disabled={usr._id === user.id || usr.role === 'superadmin' || (user.role === 'admin' && usr.role === 'admin')}
                            className={`bg-red-500 hover:bg-red-600 text-white px-3 xl:px-4 py-2 rounded-lg font-semibold text-xs transition ${usr._id === user.id || usr.role === 'superadmin' || (user.role === 'admin' && usr.role === 'admin') ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No users found in the system.
                </div>
              )}
            </div>

            {users.length === 0 && (
              <div className="block lg:hidden text-center py-8 bg-white rounded-xl shadow-lg">
                <p className="text-gray-500">No users found in the system.</p>
              </div>
            )}
          </>
        )}

        {/* Edit Modal */}
        {showModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Edit User</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Role
                  </label>
                  {editingUser?.role === 'superadmin' && user.role !== 'superadmin' ? (
                    <div className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-base text-red-700">
                      SuperAdmin
                      <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
                    </div>
                  ) : editingUser?.role === 'admin' && user.role !== 'superadmin' ? (
                    <div className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-base text-purple-700">
                      Admin
                      <span className="text-xs text-gray-500 ml-2">(Only SuperAdmin can change)</span>
                    </div>
                  ) : (
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    >
                      <option value="customer">Customer</option>
                      <option value="driver">Driver</option>
                      {user.role === 'superadmin' && <option value="admin">Admin</option>}
                      {user.role === 'superadmin' && <option value="superadmin">SuperAdmin</option>}
                    </select>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
