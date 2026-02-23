import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearPaymentState } from "../store/slices/paymentSlice";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const orderId = location.state?.orderId;

  useEffect(() => {
    dispatch(clearPaymentState());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✓</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Your order has been confirmed
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">ORDER ID</p>
            <p className="font-mono text-sm font-medium text-gray-900">
              #{orderId.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-8">
          You will receive an order confirmation email with details of your
          order.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/orders")}
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
