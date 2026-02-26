import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../store/slices/adminSlice';

function AdminOrdersPage() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
    } catch (error) {
      alert(error || 'Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Payment Success':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'Pending': 'Payment Success',
      'Payment Success': 'Shipped',
      'Shipped': 'Delivered',
    };
    return statusFlow[currentStatus] || null;
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-sm text-gray-400 mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by Order ID, User..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="col-span-2 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-gray-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-gray-400"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Payment Success">Payment Success</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">Loading orders...</p>
          </div>
        )}

        {/* No Orders */}
        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-600">No orders found</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <p className="font-mono text-sm font-medium text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Customer</p>
                          <p className="text-gray-700 font-medium">
                            {order.user?.name || 'Unknown'}
                          </p>
                          <p className="text-gray-400 text-xs">{order.user?.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Date</p>
                          <p className="text-gray-700">
                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Items</p>
                          <p className="text-gray-700">{order.items.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Total</p>
                          <p className="font-semibold text-gray-900">
                            ₹{order.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() =>
                          setExpandedOrder(expandedOrder === order._id ? null : order._id)
                        }
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap"
                      >
                        {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                      </button>

                      {/* Update Status Button */}
                      {getNextStatus(order.status) && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}
                          disabled={updatingOrder === order._id}
                          className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 whitespace-nowrap"
                        >
                          {updatingOrder === order._id
                            ? 'Updating...'
                            : `Mark as ${getNextStatus(order.status)}`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Details (Expandable) */}
                {expandedOrder === order._id && (
                  <div className="p-6 bg-gray-50">
                    {/* Items */}
                    <div className="mb-6">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                        Order Items
                      </p>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl">
                                📦
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-400">
                                ₹{item.price.toLocaleString()} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                        Shipping Address
                      </p>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                          {order.shippingAddress.address}
                        </p>
                        <p className="text-sm text-gray-700">
                          {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                          {order.shippingAddress.pincode}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          📞 {order.shippingAddress.phone}
                        </p>
                      </div>
                    </div>
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

export default AdminOrdersPage;