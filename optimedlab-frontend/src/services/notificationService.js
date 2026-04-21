import api from "./api";

const getNotifications = async (limit = 50, unreadOnly = false) => {
  const response = await api.get("/notifications", {
    params: { limit, unreadOnly },
  });
  return response.data;
};

const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

const markAllAsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};

const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};