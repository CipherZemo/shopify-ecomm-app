import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';

function ProductsPage() {
  const dispatch = useDispatch();
  const { products, categories, pagination, loading } = useSelector((state) => state.products);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    page: 1,
    limit: 9,
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    // Remove empty values before sending to API
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    dispatch(fetchProducts(activeFilters));
  }, [filters, dispatch]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      page: 1,
      limit: 9,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
          <p className="text-sm text-gray-400 mt-1">
            {pagination.total || 0} products found
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">

        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 sticky top-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Filters</h2>
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-gray-700 transition"
              >
                Reset all
              </button>
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Category
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition ${
                    filters.category === ''
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleFilterChange('category', cat)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition ${
                      filters.category === cat
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
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

          {/* Products */}
          {!loading && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Prev
                  </button>

                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-9 h-9 text-sm rounded-lg border transition ${
                        filters.page === i + 1
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === pagination.pages}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

          {/* No Products */}
          {!loading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-medium text-gray-600">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
              <button
                onClick={handleReset}
                className="mt-4 text-sm text-gray-900 underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ProductsPage;