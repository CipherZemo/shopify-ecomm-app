import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../store/slices/adminSlice';

function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Overview of your store</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">Total Users</p>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.stats.totalUsers || 0}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">Total Products</p>
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.stats.totalProducts || 0}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">Total Orders</p>
              <span className="text-2xl">🛒</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.stats.totalOrders || 0}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ₹{stats?.stats.totalRevenue?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Alerts Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <p className="text-sm text-yellow-700 mb-2">Pending Orders</p>
            <p className="text-2xl font-bold text-yellow-900">{stats?.stats.pendingOrders || 0}</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
            <p className="text-sm text-orange-700 mb-2">Low Stock Products</p>
            <p className="text-2xl font-bold text-orange-900">{stats?.stats.lowStockProducts || 0}</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <p className="text-sm text-red-700 mb-2">Out of Stock</p>
            <p className="text-2xl font-bold text-red-900">{stats?.stats.outOfStockProducts || 0}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-gray-600 hover:text-gray-900">
                View all →
              </Link>
            </div>

            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.user?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{order.totalAmount?.toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-50 text-blue-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No recent orders</p>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Top Selling Products</h2>
              <Link to="/admin/products" className="text-sm text-gray-600 hover:text-gray-900">
                View all →
              </Link>
            </div>

            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-400">
                        {product.totalQuantity} units sold
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{product.totalRevenue?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No sales data yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/admin/products"
            className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:shadow-md transition"
          >
            <span className="text-3xl block mb-2">📦</span>
            <p className="text-sm font-medium text-gray-700">Manage Products</p>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:shadow-md transition"
          >
            <span className="text-3xl block mb-2">🛒</span>
            <p className="text-sm font-medium text-gray-700">Manage Orders</p>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:shadow-md transition"
          >
            <span className="text-3xl block mb-2">👥</span>
            <p className="text-sm font-medium text-gray-700">View Users</p>
          </Link>

          <Link
            to="/admin/products"
            className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:shadow-md transition"
          >
            <span className="text-3xl block mb-2">➕</span>
            <p className="text-sm font-medium text-gray-700">Add Product</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;