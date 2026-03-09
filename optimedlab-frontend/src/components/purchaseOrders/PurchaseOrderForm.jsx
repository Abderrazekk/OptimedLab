// src/components/purchaseOrders/PurchaseOrderForm.jsx
import { useState, useEffect } from 'react';
import supplierService from '../../services/supplierService';
import productService from '../../services/productService';

const PurchaseOrderForm = ({ purchaseOrder, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    supplier: '',
    items: [{ product: '', quantity: 1 }]
  });
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchSuppliersAndProducts();
  }, []);

  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        supplier: purchaseOrder.supplier?._id || '',
        items: purchaseOrder.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        }))
      });
    }
  }, [purchaseOrder]);

  const fetchSuppliersAndProducts = async () => {
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        supplierService.getSuppliers(),
        productService.getProducts()
      ]);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const handleSupplierChange = (e) => {
    setFormData({ ...formData, supplier: e.target.value });
    if (errors.supplier) setErrors({ ...errors, supplier: '' });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
    // Clear error for this item field
    const errorKey = `item-${index}-${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.supplier) newErrors.supplier = 'Supplier is required';
    formData.items.forEach((item, index) => {
      if (!item.product) newErrors[`item-${index}-product`] = 'Product required';
      if (!item.quantity || item.quantity <= 0) newErrors[`item-${index}-quantity`] = 'Quantity must be > 0';
    });
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {purchaseOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
            <select
              name="supplier"
              value={formData.supplier}
              onChange={handleSupplierChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.supplier ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select a supplier</option>
              {suppliers.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>}
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-gray-700">Items</h4>
              <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:text-blue-800">
                + Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <div className="flex-1">
                  <select
                    value={item.product}
                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${errors[`item-${index}-product`] ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select product</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-md ${errors[`item-${index}-quantity`] ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                <button type="button" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-800">
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              {purchaseOrder ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;