// src/components/products/ProductForm.jsx
import { useState, useEffect } from "react";
import supplierService from "../../services/supplierService";

const ProductForm = ({ product, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Other",
    stockQuantity: "",
    threshold: "5",
    supplier: "",
    sku: "",
    // <-- NEW: Location fields
    aisle: "",
    shelfNumber: "",
    binCode: "",
  });

  const [images, setImages] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [imagePreviews, setImagePreviews] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "Other",
        stockQuantity: product.stockQuantity || "",
        threshold: product.threshold || "5",
        supplier: product.supplier?._id || "",
        sku: product.sku || "",
        // <-- NEW: Load existing location
        aisle: product.shelfLocation?.aisle || "",
        shelfNumber: product.shelfLocation?.shelfNumber || "",
        binCode: product.shelfLocation?.binCode || "",
      });
      if (product.images && product.images.length > 0) {
        setImagePreviews(
          product.images.map((img) => {
            const apiUrl = import.meta.env.VITE_API_URL || "";
            const baseUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
            return `${baseUrl}/${img.replace(/^\//, "")}`;
          }),
        );
      }
    }
  }, [product]);

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const res = await supplierService.getSuppliers();
      setSuppliers(res.data);
    } catch (err) {
      console.error("Failed to load suppliers", err);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setImages(files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.supplier) newErrors.supplier = "Supplier is required";

    // ❌ DELETE OR COMMENT OUT THIS LINE:
    // if (!formData.aisle) newErrors.aisle = 'Aisle is required';

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("price", formData.price);
    submitData.append("category", formData.category);
    submitData.append("stockQuantity", formData.stockQuantity);
    submitData.append("threshold", formData.threshold);
    submitData.append("supplier", formData.supplier);
    submitData.append("sku", formData.sku);

    // ✅ THE FIX: Stringify the location object into a single field
    const locationObj = {
      aisle: formData.aisle ? formData.aisle.trim() : "",
      shelfNumber: Number(formData.shelfNumber) || 0,
      binCode: formData.binCode || "",
    };
    submitData.append("shelfLocation", JSON.stringify(locationObj));

    images.forEach((image) => {
      submitData.append("images", image);
    });

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full relative">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {product ? "Edit Product" : "Add New Product"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.name ? "border-red-500" : "border-gray-300"}`}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
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

            {/* Location UI - NEW SECTION */}
            <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200 mt-2 mb-2">
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Physical Storage Location (Digital Twin)
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Aisle (e.g., A, B)
                  </label>
                  {/* Find your Aisle input and update the placeholder */}
                  <input
                    type="text"
                    name="aisle"
                    value={formData.aisle}
                    onChange={handleChange}
                    placeholder="e.g., Cold Storage, Room 1" // <-- Update this placeholder!
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Shelf Number
                  </label>
                  <input
                    type="number"
                    name="shelfNumber"
                    value={formData.shelfNumber}
                    onChange={handleChange}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Bin / Box Code
                  </label>
                  <input
                    type="text"
                    name="binCode"
                    value={formData.binCode}
                    onChange={handleChange}
                    placeholder="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Price & Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                name="stockQuantity"
                disabled={!!product}
                value={formData.stockQuantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Threshold
              </label>
              <input
                type="number"
                name="threshold"
                value={formData.threshold}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.supplier ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description & Images */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
