// src/services/biService.js
import api from './api';

const biService = {
  async getDashboardStats(period = 'month') {
    const response = await api.get(`/bi/dashboard?period=${period}`);
    return response.data;
  },

  async generateReport(reportData) {
    const response = await api.post('/bi/reports', reportData, { responseType: 'blob' });
    return response.data;
  }
};

export default biService;