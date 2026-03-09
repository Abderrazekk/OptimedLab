// src/pages/PurchaseOrders.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import purchaseOrderService from '../services/purchaseOrderService';
import PurchaseOrderForm from '../components/purchaseOrders/PurchaseOrderForm';

const PurchaseOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const canEdit = user && (user.role === 'admin' || user.role === 'stock');
  const canView = user && (user.role === 'admin' || user.role === 'stock' || user.role === 'director');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getPurchaseOrders();
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedOrder(null);
    setShowForm(true);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setShowForm(true);
  };

  const handleDelete = async (id, poNumber) => {
    if (!window.confirm(`Delete purchase order ${poNumber}?`)) return;
    try {
      await purchaseOrderService.deletePurchaseOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleReceive = async (id) => {
    if (!window.confirm('Mark this order as received? This will update stock.')) return;
    try {
      await purchaseOrderService.receivePurchaseOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to receive order');
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedOrder) {
        await purchaseOrderService.updatePurchaseOrder(selectedOrder._id, data);
      } else {
        await purchaseOrderService.createPurchaseOrder(data);
      }
      setShowForm(false);
      fetchOrders();
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
          <h1 className="text-2xl font-semibold text-gray-900">Purchase Orders</h1>
          <p className="mt-2 text-sm text-gray-700">Manage supplier orders</p>
        </div>
        {canEdit && (
          <button
            onClick={handleAdd}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            New Purchase Order
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">PO Number</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Supplier</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Items</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created By</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{order.poNumber}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.supplier?.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {order.items.length} item(s)
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.createdBy?.name}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      {canEdit && order.status === 'pending' && (
                        <>
                          <button onClick={() => handleEdit(order)} className="text-blue-600 hover:text-blue-900 mr-3">
                            Edit
                          </button>
                          <button onClick={() => handleReceive(order._id)} className="text-green-600 hover:text-green-900 mr-3">
                            Receive
                          </button>
                          <button onClick={() => handleDelete(order._id, order.poNumber)} className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </>
                      )}
                      {!canEdit && order.status === 'pending' && (
                        <span className="text-gray-400">View only</span>
                      )}
                      {order.status === 'received' && (
                        <span className="text-gray-400">Received</span>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-3 py-8 text-center text-gray-500">
                      No purchase orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <PurchaseOrderForm
          purchaseOrder={selectedOrder}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default PurchaseOrders;