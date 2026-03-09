// src/pages/PurchaseOrders.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import purchaseOrderService from "../services/purchaseOrderService";
import PurchaseOrderForm from "../components/purchaseOrders/PurchaseOrderForm";
import PurchaseOrderDetailsModal from "../components/purchaseOrders/PurchaseOrderDetailsModal";

const PurchaseOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State for the Details Modal
  const [detailOrder, setDetailOrder] = useState(null);

  const canEdit = user && (user.role === "admin" || user.role === "stock");
  const canView =
    user &&
    (user.role === "admin" ||
      user.role === "stock" ||
      user.role === "director");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getPurchaseOrders();
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
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
    if (window.confirm(`Are you sure you want to delete PO #${poNumber}?`)) {
      try {
        await purchaseOrderService.deletePurchaseOrder(id);
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete PO");
      }
    }
  };

  const handleReceive = async (id) => {
    if (
      window.confirm(
        "Mark this PO as received? This will update stock quantities.",
      )
    ) {
      try {
        await purchaseOrderService.receivePurchaseOrder(id);
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to receive PO");
      }
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
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR");

  if (!canView) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage incoming stock from suppliers.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={handleAdd}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Create PO
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PO Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => setDetailOrder(order)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.poNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.supplier?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.supplier?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "received"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canEdit && order.status === "pending" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(order);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReceive(order._id);
                            }}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Receive
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(order._id, order.poNumber);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {!canEdit && order.status === "pending" && (
                        <span className="text-gray-400">View only</span>
                      )}
                      {order.status === "received" && (
                        <span className="text-gray-400">Received</span>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-500"
                    >
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

      {detailOrder && (
        <PurchaseOrderDetailsModal
          purchaseOrder={detailOrder}
          onClose={() => setDetailOrder(null)}
        />
      )}
    </div>
  );
};

export default PurchaseOrders;
