// src/services/stockService.js
import api from "./api";

const stockService = {
  async getStockList() {
    const response = await api.get("/stock");
    return response.data;
  },

  async getMovements(filters = {}) {
    const { page = 1, limit = 20, ...rest } = filters;
    const params = new URLSearchParams({ ...rest, page, limit }).toString();
    const response = await api.get(`/stock/movements?${params}`);
    return response.data;
  },

  async getAlerts() {
    const response = await api.get("/stock/alerts");
    return response.data;
  },

  async adjustStock(data) {
    const response = await api.post("/stock/adjust", data);
    return response.data;
  },
};

export default stockService;
