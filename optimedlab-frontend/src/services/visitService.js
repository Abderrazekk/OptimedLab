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
};

export default visitService;
