import { useNavigate, useLocation } from "react-router-dom";

function PaymentFailedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✕</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Your payment could not be processed. Please try again.
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">ORDER ID</p>
            <p className="font-mono text-sm font-medium text-gray-900">
              #{orderId.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate(`/payment/${orderId}`)}
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
          >
            Retry Payment
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailedPage;
