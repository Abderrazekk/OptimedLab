// src/pages/Suppliers.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import supplierService from '../services/supplierService';
import SupplierForm from '../components/suppliers/SupplierForm';

const Suppliers = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const canEdit = user && (user.role === 'admin' || user.role === 'stock');
  const canView = user && (user.role === 'admin' || user.role === 'stock' || user.role === 'director');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const filtered = suppliers.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFiltered(filtered);
  }, [searchTerm, suppliers]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getSuppliers();
      setSuppliers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedSupplier(null);
    setShowForm(true);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete supplier ${name}?`)) return;
    try {
      await supplierService.deleteSupplier(id);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete supplier');
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedSupplier) {
        await supplierService.updateSupplier(selectedSupplier._id, data);
      } else {
        await supplierService.createSupplier(data);
      }
      setShowForm(false);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  if (!canView) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
          <p className="mt-2 text-sm text-gray-700">Manage your suppliers</p>
        </div>
        {canEdit && (
          <button onClick={handleAdd} className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Add Supplier
          </button>
        )}
      </div>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {error && <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">City</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filtered.map(s => (
                      <tr key={s._id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{s.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{s.contactPerson || '-'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{s.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{s.phone}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{s.address?.city || '-'}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {canEdit && (
                            <>
                              <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-900 mr-4">
                                Edit
                              </button>
                              <button onClick={() => handleDelete(s._id, s.name)} className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-3 py-8 text-center text-gray-500">No suppliers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <SupplierForm
          supplier={selectedSupplier}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Suppliers;