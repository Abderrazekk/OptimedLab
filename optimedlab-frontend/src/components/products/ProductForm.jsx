// src/components/products/ProductForm.jsx
import { useState, useEffect } from 'react';
import supplierService from '../../services/supplierService';

const ProductForm = ({ product, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Other',
    stockQuantity: '',
    threshold: '5',
    supplier: '',
    sku: ''
  });
  const [images, setImages] = useState([]); // for file objects
  const [imagePreviews, setImagePreviews] = useState([]); // for preview
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'Other',
        stockQuantity: product.stockQuantity || '',
        threshold: product.threshold || '5',
        supplier: product.supplier?._id || '',
        sku: product.sku || ''
      });
      // If product has existing images, set previews (but not files)
      if (product.images && product.images.length > 0) {
        setImagePreviews(product.images.map(img => `${import.meta.env.VITE_API_URL}/${img}`));
      }
    }
  }, [product]);

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await supplierService.getSuppliers();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to load suppliers', error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    // Generate preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    else if (isNaN(formData.price) || formData.price <= 0) newErrors.price = 'Price must be a positive number';
    if (!formData.stockQuantity) newErrors.stockQuantity = 'Stock quantity is required';
    else if (isNaN(formData.stockQuantity) || formData.stockQuantity < 0) newErrors.stockQuantity = 'Stock must be a non-negative number';
    if (!formData.threshold) newErrors.threshold = 'Threshold is required';
    else if (isNaN(formData.threshold) || formData.threshold < 0) newErrors.threshold = 'Threshold must be a non-negative number';
    if (!formData.supplier) newErrors.supplier = 'Please select a supplier';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create FormData object
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    // Append images
    images.forEach(image => {
      submitData.append('images', image);
    });

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Existing fields (name, sku, price, category, stockQuantity, threshold, supplier, description) - unchanged */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Optional)</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                name="price"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Equipment">Equipment</option>
                <option value="Reagent">Reagent</option>
                <option value="Consumable">Consumable</option>
                <option value="Spare Part">Spare Part</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.stockQuantity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.stockQuantity && <p className="text-red-500 text-xs mt-1">{errors.stockQuantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Threshold *</label>
              <input
                type="number"
                name="threshold"
                value={formData.threshold}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.threshold ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.threshold && <p className="text-red-500 text-xs mt-1">{errors.threshold}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.supplier ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loadingSuppliers}
              >
                <option value="">Select a supplier</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>

            {/* New Image Upload Field */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (up to 5)</label>
              <input
                type="file"
                name="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {imagePreviews.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {imagePreviews.map((src, index) => (
                    <img key={index} src={src} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              {product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;