import api from "./axios"; // your existing axios instance

export const getNotifications = () => {
  return api.get("/api/notifications/");
};

export const getUnreadCount = () => {
  return api.get("/api/notifications/unread-count/");
};

export const markAsRead = (id) => {
  return api.post(`/api/notifications/${id}/read/`);
};
