import api from "./api";

const notificationService = {
  getAll: async (page = 1) => {
    const res = await api.get("/notifications?page=" + page);
    return res.data;
  },
  markRead: async (id) => {
    const res = await api.put("/notifications/" + id + "/read");
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.put("/notifications/read-all");
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete("/notifications/" + id);
    return res.data;
  },
  clearAll: async () => {
    const res = await api.delete("/notifications/clear-all");
    return res.data;
  },
};

export default notificationService;
