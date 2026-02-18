import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition duration-300">

        {/* Image */}
        <div className="relative bg-gray-200 h-56 overflow-hidden">
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

          {/* Discount Badge */}
          {product.discount > 0 && (
            <span className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-full">
              {product.discount}% OFF
            </span>
          )}

          {/* Out of Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <span className="text-xs text-gray-400 uppercase tracking-wide">{product.category}</span>
          <h3 className="text-sm font-semibold text-gray-800 mt-1 truncate">{product.name}</h3>

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

          {/* Stock */}
          <p className="text-xs text-gray-400 mt-1">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;