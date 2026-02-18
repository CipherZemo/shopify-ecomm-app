import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedProduct: product, loading } = useSelector((state) => state.products);
  const { token } = useSelector((state) => state.auth);
  const { loading: cartLoading, successMessage } = useSelector((state) => state.cart);
  const { products: wishlistProducts } = useSelector((state) => state.wishlist);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const isInWishlist = wishlistProducts.some((p) => p._id === product?._id);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch({ type: 'cart/clearMessages' });
      }, 2000);
    }
  }, [successMessage]);

  const handleAddToCart = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity }));
  };

  const handleBuyNow = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    await dispatch(addToCart({ productId: product._id, quantity }));
    navigate('/cart');
  };

  const handleWishlist = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-5xl mb-4">📦</p>
        <p className="text-lg font-medium text-gray-600">Product not found</p>
        <Link to="/products" className="mt-4 text-sm text-gray-900 underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-700">Products</Link>
          <span>/</span>
          <span className="text-gray-700">{product.name}</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">

            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="bg-gray-200 rounded-xl overflow-hidden mb-4 h-96 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000${product.images[selectedImage]}`}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-gray-300 text-6xl">🛍️</div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? 'border-gray-900'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={`http://localhost:5000${img}`}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">

              {/* Category & Wishlist */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  {product.category}
                </span>
                <button
                  onClick={handleWishlist}
                  className="text-2xl transition hover:scale-110"
                >
                  {isInWishlist ? '❤️' : '🤍'}
                </button>
              </div>

              {/* Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{discountedPrice.toLocaleString()}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="bg-green-50 text-green-600 text-xs font-medium px-2 py-1 rounded-full">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ In Stock ({product.stock} available)
                  </p>
                ) : (
                  <p className="text-sm text-red-600 font-medium">
                    ✗ Out of Stock
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                    >
                      −
                    </button>
                    <span className="text-lg font-medium w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-2">
                  {successMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || cartLoading}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {cartLoading ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || cartLoading}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {!token && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  Please <Link to="/login" className="underline">login</Link> to add to cart
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;