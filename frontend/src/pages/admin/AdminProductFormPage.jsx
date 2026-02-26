import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, clearSelectedProduct } from '../../store/slices/productSlice';
import API from '../../api/axios';

function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedProduct } = useSelector((state) => state.products);

  const isEditMode = !!id;

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    category: 'Electronics',
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchProductById(id));
    } else {
      dispatch(clearSelectedProduct());
    }
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (isEditMode && selectedProduct) {
      setForm({
        name: selectedProduct.name || '',
        description: selectedProduct.description || '',
        price: selectedProduct.price || '',
        discount: selectedProduct.discount || '',
        stock: selectedProduct.stock || '',
        category: selectedProduct.category || 'Electronics',
      });
      setExistingImages(selectedProduct.images || []);
    }
  }, [selectedProduct, isEditMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setImages(files);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.price || form.price <= 0) newErrors.price = 'Valid price is required';
    if (form.discount && (form.discount < 0 || form.discount > 100))
      newErrors.discount = 'Discount must be between 0-100';
    if (!form.stock || form.stock < 0) newErrors.stock = 'Valid stock is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('discount', form.discount || 0);
      formData.append('stock', form.stock);
      formData.append('category', form.category);

      // Add images if any
      images.forEach((image) => {
        formData.append('images', image);
      });

      if (isEditMode) {
        await API.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/admin/products');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/products')}
          className="mt-6 text-sm text-gray-600 hover:text-gray-900 transition pb-8"
        >
          ← Back to Products
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isEditMode ? 'Update product details' : 'Create a new product'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., iPhone 15 Pro"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detailed product description..."
                rows="4"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 ${
                  errors.description ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            {/* Price & Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 ${
                    errors.price ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={form.discount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="100"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 ${
                    errors.discount ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.discount && <p className="text-xs text-red-500 mt-1">{errors.discount}</p>}
              </div>
            </div>

            {/* Stock & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 ${
                    errors.stock ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 bg-white"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Household">Household</option>
                </select>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images {isEditMode ? '' : '*'} (Max 5)
              </label>

              {/* Existing Images (Edit Mode) */}
              {isEditMode && existingImages.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Current Images:</p>
                  <div className="flex gap-2">
                    {existingImages.map((img, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000${img}`}
                        alt={`Product ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload new images to replace existing ones
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                {images.length > 0 && `${images.length} file(s) selected`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-6 py-3 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminProductFormPage;