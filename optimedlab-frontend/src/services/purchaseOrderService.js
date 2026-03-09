// src/services/purchaseOrderService.js
import api from './api';

const purchaseOrderService = {
  async getPurchaseOrders() {
    const response = await api.get('/purchase-orders');
    return response.data;
  },

  async getPurchaseOrderById(id) {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  async createPurchaseOrder(data) {
    const response = await api.post('/purchase-orders', data);
    return response.data;
  },

  async updatePurchaseOrder(id, data) {
    const response = await api.put(`/purchase-orders/${id}`, data);
    return response.data;
  },

  async deletePurchaseOrder(id) {
    const response = await api.delete(`/purchase-orders/${id}`);
    return response.data;
  },

  async receivePurchaseOrder(id) {
    const response = await api.put(`/purchase-orders/${id}/receive`);
    return response.data;
  }
};

export default purchaseOrderService;