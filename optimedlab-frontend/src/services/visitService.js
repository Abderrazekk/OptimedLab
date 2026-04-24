import api from "./api";

const visitService = {
  async getVisits() {
    const response = await api.get("/visits");
    return response.data;
  },
  async createVisit(data) {
    const response = await api.post("/visits", data);
    return response.data;
  },
  // New endpoint to fetch all form data in one fast request
  async getFormData() {
    const response = await api.get("/visits/form-data");
    return response.data;
  },

  async updateVisit(id, data) {
    const response = await api.put(`/visits/${id}`, data);
    return response.data;
  },

  async deleteVisit(id) {
    const response = await api.delete(`/visits/${id}`);
    return response.data;
  },
};

export default visitService;
