import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders, cancelOrder } from "../store/slices/orderSlice";
import { getSocket } from "../utils/socket";
import Toast from "../components/Toast";

function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const { orders, loading, successMessage } = useSelector(
    (state) => state.orders,
  );
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    dispatch(fetchMyOrders());
  }, [dispatch, token, navigate]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch({ type: "orders/clearMessages" });
      }, 3000);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket();
    if (!socket) return;

    // Listen for order status updates
    socket.on("orderStatusUpdate", ({ orderId, status }) => {
      console.log("📦 Order status updated:", orderId, status);
      setToast(`Order status changed to: ${status}`);
      dispatch(fetchMyOrders()); // Refresh orders list
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.off("orderStatusUpdate");
      }
    };
  }, [token, dispatch]);

  const handleCancelOrder = (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      dispatch(cancelOrder(orderId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Payment Success":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Shipped":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-400 mt-1">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
            ✓ {successMessage}
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-lg font-medium text-gray-600 mb-2">
              No orders yet
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Start shopping to see your orders here!
            </p>
            <Link
              to="/products"
              className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Orders List */}
        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">ORDER ID</p>
                      <p className="font-mono text-sm font-medium text-gray-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Date</p>
                      <p className="text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
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
                    <div className="text-right sm:text-left">
                      {order.status === "Pending" && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium transition"
                        >
                          Cancel Order
                        </button>
                      )}
                      {order.status === "Pending" && (
                        <button
                          onClick={() => navigate(`/payment/${order._id}`)}
                          className="block text-xs text-blue-600 hover:text-blue-800 font-medium transition mt-1"
                        >
                          Complete Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                    Items in this order
                  </p>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg shrink-0 flex items-center justify-center text-2xl">
                          📦
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            Qty: {item.quantity}
                          </p>
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

                  {/* Shipping Address */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Shipping Address
                    </p>
                    <p className="text-sm text-gray-700">
                      {order.shippingAddress.address}
                    </p>
                    <p className="text-sm text-gray-700">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} -{" "}
                      {order.shippingAddress.pincode}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      📞 {order.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toast Notification */}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}

export default OrdersPage;
