// src/services/supplierService.js
import api from "./api";

const supplierService = {
  async getSuppliers() {
    const response = await api.get("/suppliers");
    return response.data;
  },

  async createSupplier(formData) {
    const response = await api.post("/suppliers", formData, {
      headers: {
        // This forces Axios/Browser to handle the FormData boundary correctly
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async updateSupplier(id, formData) {
    const response = await api.put(`/suppliers/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async deleteSupplier(id) {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },
};

export default supplierService;
