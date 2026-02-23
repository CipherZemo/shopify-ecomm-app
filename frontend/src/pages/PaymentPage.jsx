import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
} from "../store/slices/paymentSlice";
// import { clearCurrentOrder } from "../store/slices/orderSlice";

function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { razorpayOrder, loading, error } = useSelector(
    (state) => state.payment,
  );
  const { currentOrder } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    if (!currentOrder || currentOrder._id !== orderId) {
      // If no current order in state, redirect to orders page
      navigate("/orders");
      return;
    }

    // Create Razorpay order
    dispatch(createPaymentOrder(orderId));
  }, [orderId, currentOrder, dispatch, navigate]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!razorpayOrder || !window.Razorpay) return;

    setPaymentProcessing(true);

    const options = {
      key: razorpayOrder.razorpayKeyId,
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "Shopify Store",
      description: `Order #${orderId.slice(-8)}`,
      order_id: razorpayOrder.razorpayOrderId,
      handler: async function (response) {
        // Payment successful
        try {
          const result=await dispatch(
            verifyPayment({
              orderId: orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          ).unwrap();
          console.log("Payment verification result:", result);

          // Clear current order from state
          // dispatch(clearCurrentOrder());

          // Redirect to success page
          console.log('Redirecting to success page'); 
          navigate("/payment-success", { state: { orderId } });
        } catch (err) {
          console.log("Verification failed:", err);
          navigate("/payment-failed", { state: { orderId } });
        }
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      theme: {
        color: "#111827",
      },
      modal: {
        ondismiss: function () {
          // Payment cancelled
          setPaymentProcessing(false);
          console.log('Payment modal closed by user');
          // await dispatch(
          //   handlePaymentFailure({
          //     orderId: orderId,
          //     razorpayOrderId: razorpayOrder.razorpayOrderId,
          //     reason: "Payment cancelled by user",
          //   }),
          // );
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", async function (response) {
      console.log('Payment failed response:', response);
      // Payment failed
      setPaymentProcessing(false);
      await dispatch(
        handlePaymentFailure({
          orderId: orderId,
          razorpayOrderId: razorpayOrder.razorpayOrderId,
          reason: response.error.description,
        }),
      );
      console.log('Redirecting to failed page');
      navigate("/payment-failed", { state: { orderId } });
    });

    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md text-center">
          <p className="text-5xl mb-4">❌</p>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Payment Error
          </p>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/orders")}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
          >
            Go to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <p className="text-5xl mb-4">💳</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Payment
          </h1>
          <p className="text-sm text-gray-500">Order #{orderId?.slice(-8)}</p>
        </div>

        {currentOrder && (
          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Items</span>
                <span className="font-medium text-gray-900">
                  {currentOrder.items?.length || 0} items
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-lg text-gray-900">
                  ₹{currentOrder.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">
                DELIVERY ADDRESS
              </p>
              <p className="text-sm text-gray-700">
                {currentOrder.shippingAddress?.address}
              </p>
              <p className="text-sm text-gray-700">
                {currentOrder.shippingAddress?.city},{" "}
                {currentOrder.shippingAddress?.state} -{" "}
                {currentOrder.shippingAddress?.pincode}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                📞 {currentOrder.shippingAddress?.phone}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={!razorpayOrder || paymentProcessing}
          className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {paymentProcessing ? "Processing..." : "Pay Now"}
        </button>

        <button
          onClick={() => navigate("/cart")}
          disabled={paymentProcessing}
          className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition"
        >
          Cancel & Go to Carts
        </button>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            🔒 Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
