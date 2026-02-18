import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';

function HomePage() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 6, sort: 'newest' }));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-200">

      {/* Hero Section */}
      <section className="bg-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
          <span className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-4">
            New Arrivals Available
          </span>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
            Shop the Latest <span className="text-gray-400">Trends</span>
          </h1>
          <p className="text-gray-500 mt-4 max-w-md text-base">
            Discover our curated collection of premium products across electronics, clothing, footwear and more.
          </p>
          <div className="flex gap-4 mt-8">
            <Link
              to="/products"
              className="bg-gray-900 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
            >
              Shop Now
            </Link>
            <Link
              to="/products"
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-sm text-gray-400 mt-1">Handpicked just for you</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            View all →
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="bg-gray-100 h-56" />
                <div className="p-4 space-y-2">
                  <div className="bg-gray-100 h-3 rounded w-1/3" />
                  <div className="bg-gray-100 h-4 rounded w-2/3" />
                  <div className="bg-gray-100 h-4 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* No Products */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-sm mt-1">Check back later!</p>
          </div>
        )}
      </section>

      {/* Banner Strip */}
      <section className="bg-gray-900 py-12 mt-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold text-white">Free Shipping on Orders Over ₹999</h3>
            <p className="text-gray-400 text-sm mt-1">On all orders placed within India</p>
          </div>
          <Link
            to="/products"
            className="bg-white text-gray-900 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition whitespace-nowrap"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;