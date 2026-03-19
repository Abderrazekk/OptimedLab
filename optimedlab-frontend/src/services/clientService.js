// src/services/clientService.js
import api from "./api";

const clientService = {
  async getClients() {
    const response = await api.get("/clients");
    return response.data;
  },

  async createClient(clientData) {
    // Explicitly set the header for file uploads
    const response = await api.post("/clients", clientData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async updateClient(id, clientData) {
    // Explicitly set the header for file uploads
    const response = await api.put(`/clients/${id}`, clientData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async deleteClient(id) {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};

export default clientService;
