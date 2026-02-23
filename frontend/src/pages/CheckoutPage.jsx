import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../store/slices/cartSlice";
import { createOrder, clearCurrentOrder } from "../store/slices/orderSlice";

function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { loading, error, currentOrder } = useSelector((state) => state.orders);
  const { token } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Clear any previous order from state when entering checkout
    dispatch(clearCurrentOrder());
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, token, navigate]);

  useEffect(() => {
    // Redirect to payment after order creation
    if (currentOrder) {
      navigate(`/payment/${currentOrder._id}`);
    }
  }, [currentOrder, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    dispatch(createOrder(form));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    const discount = item.product?.discount || 0;
    const discountedPrice = price - (price * discount) / 100;
    return sum + discountedPrice * item.quantity;
  }, 0);

  const totalDiscount = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    const discount = item.product?.discount || 0;
    const discountAmount = (price * discount) / 100;
    return sum + discountAmount * item.quantity;
  }, 0);

  const shippingCost = subtotal > 999 ? 0 : 50;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="text-lg font-medium text-gray-600 mb-2">
          Your cart is empty
        </p>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-400 mt-1">Complete your order</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Shipping Address
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address *
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House No., Street, Landmark"
                    rows="3"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition ${
                      errors.address ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition ${
                        errors.city ? "border-red-300" : "border-gray-200"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="Maharashtra"
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition ${
                        errors.state ? "border-red-300" : "border-gray-200"
                      }`}
                    />
                    {errors.state && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="400001"
                      maxLength="6"
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition ${
                        errors.pincode ? "border-red-300" : "border-gray-200"
                      }`}
                    />
                    {errors.pincode && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.pincode}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength="10"
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition ${
                        errors.phone ? "border-red-300" : "border-gray-200"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const discountedPrice = product.discount
                    ? product.price - (product.price * product.discount) / 100
                    : product.price;

                  return (
                    <div key={product._id} className="flex gap-3 text-sm">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={`http://localhost:5000${product.images[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            🛍️
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        ₹{(discountedPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ₹{(subtotal + totalDiscount).toLocaleString()}
                  </span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      −₹{totalDiscount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                  </span>
                </div>

                {subtotal < 999 && (
                  <p className="text-xs text-gray-400">
                    Add ₹{(999 - subtotal).toFixed(0)} more for free shipping!
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-gray-900">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition mt-3"
              >
                ← Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
