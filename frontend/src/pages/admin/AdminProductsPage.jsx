import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import API from '../../api/axios';

function AdminProductsPage() {
  const dispatch = useDispatch();
  const { products, pagination, loading } = useSelector((state) => state.products);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    page: 1,
    limit: 10,
  });

  const [deleteLoading, setDeleteLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    dispatch(fetchProducts(activeFilters));
  }, [filters, dispatch]);

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;

    setDeleteLoading(productId);
    try {
      await API.delete(`/products/${productId}`);
      setSuccessMessage('Product deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Refresh products list
      dispatch(fetchProducts(filters));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return 'bg-red-50 text-red-700 border-red-200';
    if (stock < 10) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Back to Dashboard */}
        <Link
          to="/admin"
          className="inline-block mt-6 text-sm text-gray-600 hover:text-gray-900 pb-6"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-sm text-gray-400 mt-1">
              {pagination.total || 0} total products
            </p>
          </div>
          <Link
            to="/admin/products/create"
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
          >
            + Add Product
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
            ✓ {successMessage}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-gray-400"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-gray-400"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Footwear">Footwear</option>
              <option value="Household">Household</option>
            </select>
            <button
              onClick={() => setFilters({ search: '', category: '', page: 1, limit: 10 })}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No products found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-gray-50 last:border-0">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={`http://localhost:5000${product.images[0]}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                📦
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-xs">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-700">{product.category}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            ₹{product.price.toLocaleString()}
                          </p>
                          {product.discount > 0 && (
                            <span className="text-xs text-green-600">
                              {product.discount}% OFF
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full border ${getStockBadge(
                            product.stock
                          )}`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            disabled={deleteLoading === product._id}
                            className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                          >
                            {deleteLoading === product._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="border-t border-gray-100 p-4 flex items-center justify-between">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page === pagination.pages}
                className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}

export default AdminProductsPage;