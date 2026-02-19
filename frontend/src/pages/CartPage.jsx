import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, addToCart, removeFromCart } from '../store/slices/cartSlice';

function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, token, navigate]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(addToCart({ productId, quantity: newQuantity }));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-sm text-gray-400 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Empty Cart */}
        {items.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-lg font-medium text-gray-600 mb-2">Your cart is empty</p>
            <p className="text-sm text-gray-400 mb-6">Add some products to get started!</p>
            <Link
              to="/products"
              className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Cart with Items */}
        {items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const product = item.product;
                if (!product) return null;

                const discountedPrice = product.discount
                  ? product.price - (product.price * product.discount) / 100
                  : product.price;

                return (
                  <div
                    key={item.product._id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4"
                  >
                    {/* Image */}
                    <Link
                      to={`/products/${product._id}`}
                      className="shrink-0 w-24 h-24 bg-gray-50 rounded-lg overflow-hidden"
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`http://localhost:5000${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
                          🛍️
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link
                            to={`/products/${product._id}`}
                            className="font-semibold text-gray-900 hover:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-gray-400 mt-1">{product.category}</p>
                        </div>
                        <button
                          onClick={() => handleRemove(product._id)}
                          className="text-gray-400 hover:text-red-500 transition text-xl"
                          title="Remove from cart"
                        >
                          ×
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₹{(discountedPrice * item.quantity).toLocaleString()}
                          </p>
                          {product.discount > 0 && (
                            <p className="text-xs text-gray-400 line-through">
                              ₹{(product.price * item.quantity).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {item.quantity >= product.stock && (
                        <p className="text-xs text-orange-500 mt-2">
                          Max {product.stock} available
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
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
                    <span className="text-xs text-gray-400">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/products"
                  className="block text-center text-sm text-gray-600 hover:text-gray-900 transition mt-4"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;    