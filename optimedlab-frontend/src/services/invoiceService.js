import api from './api';

const invoiceService = {
  async getInvoices() {
    const response = await api.get('/invoices');
    return response.data;
  },

  async getInvoiceById(id) {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  async createInvoiceFromQuote(quoteId) {
    const response = await api.post(`/invoices/from-quote/${quoteId}`);
    return response.data;
  },

  async updatePaymentStatus(id, paymentStatus) {
    const response = await api.put(`/invoices/${id}/payment`, { paymentStatus });
    return response.data;
  },

  async downloadInvoicePDF(id) {
    const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  }
};

export default invoiceService;