import api from './api';

const quoteService = {
  async getQuotes() {
    const response = await api.get('/quotes');
    return response.data;
  },

  async getQuoteById(id) {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },

  async createQuote(data) {
    const response = await api.post('/quotes', data);
    return response.data;
  },

  async updateQuote(id, data) {
    const response = await api.put(`/quotes/${id}`, data);
    return response.data;
  },

  async deleteQuote(id) {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  },

  async validateQuote(id) {
    const response = await api.put(`/quotes/${id}/validate`);
    return response.data;
  },

  async downloadQuotePDF(id) {
    const response = await api.get(`/quotes/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  }
};

export default quoteService;