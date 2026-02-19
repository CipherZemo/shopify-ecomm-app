import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';

function WishlistPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading } = useSelector((state) => state.wishlist);
  const { token } = useSelector((state) => state.auth);
  const { successMessage } = useSelector((state) => state.cart);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(fetchWishlist());
  }, [dispatch, token, navigate]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch({ type: 'cart/clearMessages' });
      }, 2000);
    }
  }, [successMessage, dispatch]);

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      dispatch(addToCart({ productId: product._id, quantity: 1 }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-sm text-gray-400 mt-1">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Empty Wishlist */}
        {products.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-5xl mb-4">💝</p>
            <p className="text-lg font-medium text-gray-600 mb-2">Your wishlist is empty</p>
            <p className="text-sm text-gray-400 mb-6">Add products you love to your wishlist!</p>
            <Link
              to="/products"
              className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Wishlist Items Grid */}
        {products.length > 0 && (
          <>
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
                ✓ {successMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const discountedPrice = product.discount
                  ? product.price - (product.price * product.discount) / 100
                  : product.price;

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition group"
                  >
                    {/* Image */}
                    <Link to={`/products/${product._id}`} className="relative block">
                      <div className="bg-gray-50 h-56 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={`http://localhost:5000${product.images[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
                            🛍️
                          </div>
                        )}
                      </div>

                      {/* Discount Badge */}
                      {product.discount > 0 && (
                        <span className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-full">
                          {product.discount}% OFF
                        </span>
                      )}

                      {/* Out of Stock Overlay */}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-500">Out of Stock</span>
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="p-4">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">
                        {product.category}
                      </span>
                      <Link
                        to={`/products/${product._id}`}
                        className="block text-sm font-semibold text-gray-800 mt-1 hover:underline"
                      >
                        {product.name}
                      </Link>

                      {/* Price */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-base font-bold text-gray-900">
                          ₹{discountedPrice.toLocaleString()}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-xs font-medium hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button
                          onClick={() => handleRemove(product._id)}
                          className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200 transition"
                          title="Remove from wishlist"
                        >
                          <span className="text-lg">🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to="/products"
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                ← Continue Shopping
              </Link>
              <Link
                to="/cart"
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
              >
                View Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;