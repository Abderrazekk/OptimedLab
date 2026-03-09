// src/services/productService.js
import api from "./api";

const productService = {
  async getProducts() {
    const response = await api.get("/products");
    return response.data;
  },

  async createProduct(data) {
    // data is FormData
    const response = await api.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async updateProduct(id, data) {
    const response = await api.put(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
