import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers } from '../../store/slices/adminSlice';
import API from '../../api/axios';

function AdminUsersPage() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUsers({ search: searchTerm, page, limit: 10 }));
  }, [dispatch, searchTerm, page]);

  const handleViewDetails = async (userId) => {
    if (selectedUser === userId) {
      setSelectedUser(null);
      setUserDetails(null);
      return;
    }

    setSelectedUser(userId);
    setLoadingDetails(true);

    try {
      const { data } = await API.get(`/admin/users/${userId}`);
      setUserDetails(data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to load user details');
      setSelectedUser(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-sm text-gray-400 mt-1">
            {users.length} registered users
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">Loading users...</p>
          </div>
        )}

        {/* No Users */}
        {!loading && users.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-5xl mb-4">👥</p>
            <p className="text-gray-600">No users found</p>
          </div>
        )}

        {/* Users List */}
        {!loading && users.length > 0 && (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                {/* User Card */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              user.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {user.role === 'admin' ? '👑 Admin' : 'User'}
                          </span>
                          <span className="text-xs text-gray-400">
                            Joined {new Date(user.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDetails(user._id)}
                      className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      {selectedUser === user._id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* User Details (Expandable) */}
                {selectedUser === user._id && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    {loadingDetails ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Loading details...
                      </p>
                    ) : userDetails ? (
                      <div>
                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                          <div className="bg-white rounded-lg p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {userDetails.totalOrders || 0}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{userDetails.totalSpent?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Avg Order Value</p>
                            <p className="text-2xl font-bold text-gray-900">
                              ₹
                              {userDetails.totalOrders > 0
                                ? Math.round(userDetails.totalSpent / userDetails.totalOrders).toLocaleString()
                                : 0}
                            </p>
                          </div>
                        </div>

                        {/* Recent Orders */}
                        {userDetails.orders && userDetails.orders.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                              Recent Orders
                            </p>
                            <div className="space-y-3">
                              {userDetails.orders.map((order) => (
                                <div
                                  key={order._id}
                                  className="bg-white rounded-lg p-4 border border-gray-100 flex items-center justify-between"
                                >
                                  <div>
                                    <p className="font-mono text-sm font-medium text-gray-900">
                                      #{order._id.slice(-8).toUpperCase()}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                      ₹{order.totalAmount.toLocaleString()}
                                    </p>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${
                                        order.status === 'Delivered'
                                          ? 'bg-green-50 text-green-700'
                                          : order.status === 'Shipped'
                                          ? 'bg-blue-50 text-blue-700'
                                          : order.status === 'Cancelled'
                                          ? 'bg-red-50 text-red-700'
                                          : 'bg-yellow-50 text-yellow-700'
                                      }`}
                                    >
                                      {order.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No Orders */}
                        {userDetails.orders && userDetails.orders.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-8">
                            No orders yet
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-red-500 text-center py-4">
                        Failed to load user details
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <Link
          to="/admin"
          className="inline-block mt-6 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default AdminUsersPage;